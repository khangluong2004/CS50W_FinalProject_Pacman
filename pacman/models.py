from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here
class User(AbstractUser):
    score = models.IntegerField(default = 0)
    challenge_sent = models.IntegerField(default = 0)
    challenge_win = models.IntegerField(default = 0)

# For challenges between users
class Challenges(models.Model):
    sender = models.ForeignKey("User", on_delete = models.CASCADE, related_name = "challenge_sender")
    receiver = models.ForeignKey("User", on_delete = models.CASCADE, related_name = "challenge_receiver")
    bet_score = models.IntegerField()
    sender_win = models.BooleanField()
    finalized = models.BooleanField()