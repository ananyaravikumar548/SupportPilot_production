
from django.urls import path
from .views import CurrentUserView, UserListView

urlpatterns = [
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("users/", UserListView.as_view(), name="user-list"),
]