from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


User = get_user_model()


class Command(BaseCommand):
    help = "Create or refresh the accounts used by the SupportPilot login demo."

    DEMO_USERS = (
        {
            "email": "admin@demo.com",
            "first_name": "Admin",
            "last_name": "User",
            "role": "admin",
            "is_staff": True,
            "is_superuser": True,
        },
        {
            "email": "manager@demo.com",
            "first_name": "Manager",
            "last_name": "User",
            "role": "agent_manager",
        },
        {
            "email": "agent@demo.com",
            "first_name": "Agent",
            "last_name": "One",
            "role": "agent",
        },
        {
            "email": "agent2@demo.com",
            "first_name": "Agent",
            "last_name": "Two",
            "role": "agent",
        },
        {
            "email": "agent3@demo.com",
            "first_name": "Agent",
            "last_name": "Three",
            "role": "agent",
        },
        {
            "email": "customer@demo.com",
            "first_name": "Customer",
            "last_name": "One",
            "role": "customer",
        },
        {
            "email": "supportpilot.app@gmail.com",
            "first_name": "Customer",
            "last_name": "Two",
            "role": "customer",
        },
    )
    DEMO_PASSWORD = "password123"

    def handle(self, *args, **options):
        for spec in self.DEMO_USERS:
            email = spec["email"]
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    key: value
                    for key, value in spec.items()
                    if key != "email"
                },
            )

            for key, value in spec.items():
                if key != "email":
                    setattr(user, key, value)
            user.set_password(self.DEMO_PASSWORD)
            user.is_active = True
            user.save()

            action = "Created" if created else "Refreshed"
            self.stdout.write(self.style.SUCCESS(f"{action} demo user {email} ({user.role})"))

        self.stdout.write(
            self.style.SUCCESS(
                f"\nAll {len(self.DEMO_USERS)} demo users use password: {self.DEMO_PASSWORD}"
            )
        )
