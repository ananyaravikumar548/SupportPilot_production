import json
import logging
from concurrent.futures import ThreadPoolExecutor
from mongoengine import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from django.utils import timezone
from accounts.models import User

from .models import Ticket, TicketMessage, Article, CategoryTaxonomy, SLAPolicy, Team, Application, AgentWorkflow, AgentExecution, JiraTicket, EmailLog
from .serializers import TicketSerializer
# Fixed: Imported get_rag_resolution alongside rag_store and load_kb_articles
from nlp_engine.rag_service import rag_store, load_kb_articles, get_rag_resolution, generate_solution
from nlp_engine.agents.orchestrator import MultiAgentOrchestrator
from services.jira_service import JiraService
from services.email_service import EmailService


logger = logging.getLogger(__name__)
# The request only queues work here; expensive RAG and integration calls never
# keep the customer waiting for a response.
automation_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="ticket-automation")

PRIORITY_RANK = {"URGENT": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
MANAGER_ROLES = ("agent_manager", "admin")


def _get_ticket(ticket_id):
    try:
        return Ticket.objects(id=ticket_id).first()  # type: ignore
    except Exception:
        return Ticket.objects.filter(id=ticket_id).first()  # type: ignore


def _assigned_team_for(category):
    category = (category or "").lower()
    if any(value in category for value in ("network", "vpn", "connectivity")):
        return "Network Team"
    if any(value in category for value in ("billing", "invoice", "payment")):
        return "Billing Team"
    if any(value in category for value in ("account", "access", "identity")):
        return "Identity & Access Team"
    return "IT Helpdesk"


def _record_customer_escalation(ticket):
    workflow = AgentWorkflow.objects.filter(ticket_id=str(ticket.id)).order_by('-started_at').first()
    if not workflow:
        workflow = AgentWorkflow(ticket_id=str(ticket.id), workflow_status="ESCALATED", current_agent="Customer Feedback")
        workflow.save()
    AgentExecution(
        workflow_id=workflow.workflow_id,
        agent_name="Customer Feedback",
        input_data={"ticket_id": str(ticket.id), "customer_feedback": ticket.customer_feedback},
        output_data={"message": "Customer rejected automated RAG resolution. Routing to human agent."},
        confidence=1.0,
        status="ESCALATED",
    ).save()


def _customer_email_for(ticket):
    customer = User.objects.filter(id=ticket.customer_id).first()
    return customer.email if customer else ""


def run_ticket_automation(ticket_id, user_email, subject, description, category, priority):
    """Run existing RAG, agent, Jira, and email integrations off the request thread."""
    ticket = _get_ticket(ticket_id)
    if not ticket:
        logger.error("Ticket %s disappeared before automation started", ticket_id)
        return

    try:
        ticket.status = "IN_PROGRESS"
        ticket.updated_at = timezone.now()
        ticket.save()

        # Keep the existing integration order and service implementations intact.
        load_kb_articles()
        EmailService.send_ticket_created(ticket_id, user_email, subject)
        JiraService.create_issue(
            ticket_id=ticket_id,
            title=subject,
            description=description,
            priority=priority,
        )

        rag_resolution = get_rag_resolution(subject, description)
        workflow_result = MultiAgentOrchestrator().run_workflow(
            ticket_id=ticket_id,
            title=subject,
            description=description,
            category=category,
        )
        suggested_steps = rag_resolution.get("suggested_action_steps", [])
        ai_solution = generate_solution(subject, description)
        ticket = _get_ticket(ticket_id)
        if not ticket:
            return
        ticket.ai_resolution = suggested_steps
        ticket.ai_solution = ai_solution

        # Customer feedback wins over a workflow that happened to complete while
        # the customer was requesting human support.
        if ticket.status == "ESCALATED" or ticket.requires_human_review:
            ticket.updated_at = timezone.now()
            ticket.save()
            return

        # Persist the AI confidence from the RAG resolution so the manager
        # dashboard can sort the unassigned queue by diagnosis confidence.
        try:
            ticket.ai_confidence = float(rag_resolution.get("confidence", 0.0)) / 100.0
        except (TypeError, ValueError):
            ticket.ai_confidence = 0.0

        ai_confidence = ticket.ai_confidence

        # NEW: Apply 75% confidence threshold routing
        from tickets.services.routing_service import process_and_assign_ticket

        if workflow_result.get("status") == "COMPLETED":
            # Workflow completed - now apply confidence threshold
            process_and_assign_ticket(ticket, ai_confidence)
            # If ticket was AI_RESOLVED, send resolution email
            if ticket.status == 'AI_RESOLVED':
                ticket.updated_at = timezone.now()
                ticket.save()
                JiraService.update_issue_status(ticket_id, "Done")
                email_result = EmailService.send_resolution(
                    ticket_id,
                    user_email,
                    ai_solution,
                    ai_confidence=ai_confidence,
                    confirm_url=f"http://localhost:3000/customer/tickets?ticket={ticket_id}",
                    escalate_url=f"http://localhost:3000/customer/tickets?ticket={ticket_id}&action=reopen",
                )
                logger.info(
                    "AI resolution email for ticket %s completed with status %s",
                    ticket_id,
                    email_result["status"],
                )
            # If ticket was ASSIGNED or PENDING_AGENT_REVIEW, Jira stays "In Progress"
            # and escalation notice is sent
            elif ticket.status in ['ASSIGNED', 'PENDING_AGENT_REVIEW']:
                JiraService.update_issue_status(ticket_id, "In Progress")
                if ticket.assigned_email:
                    EmailService.send_assignment_notifications(
                        ticket, user_email, ticket.assigned_email,
                        ticket.assigned_agent or ticket.assigned_email,
                    )
                else:
                    EmailService.send_escalation_notice(ticket_id, user_email)
        else:
            # Workflow didn't complete - route to human agent
            process_and_assign_ticket(ticket, ai_confidence)
            if ticket.status in ['ASSIGNED', 'PENDING_AGENT_REVIEW']:
                JiraService.update_issue_status(ticket_id, "In Progress")
                if ticket.assigned_email:
                    EmailService.send_assignment_notifications(
                        ticket, user_email, ticket.assigned_email,
                        ticket.assigned_agent or ticket.assigned_email,
                    )
                else:
                    EmailService.send_escalation_notice(ticket_id, user_email)
            elif ticket.status == 'AI_RESOLVED':
                ticket.updated_at = timezone.now()
                ticket.save()
                JiraService.update_issue_status(ticket_id, "Done")
                email_result = EmailService.send_resolution(
                    ticket_id,
                    user_email,
                    ai_solution,
                    ai_confidence=ai_confidence,
                    confirm_url=f"http://localhost:3000/customer/tickets?ticket={ticket_id}",
                    escalate_url=f"http://localhost:3000/customer/tickets?ticket={ticket_id}&action=reopen",
                )
                logger.info(
                    "AI resolution email for ticket %s completed with status %s",
                    ticket_id,
                    email_result["status"],
                )
            elif ticket.status == 'PENDING_ASSIGNMENT':
                JiraService.update_issue_status(ticket_id, "In Progress")
                EmailService.send_escalation_notice(ticket_id, user_email)
    except Exception:
        # Preserve an actionable status and log the root cause for operations.
        logger.exception("Ticket automation failed for %s", ticket_id)
        ticket.status = "PENDING_ASSIGNMENT"
        ticket.updated_at = timezone.now()
        ticket.save()

        # Attempt auto-assignment on failure as well
        if not ticket.assigned_agent_id:
            from tickets.services.routing_service import process_and_assign_ticket
            process_and_assign_ticket(ticket, 0.0)


class TicketViewSet(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = getattr(user, 'role', 'EMPLOYEE').lower()

        if role in ["admin", "agent_manager"]:
            tickets = Ticket.objects.all()  # type: ignore
        elif role == "agent":
            tickets = Ticket.objects(
                assigned_agent_id=str(user.id),
                status__in=["ASSIGNED", "IN_PROGRESS", "PENDING_AGENT_REVIEW", "ESCALATED", "REOPENED"],
            ).order_by("-created_at")
            if not tickets:
                tickets = Ticket.objects(
                    assigned_email=user.email,
                    status__in=["ASSIGNED", "IN_PROGRESS", "PENDING_AGENT_REVIEW", "ESCALATED", "REOPENED"],
                ).order_by("-created_at")
        else:
            tickets = Ticket.objects.filter(customer_id=str(user.id))  # type: ignore

        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = TicketSerializer(data=request.data)

        if serializer.is_valid():
            ticket = serializer.save(
                customer_id=str(request.user.id)  # type: ignore
            )
            ticket_id = str(ticket.id)
            user_email = (getattr(request.user, "email", "") or "").strip()
            subject = (
                getattr(ticket, 'title', None) or 
                getattr(ticket, 'subject', None) or 
                request.data.get('title') or 
                request.data.get('subject') or 
                ""
            )
            description = getattr(ticket, 'description', '') or request.data.get('description', '')  # type: ignore
            category = getattr(ticket, 'category', 'General') or request.data.get('category', 'General')  # type: ignore
            automation_executor.submit(
                run_ticket_automation,
                ticket_id,
                user_email,
                subject,
                description,
                category,
                getattr(ticket, 'priority', 'LOW'),
            )

            response_data = TicketSerializer(ticket).data
            response_data["automation_status"] = "QUEUED"
            return Response(response_data, status=status.HTTP_201_CREATED)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def patch(self, request, ticket_id):
        ticket = _get_ticket(ticket_id)
        if not ticket:
            return Response({"detail": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)

        role = getattr(request.user, "role", "customer").lower()
        if role == "customer" and ticket.customer_id != str(request.user.id):
            return Response({"detail": "Not permitted."}, status=status.HTTP_403_FORBIDDEN)

        requested_status = request.data.get("status", "").upper()
        feedback = request.data.get("customer_feedback")
        manual_resolution = request.data.get("manual_resolution", "").strip()

        if role == "customer":
            is_accept = requested_status in {"RESOLVED", "CLOSED"} and feedback == "ACCEPTED"
            is_escalate = requested_status == "ESCALATED" and feedback == "REJECTED_NEEDS_HUMAN"
            is_reopen = requested_status == "REOPENED" and bool(feedback and feedback.strip())
            if not (is_accept or is_escalate or is_reopen):
                return Response({"detail": "Invalid customer feedback action."}, status=status.HTTP_400_BAD_REQUEST)

        if role == "customer" and requested_status in {"RESOLVED", "CLOSED"}:
            # Accepting either an AI or human resolution closes the ticket.
            ticket.status = "CLOSED"
            ticket.requires_human_review = False
            ticket.customer_feedback = feedback
        elif role == "customer" and requested_status == "REOPENED":
            if ticket.status not in {"RESOLVED", "CLOSED"}:
                return Response({"detail": "Only resolved tickets can be reopened."}, status=status.HTTP_400_BAD_REQUEST)
            ticket.status = "REOPENED"
            ticket.customer_feedback = feedback.strip()
            ticket.requires_human_review = True
            TicketMessage(
                ticket_id=str(ticket.id),
                sender_id=str(request.user.id),
                sender_email=getattr(request.user, "email", ""),
                message=f"[REOPEN REQUEST]: {ticket.customer_feedback}",
            ).save()
            agent_name = ticket.assigned_agent or "your assigned specialist"
            EmailService.send_reopen_notifications(
                ticket,
                _customer_email_for(ticket),
                ticket.assigned_email,
                agent_name,
            )
        elif requested_status == "ESCALATED":
            ticket.status = "ESCALATED"
            ticket.customer_feedback = "REJECTED_NEEDS_HUMAN"
            ticket.requires_human_review = True
            ticket.assigned_team = _assigned_team_for(ticket.category)
            ticket.priority = "HIGH"
            _record_customer_escalation(ticket)
            # Reuse deterministic skill routing for an escalation, while
            # retaining the explicit ESCALATED state for every dashboard.
            from tickets.services.routing_service import process_and_assign_ticket
            process_and_assign_ticket(ticket, 0.0)
            if ticket.assigned_agent_id:
                ticket.status = "ESCALATED"
                ticket.requires_human_review = True
                EmailService.send_assignment_notifications(
                    ticket,
                    _customer_email_for(ticket),
                    ticket.assigned_email,
                    ticket.assigned_agent or ticket.assigned_email,
                    event_type="ESCALATED",
                )
            else:
                EmailService.send_escalation_notice(ticket.id, _customer_email_for(ticket))
            JiraService.escalate_issue(ticket.id, ticket.title, ticket.description)
        elif requested_status == "RESOLVED":
            ticket.status = "RESOLVED"
            ticket.requires_human_review = False
            if feedback:
                ticket.customer_feedback = feedback
            if manual_resolution:
                if role not in ("agent", "agent_manager", "admin"):
                    return Response({"detail": "Only support staff can send a manual resolution."}, status=status.HTTP_403_FORBIDDEN)
                ticket.manual_resolution = manual_resolution
                EmailService.send_manual_resolution(ticket.id, _customer_email_for(ticket), manual_resolution)
            elif role in ("agent", "agent_manager", "admin"):
                EmailService.send_manual_resolution(
                    ticket.id,
                    _customer_email_for(ticket),
                    ticket.manual_resolution or "Your ticket has been resolved by the support team.",
                )
        elif role in ("agent", "agent_manager", "admin") and requested_status in Ticket.STATUS_CHOICES:
            ticket.status = requested_status
            if requested_status == "ASSIGNED" and ticket.assigned_email:
                EmailService.send_assignment_notifications(
                    ticket,
                    _customer_email_for(ticket),
                    ticket.assigned_email,
                    ticket.assigned_agent or ticket.assigned_email,
                )
        else:
            return Response({"detail": "Invalid status update."}, status=status.HTTP_400_BAD_REQUEST)

        ticket.updated_at = timezone.now()
        ticket.save()
        return Response(TicketSerializer(ticket).data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reopen_ticket(request, ticket_id):
    """Reopen a resolved customer ticket and return it to its assigned agent."""
    ticket = _get_ticket(ticket_id)
    if not ticket:
        return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)

    if str(ticket.customer_id) != str(request.user.id):
        return Response({"detail": "Not permitted."}, status=status.HTTP_403_FORBIDDEN)

    if ticket.status not in {"RESOLVED", "AI_RESOLVED", "CLOSED"}:
        return Response(
            {"detail": "Only resolved tickets can be reopened."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    reason = str(request.data.get("reason", "")).strip()
    if not reason:
        return Response(
            {"detail": "A reopen reason is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    ticket.status = "REOPENED"
    ticket.customer_feedback = reason
    ticket.requires_human_review = True
    ticket.updated_at = timezone.now()
    ticket.save()
    TicketMessage(
        ticket_id=str(ticket.id),
        sender_id=str(request.user.id),
        sender_email=getattr(request.user, "email", ""),
        message=f"[REOPEN REQUEST]: {reason}",
    ).save()
    EmailService.send_reopen_notifications(
        ticket,
        _customer_email_for(ticket),
        ticket.assigned_email,
        ticket.assigned_agent or "your assigned specialist",
    )

    return Response(
        {
            "message": "Ticket successfully reopened and sent back to agent.",
            "ticket": TicketSerializer(ticket).data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_agent_tickets(request):
    """Fetch tickets assigned specifically to the logged-in Agent."""
    user = request.user

    if getattr(user, "role", "").lower() not in ("agent", "agent_manager", "admin"):
        return Response({"detail": "Agent access required."}, status=status.HTTP_403_FORBIDDEN)

    # Strict filter: only tickets assigned to THIS agent are returned.
    tickets = Ticket.objects(
        assigned_agent_id=str(user.id),
        status__in=['ASSIGNED', 'IN_PROGRESS', 'PENDING_AGENT_REVIEW', 'ESCALATED', 'REOPENED']
    ).order_by('-created_at')

    # Fallback: email-based assignment (e.g. legacy / string-only assignment)
    if not tickets:
        tickets = Ticket.objects(
            assigned_email=user.email,
            status__in=['ASSIGNED', 'IN_PROGRESS', 'PENDING_AGENT_REVIEW', 'ESCALATED', 'REOPENED'],
        ).order_by('-created_at')

    serializer = TicketSerializer(tickets, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# -------------------------------------------------------------
# Agent Manager APIs
# -------------------------------------------------------------

def _is_manager(user):
    return getattr(user, "role", "").lower() in MANAGER_ROLES


def _agent_display_name(agent):
    full_name = f"{getattr(agent, 'first_name', '')} {getattr(agent, 'last_name', '')}".strip()
    return full_name or getattr(agent, "email", "Unknown Agent")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unassigned_tickets(request):
    """Return the manager queue, or all tickets when ``scope=all`` is requested."""
    if not _is_manager(request.user):
        return Response({"detail": "Manager access required."}, status=status.HTTP_403_FORBIDDEN)

    tickets = Ticket.objects.all() if request.query_params.get("scope") == "all" else Ticket.objects(
        status__in=["OPEN", "PENDING_ASSIGNMENT"]
    )
    # Sort: priority rank asc, then ai_confidence desc
    tickets = sorted(
        tickets,
        key=lambda t: (PRIORITY_RANK.get(getattr(t, "priority", "LOW"), 9), -getattr(t, "ai_confidence", 0.0) or 0.0)
    )

    data = []
    for ticket in tickets:
        item = TicketSerializer(ticket).data
        customer = None
        try:
            customer = User.objects.filter(id=ticket.customer_id).first()
        except Exception:
            customer = None
        item["customer_name"] = _agent_display_name(customer) if customer else "Unknown Customer"
        item["customer_email"] = getattr(customer, "email", "") if customer else ""
        data.append(item)

    return Response(data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_agents(request):
    """Return the list of active support agents with their current workload."""
    if not _is_manager(request.user):
        return Response({"detail": "Manager access required."}, status=status.HTTP_403_FORBIDDEN)

    agents = User.objects.filter(role="agent", is_active=True)
    data = []
    for agent in agents:
        try:
            active_count = Ticket.objects(
                assigned_agent_id=str(agent.id),
                status__in=["ASSIGNED", "IN_PROGRESS", "PENDING_AGENT_REVIEW", "REOPENED"]
            ).count()
        except Exception:
            active_count = 0

        data.append({
            "id": str(agent.id),
            "email": agent.email,
            "first_name": agent.first_name,
            "last_name": agent.last_name,
            "display_name": _agent_display_name(agent),
            "role": agent.role,
            "active_tickets": active_count,
        })

    return Response(data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_jira_tickets_log(request):
    """Fetch all Jira ticket sync logs from the MongoDB jira_tickets collection.

    Read-only endpoint — does not mutate any tickets or RAG workflows.
    Supports an optional ``search`` query-param to filter by ``jira_issue_key``
    or ``ticket_id``.
    """
    if not _is_manager(request.user):
        return Response(
            {"detail": "Manager access required."},
            status=status.HTTP_403_FORBIDDEN,
        )

    search = request.query_params.get("search", "").strip()

    if search:
        jira_logs = JiraTicket.objects(
            Q(jira_issue_key__icontains=search) | Q(ticket_id__icontains=search)
        ).order_by("-last_updated")
    else:
        jira_logs = JiraTicket.objects().order_by("-last_updated")

    data = []
    for log in jira_logs:
        ticket = None
        try:
            ticket = Ticket.objects(id=str(log.ticket_id)).first()
        except Exception:
            ticket = None
        data.append(
            {
                "_id": str(log.id),
                "jira_id": log.jira_id,
                "ticket_id": log.ticket_id,
                "ticket_title": getattr(ticket, "title", None) or "Ticket details unavailable",
                "ticket_category": getattr(ticket, "category", None),
                "ticket_priority": getattr(ticket, "priority", None),
                "ticket_status": getattr(ticket, "status", None),
                "jira_issue_key": log.jira_issue_key,
                "jira_status": log.jira_status,
                "last_updated": (
                    log.last_updated.isoformat() if log.last_updated else None
                ),
            }
        )

    return Response(data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_ticket(request):
    """Assign a ticket to a specific support agent, log it, and notify the agent."""
    if not _is_manager(request.user):
        return Response({"detail": "Manager access required."}, status=status.HTTP_403_FORBIDDEN)

    ticket_id = request.data.get("ticket_id")
    agent_id = request.data.get("agent_id")

    if not ticket_id or not agent_id:
        return Response(
            {"detail": "ticket_id and agent_id are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    ticket = _get_ticket(ticket_id)
    if not ticket:
        return Response({"detail": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)

    agent = None
    try:
        agent = User.objects.filter(id=agent_id).first()
    except Exception:
        agent = None
    if not agent or agent.role != "agent":
        return Response({"detail": "Agent not found."}, status=status.HTTP_404_NOT_FOUND)

    ticket.assigned_agent_id = str(agent.id)
    ticket.assigned_agent = _agent_display_name(agent)
    ticket.assigned_email = agent.email
    ticket.assigned_by = str(request.user.id)
    ticket.assigned_at = timezone.now()
    ticket.status = "ASSIGNED"
    ticket.routing_method = "MANUAL_MANAGER_ASSIGNMENT"
    ticket.requires_human_review = False
    ticket.updated_at = timezone.now()
    ticket.save()

    # Log the assignment in Agent_Executions
    try:
        workflow = AgentWorkflow.objects.filter(ticket_id=str(ticket.id)).order_by('-started_at').first()
        if not workflow:
            workflow = AgentWorkflow(
                ticket_id=str(ticket.id),
                workflow_status="ASSIGNED",
                current_agent="Assignment",
            )
            workflow.save()
        AgentExecution(
            workflow_id=workflow.workflow_id,
            agent_name="Assignment",
            input_data={
                "ticket_id": str(ticket.id),
                "assigned_agent_id": str(agent.id),
                "assigned_by": str(request.user.id),
            },
            output_data={
                "message": f"Ticket assigned to {agent.email}",
                "assigned_at": str(timezone.now()),
            },
            confidence=getattr(ticket, "ai_confidence", 0.0) or 0.0,
            status="SUCCESS",
        ).save()
    except Exception as exc:
        logger.warning("Could not persist assignment execution log: %s", exc)

    # Email/in-app notification to the assigned agent
    EmailService.send_assignment_notifications(
        ticket,
        _customer_email_for(ticket),
        agent.email,
        _agent_display_name(agent),
    )

    return Response(TicketSerializer(ticket).data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_customer_email_logs(request):
    """Return only emails addressed to the authenticated customer."""
    logs = EmailLog.objects(recipient=request.user.email).order_by('-sent_at')
    email_logs = []

    for log in logs:
        ticket_id = str(log.ticket_id)
        try:
            ticket = Ticket.objects(id=ticket_id).first()  # type: ignore
        except Exception:
            ticket = None

        ticket_title = (
            getattr(ticket, "title", None)
            or getattr(ticket, "subject", None)
            or "Support Ticket"
        )
        event_type = getattr(log, "event_type", None) or {
            "TICKET_CREATED": "CREATED",
            "RESOLUTION": "AI_RESOLVED",
            "ESCALATION": "ESCALATED",
            "RESOLVED": "RESOLVED",
        }.get(log.email_type, "CREATED")

        email_logs.append({
            "id": str(log.id),
            "ticket_id": ticket_id,
            "ticket_title": ticket_title,
            "event_type": event_type,
            "email_type": log.email_type or event_type,
            "subject": log.subject,
            "status": log.status,
            "sent_at": log.sent_at,
            "body": log.body,
        })

    return Response(email_logs, status=status.HTTP_200_OK)


class MasterDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = []
        sla_policies = []
        teams = []
        applications = []

        try:
            for cat in CategoryTaxonomy.objects.filter(is_active=True):  # type: ignore
                code_val = getattr(cat, 'code', '') or getattr(cat, 'category_name', '')
                name_val = getattr(cat, 'category_name', '') or getattr(cat, 'code', 'General')
                categories.append({
                    "code": code_val,
                    "name": name_val,
                    "description": getattr(cat, 'description', '') or '',
                    "keywords": getattr(cat, 'keywords', []) or []
                })
        except Exception as e:
            print("Error loading CategoryTaxonomy master data:", e)

        try:
            for sla in SLAPolicy.objects.filter(is_active=True):  # type: ignore
                sla_policies.append({
                    "priority": getattr(sla, 'priority', ''),
                    "first_response_minutes": getattr(sla, 'first_response_minutes', 0),
                    "resolution_minutes": getattr(sla, 'resolution_minutes', 0),
                    "calendar_type": getattr(sla, 'calendar_type', 'BUSINESS')
                })
        except Exception as e:
            print("Error loading SLAPolicy master data:", e)

        try:
            for team in Team.objects.filter(is_active=True):  # type: ignore
                teams.append({
                    "code": getattr(team, 'code', ''),
                    "name": getattr(team, 'name', ''),
                    "queue_key": getattr(team, 'queue_key', '')
                })
        except Exception as e:
            print("Error loading Team master data:", e)

        try:
            for app in Application.objects.filter(is_active=True):  # type: ignore
                applications.append({
                    "name": getattr(app, 'name', ''),
                    "category_hint": getattr(app, 'category_hint', ''),
                    "aliases": getattr(app, 'aliases', []) or []
                })
        except Exception as e:
            print("Error loading Application master data:", e)

        return Response({
            "categories": categories,
            "sla_policies": sla_policies,
            "teams": teams,
            "applications": applications
        }, status=status.HTTP_200_OK)


class PreviewClassifyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        subject = request.data.get('subject', '').lower()
        description = request.data.get('description', '').lower()
        affected_system = request.data.get('affected_system', '')

        combined_text = f"{subject} {description}".lower()

        if affected_system:
            try:
                app = Application.objects.filter(name__iexact=affected_system, is_active=True).first()  # type: ignore
                if app and getattr(app, 'category_hint', None):
                    return Response({
                        "category": app.category_hint,
                        "confidence": 0.95,
                        "matched_by": "PRODUCT_MASTER_DATA"
                    }, status=status.HTTP_200_OK)
            except Exception as e:
                print("Application lookup warning:", e)

        try:
            best_match = None
            highest_hits = 0

            for item in CategoryTaxonomy.objects.filter(is_active=True):  # type: ignore
                keywords = getattr(item, 'keywords', []) or []
                hits = sum(1 for kw in keywords if kw and kw.lower() in combined_text)

                if hits > highest_hits:
                    highest_hits = hits
                    best_match = getattr(item, 'code', None) or getattr(item, 'category_name', 'General')

            if best_match and highest_hits > 0:
                confidence = min(0.65 + (highest_hits * 0.10), 0.95)
                return Response({
                    "category": best_match,
                    "confidence": round(confidence, 2),
                    "matched_by": "KEYWORD_TAXONOMY"
                }, status=status.HTTP_200_OK)
        except Exception as e:
            print("Preview classify error:", e)

        return Response({
            "category": "General",
            "confidence": 0.40,
            "matched_by": "FALLBACK"
        }, status=status.HTTP_200_OK)


class KBArticleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        articles = Article.objects.all()  # type: ignore
        data = [
            {
                "id": str(art.id),
                "title": getattr(art, 'title', ''),
                "content": getattr(art, 'content', ''),
                "category": getattr(art, 'category', 'General'),
                "assigned_team": getattr(art, 'assigned_team', 'IT Helpdesk'),
                "status": getattr(art, 'status', 'published'),
                "created_at": getattr(art, 'created_at', None),
            }
            for art in articles
        ]
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        title = request.data.get('title')
        content = request.data.get('content')
        category = request.data.get('category', 'General')
        assigned_team = request.data.get('assigned_team', 'IT Helpdesk')
        status_val = request.data.get('status', 'published')

        if not title or not content:
            return Response(
                {"error": "Title and content are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        article = Article(
            title=title,
            content=content,
            category=category,
            assigned_team=assigned_team,
            status=status_val
        )
        article.save()  # type: ignore

        load_kb_articles()

        return Response(
            {
                "id": str(article.id),
                "title": article.title,
                "message": "Article saved and indexed successfully!"
            },
            status=status.HTTP_201_CREATED
        )


# -------------------------------------------------------------
# Milestone 3 API Endpoints
# -------------------------------------------------------------

@api_view(['POST'])
@permission_classes([AllowAny])
def start_agent_workflow(request):
    ticket_id = request.data.get("ticket_id")
    recipient_email = request.data.get("email", "user@example.com")

    if not ticket_id:
        return Response({"error": "ticket_id is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Safe lookup handling both Django ORM (.objects.filter().first()) and MongoEngine (.objects(id=...).first())
    ticket = None
    try:
        ticket = Ticket.objects.filter(id=ticket_id).first()  # type: ignore
    except Exception:
        try:
            ticket = Ticket.objects(id=ticket_id).first()
        except Exception:
            pass

    if not ticket:
        return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)

    title = getattr(ticket, 'title', None) or getattr(ticket, 'subject', 'Support Ticket')
    description = getattr(ticket, 'description', '')
    category = getattr(ticket, 'category', 'General')
    priority = getattr(ticket, 'priority', 'LOW')

    automation_executor.submit(
        run_ticket_automation,
        str(ticket_id),
        recipient_email,
        title,
        description,
        category,
        priority,
    )
    return Response({
        "message": "Workflow queued successfully",
        "ticket_id": str(ticket_id),
        "automation_status": "QUEUED",
    }, status=status.HTTP_202_ACCEPTED)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_workflow_status(request, ticket_id):
    workflow = None
    executions = []
    jira_info = None
    email_logs = []

    try:
        workflow = AgentWorkflow.objects.filter(ticket_id=str(ticket_id)).order_by('-started_at').first()  # type: ignore
    except Exception:
        try:
            workflow = AgentWorkflow.objects(ticket_id=str(ticket_id)).order_by('-started_at').first()
        except Exception:
            pass

    if not workflow:
        return Response({"error": "No workflow found for this ticket"}, status=status.HTTP_404_NOT_FOUND)

    wf_id = getattr(workflow, 'workflow_id', None)

    try:
        executions = AgentExecution.objects.filter(workflow_id=wf_id)  # type: ignore
        jira_info = JiraTicket.objects.filter(ticket_id=str(ticket_id)).first()  # type: ignore
        email_logs = EmailLog.objects.filter(ticket_id=str(ticket_id))  # type: ignore
    except Exception:
        try:
            executions = AgentExecution.objects(workflow_id=wf_id)
            jira_info = JiraTicket.objects(ticket_id=str(ticket_id)).first()
            email_logs = EmailLog.objects(ticket_id=str(ticket_id))
        except Exception:
            pass

    return Response({
        "workflow_id": wf_id,
        "ticket_id": ticket_id,
        "workflow_status": getattr(workflow, 'workflow_status', 'PENDING'),
        "current_agent": getattr(workflow, 'current_agent', 'None'),
        "final_confidence": getattr(workflow, 'final_confidence', 0.0),
        "jira_key": getattr(jira_info, 'jira_issue_key', None) if jira_info else None,
        "jira_status": getattr(jira_info, 'jira_status', None) if jira_info else None,
        "agent_executions": [
            {
                "execution_id": getattr(ex, 'execution_id', ''),
                "agent_name": getattr(ex, 'agent_name', ''),
                "confidence": getattr(ex, 'confidence', 0.0),
                "status": getattr(ex, 'status', ''),
                "input_data": getattr(ex, 'input_data', {}),
                "output_data": getattr(ex, 'output_data', {})
            } for ex in executions
        ],
        "email_logs": [
            {
                "email_type": getattr(em, 'email_type', ''),
                "recipient": getattr(em, 'recipient', ''),
                "status": getattr(em, 'status', '')
            } for em in email_logs
        ]
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def sync_jira_webhook(request):
    issue_key = request.data.get("issue_key")
    new_jira_status = request.data.get("status")

    if not issue_key or not new_jira_status:
        return Response({"error": "issue_key and status required"}, status=status.HTTP_400_BAD_REQUEST)

    jira_record = None
    try:
        jira_record = JiraTicket.objects.filter(jira_issue_key=issue_key).first()  # type: ignore
    except Exception:
        try:
            jira_record = JiraTicket.objects(jira_issue_key=issue_key).first()
        except Exception:
            pass

    if not jira_record:
        return Response({"error": "Jira ticket not found"}, status=status.HTTP_404_NOT_FOUND)

    jira_record.jira_status = new_jira_status
    jira_record.save()

    if new_jira_status.lower() in ["done", "closed", "resolved"]:
        t_id = getattr(jira_record, 'ticket_id', None)
        ticket = None
        try:
            ticket = Ticket.objects.filter(id=t_id).first()  # type: ignore
        except Exception:
            try:
                ticket = Ticket.objects(id=t_id).first()
            except Exception:
                pass

        if ticket:
            ticket.status = "RESOLVED"
            ticket.save()

    return Response({"message": f"Synced {issue_key} status to {new_jira_status}"}, status=status.HTTP_200_OK)
