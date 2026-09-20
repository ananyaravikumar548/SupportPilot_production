import logging
from django.contrib.auth import get_user_model
from tickets.models import Ticket

logger = logging.getLogger(__name__)

User = get_user_model()

CONFIDENCE_THRESHOLD = 0.75  # 75% Threshold

CATEGORY_ALIASES = {
    "billing": "billing",
    "invoice": "billing",
    "payment": "billing",
    "tech": "technical",
    "technical": "technical",
    "infrastructure": "technical",
    "account": "account",
    "general": "general",
}

ACTIVE_WORKLOAD_STATUSES = ["ASSIGNED", "IN_PROGRESS", "REOPENED"]


def _filter_agents_by_expertise(agents, category):
    """Filter agents by expertise category (case-insensitive), works with all database backends."""
    if not category:
        return agents
    raw_category = category.strip().lower()
    category_lower = CATEGORY_ALIASES.get(raw_category, raw_category)
    return [
        agent for agent in agents
        if category_lower in [
            CATEGORY_ALIASES.get(str(skill).strip().lower(), str(skill).strip().lower())
            for skill in (agent.expertise or [])
        ]
        or "general" in [
            CATEGORY_ALIASES.get(str(skill).strip().lower(), str(skill).strip().lower())
            for skill in (agent.expertise or [])
        ]
    ]


def process_and_assign_ticket(ticket, ai_confidence):
    """
    Evaluates AI confidence threshold (75%) and assigns ticket to a qualified agent
    with the lowest workload, or routes to Manager Queue if no match exists.

    Returns the selected agent User object if assignment successful, None otherwise.
    """
    # 1. Check AI Confidence Threshold (75%)
    if ai_confidence > CONFIDENCE_THRESHOLD:
        # High Confidence (> 75%): Eligible for automated resolution
        ticket.status = 'AI_RESOLVED'
        ticket.assigned_agent_id = None
        ticket.assigned_agent = None
        ticket.assigned_email = None
        ticket.assigned_by = None
        ticket.routing_method = 'AUTOMATED_HIGH_CONFIDENCE'
        ticket.save()
        logger.info("Ticket %s auto-resolved (confidence=%.2f > %.2f)",
                    ticket.id, ai_confidence, CONFIDENCE_THRESHOLD)
        return None

    # 2. Low/Medium Confidence (<= 75%): Escalate to Human Support Agent Queue
    ticket.status = 'PENDING_AGENT_REVIEW'
    raw_category = (ticket.category or "").strip().lower()
    category = CATEGORY_ALIASES.get(raw_category, raw_category)

    # 3. Fetch active agents with matching expertise (case-insensitive check)
    all_agents = list(User.objects.filter(role="agent", is_active=True))
    matching_agents = _filter_agents_by_expertise(all_agents, category)

    # 4. If no matching agent found, route to Manager Console
    if not matching_agents:
        logger.warning("No matching agents for category '%s' (ticket %s), routing to PENDING_ASSIGNMENT",
                       category, ticket.id)
        ticket.status = 'PENDING_ASSIGNMENT'
        ticket.assigned_agent_id = None
        ticket.assigned_agent = None
        ticket.assigned_email = None
        ticket.routing_method = 'UNMAPPED_CATEGORY'
        ticket.save()
        return None

    # 5. Workload balancing: Pick qualified agent with fewest active tickets
    agents_with_workload = [
        (agent, get_agent_workload(agent))
        for agent in matching_agents
    ]

    # Use a stable secondary key so equal workloads never route intermittently.
    agents_with_workload.sort(
        key=lambda item: (item[1], (item[0].email or "").lower(), str(item[0].id))
    )
    selected_agent, active_count = agents_with_workload[0]

    if not selected_agent:
        logger.warning("No agent selected after workload balancing for ticket %s", ticket.id)
        ticket.status = 'PENDING_ASSIGNMENT'
        ticket.assigned_agent_id = None
        ticket.assigned_agent = None
        ticket.assigned_email = None
        ticket.routing_method = 'UNMAPPED_CATEGORY'
        ticket.save()
        return None

    # Assign ticket
    ticket.assigned_agent_id = str(selected_agent.id)
    ticket.assigned_agent = f"{selected_agent.first_name} {selected_agent.last_name}".strip() or selected_agent.email
    ticket.assigned_email = selected_agent.email
    ticket.status = 'ASSIGNED'
    ticket.routing_method = 'AUTOMATED_SKILL_BASED'
    ticket.save()

    logger.info(
        "Auto-assigned ticket %s to agent %s (category: %s, active_count: %s, confidence: %.2f)",
        ticket.id,
        selected_agent.email,
        category,
        active_count,
        ai_confidence
    )

    return selected_agent


def get_agent_workload(agent):
    """Returns the number of active tickets assigned to an agent."""
    return Ticket.objects(
        assigned_agent_id=str(agent.id),
        status__in=ACTIVE_WORKLOAD_STATUSES
    ).count()


def get_available_agents_with_workload(category=None):
    """Returns a list of active agents with their current workload, optionally filtered by category expertise."""
    agents = list(User.objects.filter(role='agent', is_active=True))

    if category:
        agents = _filter_agents_by_expertise(agents, category)

    result = []
    for agent in agents:
        active_count = get_agent_workload(agent)
        result.append({
            'id': str(agent.id),
            'email': agent.email,
            'name': f"{agent.first_name} {agent.last_name}".strip() or agent.email,
            'expertise': agent.expertise or [],
            'active_tickets': active_count,
        })

    # Sort by workload (ascending)
    result.sort(key=lambda x: x['active_tickets'])
    return result