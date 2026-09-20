from django.urls import path
from .views import TicketViewSet

urlpatterns = [
    path("", TicketViewSet.as_view(), name="tickets"),
]