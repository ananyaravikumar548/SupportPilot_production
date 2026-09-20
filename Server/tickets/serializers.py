from rest_framework import serializers
from django.utils import timezone
from .models import Ticket


class TicketSerializer(serializers.Serializer):

    id = serializers.CharField(read_only=True)
    demo_id = serializers.CharField(required=False, allow_blank=True, read_only=True)

    title = serializers.CharField(max_length=200)
    description = serializers.CharField()
    category = serializers.CharField(
        required=False,
        allow_blank=True
    )

    priority = serializers.ChoiceField(
        choices=["LOW", "MEDIUM", "HIGH", "URGENT"]
    )

    status = serializers.ChoiceField(
        choices=[
            "OPEN", "PENDING_ASSIGNMENT", "ASSIGNED", "IN_PROGRESS",
            "PENDING_AGENT_REVIEW", "AI_RESOLVED", "RESOLVED", "CLOSED",
            "ESCALATED", "PENDING_HUMAN_REVIEW", "REOPENED",
        ],
        required=False,
        default="OPEN"
    )

    customer_id = serializers.CharField(read_only=True)

    assigned_agent_id = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True
    )

    assigned_agent = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True
    )

    assigned_email = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True
    )

    assigned_by = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True
    )

    routing_method = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        read_only=True,
    )

    ai_confidence = serializers.FloatField(
        required=False,
        default=0.0
    )

    assigned_at = serializers.DateTimeField(
        required=False,
        allow_null=True
    )

    ai_resolution = serializers.ListField(
        child=serializers.CharField(),
        read_only=True,
    )
    ai_solution = serializers.CharField(read_only=True)

    assigned_team = serializers.CharField(read_only=True)
    requires_human_review = serializers.BooleanField(read_only=True)
    customer_feedback = serializers.CharField(read_only=True)
    manual_resolution = serializers.CharField(read_only=True)

    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        ticket = Ticket(
            **validated_data
        )
        ticket.save()
        return ticket

    def update(self, instance, validated_data):
        for key, value in validated_data.items():
            setattr(instance, key, value)

        instance.updated_at = timezone.now()
        instance.save()

        return instance

    def to_representation(self, instance):
        return {
            "id": str(instance.id),
            "demo_id": getattr(instance, "demo_id", None),
            "title": instance.title,
            "description": instance.description,
            "category": instance.category,
            "priority": instance.priority,
            "status": instance.status,
            "customer_id": instance.customer_id,
            "assigned_agent_id": instance.assigned_agent_id,
            "assigned_agent": instance.assigned_agent,
            "assigned_email": instance.assigned_email,
            "assigned_by": instance.assigned_by,
            "routing_method": getattr(instance, "routing_method", None),
            "assigned_team": instance.assigned_team,
            "ai_confidence": getattr(instance, "ai_confidence", 0.0) or 0.0,
            "assigned_at": instance.assigned_at,
            "requires_human_review": instance.requires_human_review,
            "customer_feedback": instance.customer_feedback,
            "manual_resolution": instance.manual_resolution,
            "ai_resolution": instance.ai_resolution or [],
            "ai_solution": getattr(instance, "ai_solution", "") or "",
            "created_at": instance.created_at,
            "updated_at": instance.updated_at,
        }
