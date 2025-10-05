from rest_framework import serializers # pyright: ignore[reportMissingImports]
from .models import Routine,Journal,Habit,MoodLog,HabitCheckInLog,HabitReflection,AccountabilityBuddy,Notification


class RoutineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Routine
        fields = '__all__'
        
        
class UserStatsSerializer(serializers.Serializer):
    mood_score = serializers.IntegerField()
    streak = serializers.IntegerField()
    xp = serializers.IntegerField()
    
    
    
    
from .models import Routine,Journal

class RoutineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Routine
        fields = '__all__'
        
        
class UserStatsSerializer(serializers.Serializer):
    mood_score = serializers.IntegerField()
    streak = serializers.IntegerField()
    xp = serializers.IntegerField()
    level = serializers.IntegerField()
    
class JournalSerializer(serializers.Serializer):
    class Meta:
        model = Journal
        fields = '__all__'
   


class DashboardSerializer(serializers.Serializer):
    name = serializers.CharField()
    stats = UserStatsSerializer()
    today_prompt = serializers.CharField()
    routines = RoutineSerializer(many=True)
       
    
class JournalSerializer(serializers.Serializer):
    class Meta:
        model = Journal
        fields = '__all__'
   

class DashboardSerializer(serializers.Serializer):
    name = serializers.CharField()
    stats = UserStatsSerializer()
    today_prompt = serializers.CharField()
    routines = RoutineSerializer(many=True)
    

class HabitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habit
        fields = ['id', 'title', 'description', 'status', 'created_at','streak','scheduled_days','schedule_type', 'allow_buddy', 'visibility']
        read_only_fields = ['id', 'created_at']


class MoodLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = MoodLog
        fields = ['timestamp', 'mood_score']
        
        
        
class HabitCheckInLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitCheckInLog
        fields = '__all__'
        
class HabitReflectionSerializer(serializers.ModelSerializer):
    habit_title = serializers.CharField(source='habit.title', read_only=True)
    class Meta:
        model = HabitReflection
        fields=['habit','text','date','habit_title']
        
        
class AccountabilityBuddySerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountabilityBuddy
        fields = '__all__'
        
        
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'body', 'read', 'created_at']