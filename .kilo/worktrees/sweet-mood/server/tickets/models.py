from mongoengine import (
    Document,
    StringField,
    DateTimeField,
    ReferenceField
)
from django.conf import settings
from django.utils import timezone
from accounts.models import User


class Ticket(Document):

    STATUS_CHOICES = (
        "OPEN",
        "IN_PROGRESS",
        "RESOLVED",
        "CLOSED",
    )

    PRIORITY_CHOICES = (
        "LOW",
        "MEDIUM",
        "HIGH",
        "URGENT",
    )

    customer_id = StringField(required=True)

    title = StringField(
        max_length=200,
        required=True
    )

    description = StringField(
        required=True
    )

    category = StringField(
        max_length=100
    )

    priority = StringField(
        choices=PRIORITY_CHOICES,
        default="LOW"
    )

    status = StringField(
        choices=STATUS_CHOICES,
        default="OPEN"
    )

    assigned_agent_id = StringField(required=False)

    created_at = DateTimeField(
        default=timezone.now
    )

    updated_at = DateTimeField(
        default=timezone.now
    )

    meta = {
        "collection": "tickets"
    }

    def __str__(self):
        return self.title