from rest_framework import serializers
from django.utils import timezone
from .models import Ticket


class TicketSerializer(serializers.Serializer):

    id = serializers.CharField(read_only=True)

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
        choices=["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
        required=False,
        default="OPEN"
    )

    customer_id = serializers.CharField(read_only=True)

    assigned_agent_id = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True
    )

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
            "title": instance.title,
            "description": instance.description,
            "category": instance.category,
            "priority": instance.priority,
            "status": instance.status,
            "customer_id": instance.customer_id,
            "assigned_agent_id": instance.assigned_agent_id,
            "created_at": instance.created_at,
            "updated_at": instance.updated_at,
        }