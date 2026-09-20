import logging

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

logger = logging.getLogger(__name__)

User = get_user_model()


class Command(BaseCommand):
    help = "Seed support agent accounts for the Manager Console assignment dropdown."
    requires_system_checks = []

    AGENTS = [
        {
            "email": "agent@demo.com",
            "password": "password123",
            "first_name": "Agent",
            "last_name": "One",
            "role": "agent",
            "expertise": ["Account"],
        },
        {
            "email": "agent2@demo.com",
            "password": "password123",
            "first_name": "Agent",
            "last_name": "Two",
            "role": "agent",
            "expertise": ["Billing"],
        },
        {
            "email": "agent3@demo.com",
            "password": "password123",
            "first_name": "Agent",
            "last_name": "Three",
            "role": "agent",
            "expertise": ["Technical", "Infrastructure"],
        },
    ]

    def handle(self, *args, **options):
        for spec in self.AGENTS:
            user, created = User.objects.get_or_create(
                email=spec["email"],
                defaults={
                    "first_name": spec["first_name"],
                    "last_name": spec["last_name"],
                    "role": spec["role"],
                    "expertise": spec.get("expertise", []),
                    "is_active": True,
                    "is_staff": False,
                },
            )
            if created:
                user.set_password(spec["password"])
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created agent {user.email} (role={user.role}, expertise={user.expertise})"
                    )
                )
            else:
                user.set_password(spec["password"])
                user.expertise = spec.get("expertise", [])
                user.save()
                self.stdout.write(
                    self.style.WARNING(
                        f"Agent {user.email} already exists - password reset, expertise updated"
                    )
                )

        agent_count = User.objects.filter(role="agent", is_active=True).count()
        self.stdout.write(
            self.style.SUCCESS(
                f"\nTotal active agents available: {agent_count}"
            )
        )
