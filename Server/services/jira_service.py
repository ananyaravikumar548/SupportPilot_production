import os
import requests

JIRA_URL = os.getenv("JIRA_URL", "https://your-domain.atlassian.net")
JIRA_USER_EMAIL = os.getenv("JIRA_USER_EMAIL", "")
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN", "")
JIRA_PROJECT_KEY = os.getenv("JIRA_PROJECT_KEY", "SUP")

class JiraService:
    @staticmethod
    def create_issue(ticket_id, title, description, priority="Low"):
        # Import inside the method to prevent circular import loops during app load
        from tickets.models import JiraTicket

        if not JIRA_USER_EMAIL or not JIRA_API_TOKEN:
            # Fallback mock key if Jira API credentials are missing
            mock_key = f"{JIRA_PROJECT_KEY}-{abs(hash(str(ticket_id))) % 10000}"
            jira_doc = JiraTicket(
                ticket_id=str(ticket_id),
                jira_issue_key=mock_key,
                jira_status="To Do",
                priority=priority.upper(),
            )
            jira_doc.save()
            return {"jira_key": mock_key, "status": "To Do", "mock": True}

        url = f"{JIRA_URL}/rest/api/3/issue"
        auth = (JIRA_USER_EMAIL, JIRA_API_TOKEN)
        headers = {"Accept": "application/json", "Content-Type": "application/json"}
        
        payload = {
            "fields": {
                "project": {"key": JIRA_PROJECT_KEY},
                "summary": title,
                "description": {
                    "type": "doc",
                    "version": 1,
                    "content": [{
                        "type": "paragraph",
                        "content": [{"type": "text", "text": description}]
                    }]
                },
                "issuetype": {"name": "Task"}
                ,"priority": {"name": priority.title()}
            }
        }

        try:
            response = requests.post(url, json=payload, auth=auth, headers=headers)
            if response.status_code == 201:
                data = response.json()
                issue_key = data.get("key")
                jira_doc = JiraTicket(
                    ticket_id=str(ticket_id),
                    jira_issue_key=issue_key,
                    jira_status="To Do",
                    priority=priority.upper(),
                )
                jira_doc.save()
                return {"jira_key": issue_key, "status": "To Do", "mock": False}
        except Exception as e:
            print(f"Jira Integration Error: {e}")

        # Fallback if API request fails
        fallback_key = f"{JIRA_PROJECT_KEY}-101"
        JiraTicket(ticket_id=str(ticket_id), jira_issue_key=fallback_key, jira_status="To Do", priority=priority.upper()).save()
        return {"jira_key": fallback_key, "status": "To Do", "mock": True}

    @staticmethod
    def update_issue_status(ticket_id, status_name):
        from tickets.models import JiraTicket

        # Note: If using standard Django ORM, use .filter().first() or .get()
        # If using MongoEngine / Mongo ODM, .objects(ticket_id=...).first() is fine.
        jira_doc = JiraTicket.objects.filter(ticket_id=str(ticket_id)).first()
        if jira_doc:
            jira_doc.jira_status = status_name
            jira_doc.save()
            return True
        return False

    @staticmethod
    def escalate_issue(ticket_id, title, description):
        """Raise the linked Jira record to High priority, creating it if needed."""
        from tickets.models import JiraTicket

        jira_doc = JiraTicket.objects.filter(ticket_id=str(ticket_id)).first()
        if not jira_doc:
            return JiraService.create_issue(ticket_id, title, description, priority="High")

        jira_doc.jira_status = "Escalated"
        jira_doc.priority = "HIGH"
        jira_doc.save()
        if JIRA_USER_EMAIL and JIRA_API_TOKEN:
            try:
                requests.put(
                    f"{JIRA_URL}/rest/api/3/issue/{jira_doc.jira_issue_key}",
                    json={"fields": {"priority": {"name": "High"}}},
                    auth=(JIRA_USER_EMAIL, JIRA_API_TOKEN),
                    headers={"Accept": "application/json", "Content-Type": "application/json"},
                    timeout=10,
                )
            except Exception as error:
                print(f"Jira escalation priority update error: {error}")
        return {"jira_key": jira_doc.jira_issue_key, "status": jira_doc.jira_status, "priority": "HIGH"}
