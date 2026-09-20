class DiagnosisAgent:
    def execute(self, ticket_id, ticket_title, description, category):
        combined_text = f"{ticket_title} {description}".lower()

        # Analyze potential root causes based on symptoms
        if any(w in combined_text for w in ["password", "lock", "sso", "mfa", "login"]):
            diagnosis = "Authentication failure or account lockout issue."
            confidence = 0.92
        elif any(w in combined_text for w in ["vpn", "connection", "timeout", "network"]):
            diagnosis = "Network routing failure or VPN gateway timeout."
            confidence = 0.88
        elif any(w in combined_text for w in ["slow", "crash", "freeze", "cpu", "memory"]):
            diagnosis = "Workstation hardware resource exhaustion or OS crash loop."
            confidence = 0.85
        else:
            diagnosis = "General software or configuration anomaly."
            confidence = 0.70

        return {
            "ticket_id": ticket_id,
            "diagnosis": diagnosis,
            "confidence": confidence,
            "category": category,
            "needs_more_info": confidence < 0.75
        }