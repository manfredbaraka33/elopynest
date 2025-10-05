from rest_framework import serializers # type: ignore
from .models import Habit, HabitEntry, JournalEntry

class HabitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habit
        fields = '__all__'

class HabitEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitEntry
        fields = '__all__'

class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = '__all__'
