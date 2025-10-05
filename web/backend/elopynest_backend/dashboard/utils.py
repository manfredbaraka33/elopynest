from datetime import date, timedelta, datetime
from django.utils import timezone
from .models import Routine, Journal, UserStats

def has_activity_for_date(user, d):
    routine_done = Routine.objects.filter(user=user, date=d, status='completed').exists()
    journal_done = Journal.objects.filter(user=user, date=d).exists()

    stats = UserStats.objects.filter(user=user).first()
    mood_done = False
    if stats and stats.last_mood_update:
        # Compare date part only because last_mood_update might be datetime or date
        if isinstance(stats.last_mood_update, datetime):
            mood_done = stats.last_mood_update.date() == d
        else:
            mood_done = stats.last_mood_update == d

    return routine_done or journal_done or mood_done


TEST_INTERVAL = timedelta(seconds=5)  # For testing; use timedelta(days=1) for production

def update_user_streak(user):
    stats, _ = UserStats.objects.get_or_create(user=user)
    now = timezone.now()  # timezone-aware datetime

    last_update = stats.last_mood_update

    # If no last update, initialize streak and datetime
    if not last_update:
        stats.streak = 1
        stats.last_mood_update = now
        stats.save()
        return

    # Convert last_update to datetime if it is a date
    if isinstance(last_update, date) and not isinstance(last_update, datetime):
        last_update = datetime.combine(last_update, datetime.min.time())
        last_update = timezone.make_aware(last_update, timezone.get_current_timezone())

    diff = now - last_update

    if diff < TEST_INTERVAL:
        # Already updated recently, no streak increment
        return

    if diff <= TEST_INTERVAL * 2:
        stats.streak += 1
    else:
        stats.streak = 1

    stats.last_mood_update = now
    stats.save()


def add_xp(user, amount):
    stats, _ = UserStats.objects.get_or_create(user=user)
    stats.xp += amount

    # Level up logic
    while stats.xp >= 100 * stats.level:
        stats.level += 1

    stats.save()
    return stats


def subtract_xp(user, amount):
    stats, _ = UserStats.objects.get_or_create(user=user)
    stats.xp = max(0, stats.xp - amount)  # Don’t allow negative XP
    stats.save()
