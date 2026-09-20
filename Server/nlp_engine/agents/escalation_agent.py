class EscalationAgent:
    def execute(self, ticket_id, reason, assigned_team="IT Helpdesk"):
        return {
            "escalated": True,
            "reason": reason,
            "assigned_team": assigned_team,
            "status": "ESCALATED",
            "message": f"Ticket {ticket_id} escalated to {assigned_team}."
        }