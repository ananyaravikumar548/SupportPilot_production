import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from tickets.models import Ticket


User = get_user_model()


class Command(BaseCommand):
    help = "Create deterministic SupportPilot presentation tickets."
    demo_customer_email = os.getenv("DEMO_CUSTOMER_EMAIL", "customer@demo.com")

    DEMO_TICKETS = (
        {
            "demo_id": "DEMO-01",
            "title": "Double charged on monthly invoice #INV-994",
            "description": "The monthly invoice shows the same charge twice.",
            "category": " Billing ",
            "ai_confidence": 0.60,
        },
        {
            "demo_id": "DEMO-02",
            "title": "500 Internal Server error on API endpoint",
            "description": "The API endpoint returns HTTP 500 for every request.",
            "category": "TECHNICAL",
            "ai_confidence": 0.45,
        },
        {
            "demo_id": "DEMO-03",
            "title": "Legacy mainframe hardware key error",
            "description": "The legacy mainframe reports an unsupported hardware key.",
            "category": "Unmapped",
            "ai_confidence": 0.30,
        },
    )

    def handle(self, *args, **options):
        customer, _ = User.objects.get_or_create(
            email=self.demo_customer_email,
            defaults={"role": "customer", "is_active": True},
        )
        customer.set_password("password123")
        customer.save()

        for spec in self.DEMO_TICKETS:
            ticket = Ticket.objects(demo_id=spec["demo_id"]).first()
            if not ticket:
                ticket = Ticket(customer_id=str(customer.id), **spec)
            else:
                for key, value in spec.items():
                    setattr(ticket, key, value)
                ticket.customer_id = str(customer.id)
                ticket.status = "OPEN"
                ticket.assigned_agent_id = None
                ticket.assigned_agent = None
                ticket.assigned_email = None
                ticket.routing_method = None
            ticket.save()
            self.stdout.write(self.style.SUCCESS(f"{spec['demo_id']}: {ticket.id}"))

        self.stdout.write(
            self.style.SUCCESS(
                f"Demo customer: {self.demo_customer_email} / password123. "
                "Run the normal ticket automation or route each ticket with confidence <= 0.75."
            )
        )
