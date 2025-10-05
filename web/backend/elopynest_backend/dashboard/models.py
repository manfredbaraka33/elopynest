from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Routine(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='routines')
    title = models.CharField(max_length=100)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    awarded_xp = models.BooleanField(default=False)
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.status}"

class JournalPrompt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    prompt = models.TextField()
    date = models.DateField(auto_now_add=True)
    
class Journal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE,related_name='journals')
    prompt = models.TextField(default=True,null=True)
    text = models.TextField()
    date = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.prompt}--------------{self.text}"
    

class UserStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    mood_score = models.IntegerField(default=5)
    last_mood_update = models.DateTimeField(null=True, blank=True)
    xp = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    streak = models.IntegerField(default=0)
    
    
class Habit(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('active', 'Active'),
        ('missed', 'Missed'),
        ('pending', 'Pending'),
        ('grace_period', 'Grace Period'),
         ('inactive', 'Inactive'),
    ]
    
    SCHEDULE_TYPE_CHOICES = [
        ('daily', 'Daily'),
        ('custom', 'Custom'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habits')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    last_checkin = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    streak = models.IntegerField(default=0)
    schedule_type = models.CharField(max_length=10, choices=SCHEDULE_TYPE_CHOICES, default='daily')
    scheduled_days = models.JSONField(default=list, blank=True)
    VISIBILITY_CHOICES = [
        ('private', 'Private'),
        ('buddy', 'Buddy Only'),
        ('public', 'Public'),
    ]
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default='private')
    allow_buddy = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} ({self.user.username})"
    
class HabitCheckIn(models.Model):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name="check_ins")
    date = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ('habit', 'date')

    def __str__(self):
        return f"{self.habit.title} - {self.date}"
    
    
class HabitCheckInLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habits_log')
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name="check_ins_log")
    date = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ('habit', 'date')

    def __str__(self):
        return f"{self.habit.title} - {self.date}"
    
    
class HabitReflection(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habit_reflections')
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='reflections')
    date = models.DateField(auto_now_add=True)
    text = models.TextField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'habit', 'date'], name='imp_details'),
        ]
    
    def __str__(self):
        return f"{self.habit.title} - {self.date}"
    
    
    
class AccountabilityBuddy(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_buddy_requests')
    buddy = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_buddy_requests')
    habit = models.ForeignKey('Habit', on_delete=models.CASCADE, related_name='buddy_relationships')
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'buddy', 'habit')

    def __str__(self):
        return f"{self.user} ↔ {self.buddy} ({self.habit.title})",



class MoodLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mood_logs')
    mood_score = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.mood_score} on {self.timestamp.date()}"
    


class DeviceToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    
    
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=255)
    body = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
