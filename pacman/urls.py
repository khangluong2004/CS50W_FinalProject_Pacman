from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),

    path("profile", views.profile, name="profile"),

    path("challenges/<str:mode>", views.get_challenge, name="getChallenge"),
    path("challenges/services/send", views.send_challenge, name = "sendChallenge"),
    path("challenges/services/update", views.update_challenge, name = "updateChallenge"),

    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
]