import datetime
import uuid
from mongoengine import (
    Document,
    StringField,
    DateTimeField,
    BooleanField,
    ListField,
    IntField,
    DictField,
    FloatField
)
from django.conf import settings
from django.utils import timezone
from accounts.models import User
from django.db import models

# --- Django ORM / Relational Models ---

class CategoryTaxonomy(models.Model):
    category_name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, blank=True, null=True)
    keywords = models.JSONField(default=list, blank=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.category_name


class SLAPolicy(models.Model):
    priority = models.CharField(max_length=20)
    first_response_minutes = models.IntegerField(default=60)
    resolution_minutes = models.IntegerField(default=240)
    calendar_type = models.CharField(max_length=20, default='BUSINESS')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"SLA - {self.priority}"


class Team(models.Model):
    code = models.CharField(max_length=50)
    name = models.CharField(max_length=100)
    queue_key = models.CharField(max_length=50, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Application(models.Model):
    name = models.CharField(max_length=100)
    category_hint = models.CharField(max_length=100, blank=True, null=True)
    aliases = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


# --- MongoEngine Document Models ---

class Ticket(Document):
    STATUS_CHOICES = (
        "OPEN",
        "PENDING_ASSIGNMENT",
        "ASSIGNED",
        "IN_PROGRESS",
        "PENDING_AGENT_REVIEW",
        "AI_RESOLVED",
        "RESOLVED",
        "CLOSED",
        "ESCALATED",
        "PENDING_HUMAN_REVIEW",
        "REOPENED",
    )

    PRIORITY_CHOICES = (
        "LOW",
        "MEDIUM",
        "HIGH",
        "URGENT",
    )

    customer_id = StringField(required=True)
    demo_id = StringField(required=False, unique=True, sparse=True)
    title = StringField(max_length=200, required=True)
    description = StringField(required=True)
    category = StringField(max_length=100)
    priority = StringField(choices=PRIORITY_CHOICES, default="LOW")
    status = StringField(choices=STATUS_CHOICES, default="OPEN")
    assigned_agent_id = StringField(required=False)
    assigned_agent = StringField(required=False)
    assigned_email = StringField(required=False)
    assigned_by = StringField(required=False)
    assigned_team = StringField(default="IT Helpdesk")
    ai_confidence = FloatField(default=0.0)
    assigned_at = DateTimeField(required=False)
    requires_human_review = BooleanField(default=False)
    customer_feedback = StringField()
    manual_resolution = StringField()
    # Routing method: MANUAL, AUTOMATED_SKILL_BASED, or None
    routing_method = StringField(required=False)
    # Persisted so the customer portal can display the same AI guidance that is
    # sent in the resolution email after the background workflow finishes.
    ai_resolution = ListField(StringField(), default=list)
    ai_solution = StringField(default="")
    created_at = DateTimeField(default=timezone.now)
    updated_at = DateTimeField(default=timezone.now)

    meta = {
        "collection": "tickets"
    }

    def __str__(self):
        return self.title


class TicketMessage(Document):
    """Append-only customer and support notes for a ticket's conversation history."""

    ticket_id = StringField(required=True)
    sender_id = StringField(required=True)
    sender_email = StringField(required=False)
    message = StringField(required=True)
    created_at = DateTimeField(default=timezone.now)

    meta = {
        "collection": "ticket_messages",
        "ordering": ["created_at"],
    }


class Article(Document):
    title = StringField(max_length=200, required=True)
    content = StringField(required=True)
    category = StringField(max_length=100, default="General")
    assigned_team = StringField(max_length=100, default="IT Helpdesk")
    status = StringField(default="published")
    created_at = DateTimeField(default=timezone.now)

    meta = {
        "collection": "articles"
    }

    def __str__(self):
        return self.title


class AgentWorkflow(Document):
    meta = {'collection': 'agent_workflows'}
    
    workflow_id = StringField(default=lambda: str(uuid.uuid4()), unique=True)
    ticket_id = StringField(required=True)
    workflow_status = StringField(default="RUNNING", choices=["RUNNING", "COMPLETED", "ESCALATED", "FAILED"])
    current_agent = StringField(default="Diagnosis")
    started_at = DateTimeField(default=datetime.datetime.utcnow)
    completed_at = DateTimeField()
    final_confidence = FloatField(default=0.0)


class AgentExecution(Document):
    meta = {'collection': 'agent_executions'}
    
    execution_id = StringField(default=lambda: str(uuid.uuid4()), unique=True)
    workflow_id = StringField(required=True)
    agent_name = StringField(required=True)  # Diagnosis, Retrieval, Resolution, Escalation
    input_data = DictField()
    output_data = DictField()
    status = StringField(default="SUCCESS")
    confidence = FloatField(default=0.0)
    started_at = DateTimeField(default=datetime.datetime.utcnow)
    completed_at = DateTimeField(default=datetime.datetime.utcnow)


class JiraTicket(Document):
    meta = {'collection': 'jira_tickets'}
    
    jira_id = StringField(default=lambda: str(uuid.uuid4()), unique=True)
    ticket_id = StringField(required=True)
    jira_issue_key = StringField(required=True)  # e.g., "SUP-104"
    jira_status = StringField(default="To Do")
    priority = StringField(default="LOW")
    last_updated = DateTimeField(default=datetime.datetime.utcnow)


class EmailLog(Document):
    meta = {'collection': 'email_logs'}
    
    email_id = StringField(default=lambda: str(uuid.uuid4()), unique=True)
    ticket_id = StringField(required=True)
    recipient = StringField(required=True)
    subject = StringField(required=True)
    body = StringField(default="")
    event_type = StringField(
        choices=["CREATED", "AI_RESOLVED", "ASSIGNED", "ESCALATED", "RESOLVED", "REOPENED"],
        required=False,
    )
    # Kept for compatibility with older portal payloads.
    email_type = StringField(choices=["TICKET_CREATED", "RESOLUTION", "ESCALATION", "RESOLVED"])
    status = StringField(default="SENT", choices=["SENT", "FAILED", "PENDING"])
    sent_at = DateTimeField(default=datetime.datetime.utcnow)
