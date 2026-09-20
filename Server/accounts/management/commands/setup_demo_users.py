import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Creates or updates the demo users used by the login page."

    demo_users = (
        ("admin@demo.com", "admin"),
        ("manager@demo.com", "agent_manager"),
        ("agent@demo.com", "agent"),
        ("agent2@demo.com", "agent"),
        ("agent3@demo.com", "agent"),
        ("customer@demo.com", "customer"),
        ("supportpilot.app@gmail.com", "customer"),
    )

    def handle(self, *args, **options):
        user_model = get_user_model()
        password = os.getenv("DEMO_USER_PASSWORD", "password123")

        for email, role in self.demo_users:
            user, created = user_model.objects.get_or_create(
                email=email,
                defaults={
                    "role": role,
                    "is_active": True,
                    "is_staff": role == "admin",
                    "is_superuser": role == "admin",
                },
            )

            user.role = role
            user.is_active = True
            user.is_staff = role == "admin"
            user.is_superuser = role == "admin"
            user.set_password(password)
            user.save(
                update_fields=[
                    "role",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "password",
                ]
            )

            action = "Created" if created else "Updated"
            self.stdout.write(
                self.style.SUCCESS(f"{action} demo user: {email} ({role})")
            )
