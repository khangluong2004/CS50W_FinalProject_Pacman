import json

from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

from .models import User, Challenges

# Create your views here.

# Get challenges 
def get_challenge(request, mode):
    challenges = None
    if mode == "sent":
        challenges = Challenges.objects.filter(sender = request.user).all()
    elif mode == "received":
        challenges = Challenges.objects.filter(receiver = request.user).all()
    return render(request, "pacman/challenge.html", {
        "mode": mode,
        "challenges": challenges
    })

# Send a challenge
def send_challenge(request):
    if request.method == "POST":
        print("send challenge")
        data = json.loads(request.body)

        receiver_usernam = data.get("receiver")
        bet_score = int(data.get("bet_score"))
        receiver_obj = User.objects.get(username = receiver_usernam)

        new_challenge = Challenges(sender = request.user, receiver = receiver_obj, 
                                   bet_score = bet_score, sender_win = False, finalized = False)
        new_challenge.save()

        user_entry = User.objects.get(username = request.user.username)
        user_entry.challenge_sent += 1
        user_entry.save()
        
        return JsonResponse({"message": "Successful challenge creation"}, status = 201)

# Update challenge after accept
def update_challenge(request):
    if request.method == "PUT":
        data = json.loads(request.body)

        challenge_id = int(data.get("id"))
        challenge_score = int(data.get("score"))

        challenge_entry = Challenges.objects.get(id = challenge_id)
        sender = User.objects.get(username = challenge_entry.sender.username)
        receiver = User.objects.get(username = challenge_entry.receiver.username)

        # Update the score of sender and receiver
        if (challenge_score >= challenge_entry.bet_score):
            challenge_entry.sender_win = False
            
            sender.score -= challenge_entry.bet_score
            receiver.score += challenge_entry.bet_score

            receiver.challenge_win += 1
        else:
            challenge_entry.sender_win = True

            sender.score += challenge_entry.bet_score
            receiver.score -= challenge_entry.bet_score

            sender.challenge_win += 1
        
        challenge_entry.finalized = True

        # Save everything to db
        challenge_entry.save()
        sender.save()
        receiver.save()

        return JsonResponse({"message": "Successful update"}, status = 201)

def index(request):
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("login"))
    else:
        return render(request, "pacman/index.html")

# Login/logout/ register view adapted from previous projects

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "pacman/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "pacman/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "pacman/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "pacman/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "pacman/register.html")
