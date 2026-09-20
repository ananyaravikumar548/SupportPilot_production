import logging
import threading

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

logger = logging.getLogger(__name__)


class EmailService:
    @staticmethod
    def _send_and_log_async(recipient_email, subject, body_html, event_type, ticket_id):
        """Send and persist a notification outside the request thread."""
        from tickets.models import EmailLog

        if not recipient_email:
            logger.error(
                "Skipping email for ticket %s: no recipient email was provided",
                ticket_id,
            )
            EmailLog(
                ticket_id=str(ticket_id),
                recipient="<missing recipient>",
                subject=subject,
                body=body_html,
                event_type=event_type,
                status="FAILED",
                sent_at=timezone.now(),
            ).save()
            return

        try:
            delivered_count = send_mail(
                subject=subject,
                message="",
                html_message=body_html,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=False,
            )

            legacy_type = {
                "CREATED": "TICKET_CREATED",
                "AI_RESOLVED": "RESOLUTION",
                "ASSIGNED": "TICKET_CREATED",
                "ESCALATED": "ESCALATION",
                "RESOLVED": "RESOLVED",
                "REOPENED": "ESCALATION",
            }.get(event_type)
            EmailLog(
                ticket_id=str(ticket_id),
                recipient=recipient_email,
                subject=subject,
                body=body_html,
                event_type=event_type,
                email_type=legacy_type,
                status="SENT" if delivered_count == 1 else "FAILED",
                sent_at=timezone.now(),
            ).save()
            if delivered_count == 1:
                logger.info(
                    "Gmail email delivered for ticket %s to %s",
                    ticket_id,
                    recipient_email,
                )
            else:
                logger.error(
                    "SMTP did not deliver email for ticket %s (recipient=%s, count=%s)",
                    ticket_id,
                    recipient_email,
                    delivered_count,
                )
        except Exception as exc:
            logger.exception(
                "Failed to deliver email for ticket %s (recipient=%s)",
                ticket_id,
                recipient_email,
            )
            try:
                EmailLog(
                    ticket_id=str(ticket_id),
                    recipient=recipient_email,
                    subject=subject,
                    body=body_html,
                    event_type=event_type,
                    status="FAILED",
                    sent_at=timezone.now(),
                ).save()
            except Exception:
                logger.exception(
                    "Failed to persist failed email log for ticket %s: %s",
                    ticket_id,
                    exc,
                )

    @staticmethod
    def dispatch_and_log_email(recipient_email, subject, body_html, event_type, ticket):
        """Queue delivery and persistence, returning without waiting for SMTP."""
        logger.info(
            "Queueing %s email for ticket %s to %s",
            event_type,
            getattr(ticket, "id", ticket),
            recipient_email or "<missing>",
        )
        thread = threading.Thread(
            target=EmailService._send_and_log_async,
            args=(
                recipient_email,
                subject,
                body_html,
                event_type,
                str(getattr(ticket, "id", ticket)),
            ),
            daemon=True,
        )
        thread.start()
        return {"status": "QUEUED", "event_type": event_type}

    @staticmethod
    def send_ticket_created(ticket_id, recipient_email, title):
        subject = f"[SupportPilot] Ticket Created: #{ticket_id}"
        body = (
            f"<p>Hello,</p><p>Your ticket <strong>#{ticket_id}</strong> "
            f"({title}) was created successfully. Our AI triage is underway.</p>"
        )
        return EmailService.dispatch_and_log_email(recipient_email, subject, body, "CREATED", ticket_id)

    @staticmethod
    def send_resolution(
        ticket_id,
        recipient_email,
        suggested_steps,
        ai_confidence=None,
        confirm_url=None,
        escalate_url=None,
    ):
        subject = f"[SupportPilot] AI Suggested Solution: #{ticket_id}"
        steps_text = "\n".join(suggested_steps) if isinstance(suggested_steps, list) else str(suggested_steps)
        message = (
            "Hello,\n\nOur AI Assistant has generated a resolution for your issue:\n\n"
            f"{steps_text}\n\nConfirm or request human support in the SupportPilot portal."
        )
        body = (
            f"<p>Our AI assistant suggested:</p><p>{steps_text}</p>"
            f'<p><a href="{confirm_url or "#"}">Accept &amp; Close</a> '
            f'| <a href="{escalate_url or "#"}">Request Human Help</a></p>'
        )
        return EmailService.dispatch_and_log_email(recipient_email, subject, body, "AI_RESOLVED", ticket_id)

    @staticmethod
    def send_manual_resolution(ticket_id, recipient_email, resolution):
        subject = f"[SupportPilot] Ticket #{ticket_id} Resolved by Support Team"
        body = (
            f"<p>A support specialist resolved your ticket.</p><p>{resolution}</p>"
            "<p><strong>Confirm &amp; Close</strong> or <strong>Reopen</strong> "
            "the ticket from the customer portal.</p>"
        )
        return EmailService.dispatch_and_log_email(recipient_email, subject, body, "RESOLVED", ticket_id)

    @staticmethod
    def send_escalation_notice(ticket_id, recipient_email, event_type="ESCALATED"):
        subject = f"[SupportPilot] Ticket #{ticket_id} Assigned to Support Specialist"
        body = f"<p>Your ticket has been assigned to a support specialist for human assistance.</p>"
        return EmailService.dispatch_and_log_email(recipient_email, subject, body, event_type, ticket_id)

    @staticmethod
    def send_assignment_notification(ticket_id, recipient_email, ticket_title, assigned_by_email):
        subject = f"[Action Required] New Ticket Assigned: #{ticket_id}"
        body = (
            f"<p>A new ticket has been assigned to you by {assigned_by_email}.</p>"
            f"<p><strong>Title:</strong> {ticket_title}<br>"
            f"<strong>Ticket ID:</strong> #{ticket_id}</p>"
            "<p>Review it in the Agent Dashboard.</p>"
        )
        return EmailService.dispatch_and_log_email(recipient_email, subject, body, "ASSIGNED", ticket_id)

    @staticmethod
    def send_assignment_notifications(ticket, customer_email, agent_email, agent_name, event_type="ASSIGNED"):
        customer_subject = (
            f"[SupportPilot] Ticket #{ticket.id} Assigned to Support Specialist"
            if event_type == "ASSIGNED"
            else f"[SupportPilot] Ticket #{ticket.id} Escalated to Support Specialist"
        )
        customer_body = (
            f"<p>Your ticket was assigned to <strong>{agent_name}</strong> "
            f"({agent_email}).</p>"
        )
        agent_subject = f"[Action Required] New Ticket Assigned: #{ticket.id}"
        agent_body = (
            f"<p><strong>Ticket:</strong> #{ticket.id} - {ticket.title}<br>"
            f"<strong>Priority:</strong> {ticket.priority}<br>"
            f"<strong>Customer notes:</strong> {ticket.description}</p>"
            "<p>Review this ticket in the Agent Dashboard.</p>"
        )
        results = [
            EmailService.dispatch_and_log_email(
                customer_email, customer_subject, customer_body, event_type, ticket
            )
        ]
        if agent_email:
            results.append(
                EmailService.dispatch_and_log_email(
                    agent_email, agent_subject, agent_body, event_type, ticket
                )
            )
        return results

    @staticmethod
    def send_reopen_notifications(ticket, customer_email, agent_email, agent_name):
        customer_subject = f"[SupportPilot] Confirmation: Ticket #{ticket.id} Reopened"
        customer_body = f"<p>Your reopen request was received and sent back to {agent_name}.</p>"
        agent_subject = f"[ALERT] Ticket #{ticket.id} Reopened by Customer"
        agent_body = (
            f"<p>Customer reopened <strong>#{ticket.id}</strong>.</p>"
            f"<p><strong>Reason:</strong> {ticket.customer_feedback}</p>"
            "<p>The ticket is back in your active queue.</p>"
        )
        results = [
            EmailService.dispatch_and_log_email(customer_email, customer_subject, customer_body, "REOPENED", ticket),
        ]
        if agent_email:
            results.append(EmailService.dispatch_and_log_email(agent_email, agent_subject, agent_body, "REOPENED", ticket))
        return results
