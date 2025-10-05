from datetime import timedelta, date
from django.utils import timezone
from rest_framework.views import APIView    # type: ignore
from rest_framework.response import Response   # type: ignore
from rest_framework.permissions import IsAuthenticated  # type: ignore
from rest_framework.decorators import api_view, permission_classes,action  # type: ignore
from rest_framework import status  # type: ignore
from .models import (
    Routine,
    UserStats,
    Journal,
    Habit,
    MoodLog,
    HabitCheckInLog,
    HabitReflection,
    AccountabilityBuddy,
    DeviceToken,
    Notification,
)
from django.db import transaction
from .serializers import (
    DashboardSerializer,
    UserStatsSerializer,
    RoutineSerializer,
    JournalSerializer,
    HabitSerializer,
    MoodLogSerializer,
    HabitCheckInLogSerializer,
    HabitReflectionSerializer,
    AccountabilityBuddySerializer,
    NotificationSerializer,
)
from .utils import update_user_streak, add_xp, subtract_xp
from .langchain_helper import generate_wellness_feedback
from django.db.models import Q, Count,F
from django.contrib.auth import get_user_model
from .firebase_push import send_push_and_store
from rest_framework import viewsets # type: ignore


User = get_user_model()
TEST_INTERVAL = timedelta(seconds=5)  # for testing quick updates


# =======================
# DASHBOARD
# =======================
class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        stats_obj, _ = UserStats.objects.get_or_create(user=user)

        data = {
            "name": user.get_full_name() or user.username,
            "stats": {
                "mood_score": stats_obj.mood_score,
                "streak": stats_obj.streak,
                "xp": stats_obj.xp,
                "level": stats_obj.level,
            },
            "today_prompt": "Reflect on your accomplishments today.",
            "routines": Routine.objects.filter(user=user, date=date.today()),
        }
        serializer = DashboardSerializer(data)
        return Response(serializer.data)


# =======================
# USER STATS & MOOD
# =======================
class UserStatsUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        serializer = UserStatsSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            stats, _ = UserStats.objects.get_or_create(user=request.user)
            now = timezone.now()

            for attr, value in serializer.validated_data.items():
                setattr(stats, attr, value)

            if "mood_score" in serializer.validated_data:
                if (not stats.last_mood_update) or (now - stats.last_mood_update >= TEST_INTERVAL):
                    add_xp(request.user, 5)
                    stats.last_mood_update = now
                    update_user_streak(request.user)
                MoodLog.objects.create(user=request.user, mood_score=stats.mood_score)

            stats.save()

            return Response(
                {
                    "mood_score": stats.mood_score,
                    "xp": stats.xp,
                    "streak": stats.streak,
                    "level": stats.level,
                },
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =======================
# ROUTINES
# =======================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_routine(request):
    title = request.data.get("title", "").strip()
    if not title:
        return Response({"error": "Title is required."}, status=status.HTTP_400_BAD_REQUEST)

    if Routine.objects.filter(user=request.user, title__iexact=title, date=date.today()).exists():
        return Response({"error": "You already have a routine with this title today."}, status=status.HTTP_400_BAD_REQUEST)

    routine = Routine.objects.create(user=request.user, title=title)
    add_xp(request.user, 10)
    serializer = RoutineSerializer(routine)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_routine(request, routine_id):
    try:
        routine = Routine.objects.get(id=routine_id, user=request.user)
    except Routine.DoesNotExist:
        return Response({"error": "Routine not found."}, status=status.HTTP_404_NOT_FOUND)

    title = request.data.get("title")
    status_val = request.data.get("status")

    if title:
        routine.title = title

    if status_val in ["pending", "completed"]:
        is_completing = status_val == "completed" and not routine.awarded_xp
        is_uncompleting = status_val == "pending" and routine.awarded_xp
        routine.status = status_val

        if is_completing:
            routine.awarded_xp = True
            add_xp(request.user, 5)
            update_user_streak(request.user)
        elif is_uncompleting:
            routine.awarded_xp = False
            subtract_xp(request.user, 5)

    routine.save()
    return Response(RoutineSerializer(routine).data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_routine(request, routine_id):
    try:
        Routine.objects.get(id=routine_id, user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Routine.DoesNotExist:
        return Response({"error": "Routine not found."}, status=status.HTTP_404_NOT_FOUND)


# =======================
# JOURNALS
# =======================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_journal(request):
    text = request.data.get("text", "").strip()
    p = request.data.get("p", "").strip()
    if not text:
        return Response({"error": "Text is required."}, status=status.HTTP_400_BAD_REQUEST)

    journal = Journal.objects.create(user=request.user, text=text, prompt=p)
    add_xp(request.user, 10)
    update_user_streak(request.user)

    return Response(JournalSerializer(journal).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def all_journals(request):
    journals = Journal.objects.filter(user=request.user).order_by("-date")
    data = [{"text": j.text, "prompt": j.prompt, "date": j.date} for j in journals]
    return Response({"data": data}, status=status.HTTP_200_OK)


# =======================
# HABITS
# =======================
def update_habit_status(habit):
    now = timezone.now()
    today_str = now.strftime("%a").lower()  # 'mon', 'tue', etc.

    # Check if it's a custom schedule and today is not in scheduled_days
    if habit.schedule_type == "custom" and today_str not in habit.scheduled_days:
        habit.status = "inactive"
        habit.save()
        return habit

    if habit.last_checkin and habit.streak > 0:
        time_since = now - habit.last_checkin
        if time_since > timedelta(days=3):
            habit.status = "missed"
        elif time_since > timedelta(days=2):
            habit.status = "grace_period"
        elif time_since > timedelta(days=1):
            habit.status = "pending"
        else:
            habit.status = "active"
    else:
        habit.status = "new"
    habit.save()
    return habit


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_habit(request):
    serializer = HabitSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_habits(request):
    habits = Habit.objects.filter(user=request.user).order_by("-created_at")

    for habit in habits:
        update_habit_status(habit)

    serializer = HabitSerializer(habits, many=True)
    return Response(serializer.data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_habit(request, habit_id):
    try:
        habit = Habit.objects.get(id=habit_id, user=request.user)
    except Habit.DoesNotExist:
        return Response({"error": "Habit not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = HabitSerializer(habit, data=request.data, partial=True)

    if serializer.is_valid(raise_exception=True):
        serializer.save()
        return Response(serializer.data)

    # Unreachable due to raise_exception=True
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_habit(request, habit_id):
    try:
        Habit.objects.get(id=habit_id, user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Habit.DoesNotExist:
        return Response({"error": "Habit not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def checkin_habit(request, habit_id):
    try:
        habit = Habit.objects.get(id=habit_id, user=request.user)
    except Habit.DoesNotExist:
        return Response({"error": "Habit not found."}, status=status.HTTP_404_NOT_FOUND)

    if habit.status == "active":
        return Response({"message": "Habit already active today."}, status=status.HTTP_400_BAD_REQUEST)

    if habit.status == "inactive":
        return Response({"error": "This habit is not scheduled for today."}, status=status.HTTP_400_BAD_REQUEST)

    if habit.status == "missed":
        habit.streak = 0

    habit.status = "active"
    habit.last_checkin = timezone.now()
    habit.streak += 1
    habit.save()
    
    HabitCheckInLog.objects.create(user=request.user,habit=habit, date=habit.last_checkin.date())
    
    add_xp(request.user, 5)

    return Response(HabitSerializer(habit).data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def habit_checkins_logs(request,habit_id):
    print(f"Here is the user {request.user}")
    habit=Habit.objects.get(pk=habit_id)
    all_checkins=HabitCheckInLog.objects.filter(user=request.user,habit=habit)
    
    serializer=HabitCheckInLogSerializer(all_checkins,many=True)
    return Response(serializer.data)




@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def save_streak(request, habit_id):
    try:
        habit = Habit.objects.get(id=habit_id, user=request.user)
    except Habit.DoesNotExist:
        return Response({"error": "Habit not found."}, status=status.HTTP_404_NOT_FOUND)

    habit.status = "active"
    habit.streak = 1
    habit.last_checkin = timezone.now()
    habit.save()

    subtract_xp(request.user, 5)

    return Response(HabitSerializer(habit).data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_reflection(request, habit_id):
    data = request.data.copy()
    data['habit'] = habit_id  
    
    serializer = HabitReflectionSerializer(data=data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_reflections(request):
    reflections = HabitReflection.objects.filter(user=request.user).select_related('habit').order_by('-date')
    serializer = HabitReflectionSerializer(reflections, many=True)
    return Response(serializer.data)



# =======================
# MOOD LOGS
# =======================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_mood_log(request):
    serializer = MoodLogSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_mood_logs(request):
    mood_logs = MoodLog.objects.filter(user=request.user).order_by("timestamp")
    serializer = MoodLogSerializer(mood_logs, many=True)
    return Response(serializer.data)



# =======================
# ACCOUNTABILITY BUDDIES
# =======================


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_buddies(request, habit_id):
    # Get the habit to ensure it exists
    try:
        habit = Habit.objects.get(id=habit_id)
    except Habit.DoesNotExist:
        return Response({"error": "Habit not found"}, status=404)

    # Use aggregation to find unique users with the same habit
    unique_users = Habit.objects.filter(
        title=habit.title,
        user__is_active=True,
        allow_buddy=True
    ).exclude(user=request.user).values('user').annotate(
        habit_count=Count('user')
    )

    results = []
    for user_data in unique_users:
        # Get the user object using the user ID from the aggregated data
        user = User.objects.get(id=user_data['user'])
        results.append({
            "user_id": user.id,
            "username": user.username,
            "profile_url": f"/api/users/{user.id}/",
        })

    return Response(results)



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_buddy_request(request):
    """
    Handles sending accountability buddy requests.
    Expects 'buddy_ids' (list of user IDs) and 'habitId' in the request data.
    Sends push notifications to the requested buddies.
    """
    buddy_ids = request.data.get("buddy_ids", [])
    habit_id = request.data.get("habitId") # Renamed for clarity, though original was 'habitId'

    # Validate input
    if not isinstance(buddy_ids, list) or not buddy_ids:
        return Response({"error": "buddy_ids must be a non-empty list."}, status=status.HTTP_400_BAD_REQUEST)
    if not habit_id:
        return Response({"error": "habitId is required."}, status=status.HTTP_400_BAD_REQUEST)

    requester = request.user
    created_requests = []

    try:
        habit = Habit.objects.get(pk=habit_id)
    except Habit.DoesNotExist:
        return Response({"error": f"Habit with ID {habit_id} not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": f"An error occurred fetching the habit: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    for buddy_id in buddy_ids:
        # Skip if the buddy ID is the same as the requester's ID
        if buddy_id == requester.id:
            continue

        try:
            buddy_user = User.objects.get(pk=buddy_id)
        except User.DoesNotExist:
            print(f"User with ID {buddy_id} not found. Skipping buddy request for this ID.")
            continue # Skip to the next buddy_id

        # Check if an accountability buddy relationship already exists
        # This checks in both directions to prevent duplicate requests if the relationship
        # can be initiated from either side. Adjust if your model implies strict one-way.
        exists = AccountabilityBuddy.objects.filter(
            user=requester, buddy=buddy_user, habit=habit
        ).exists() or AccountabilityBuddy.objects.filter(
            user=buddy_user, buddy=requester, habit=habit
        ).exists()

        if exists:
            print(f"Accountability buddy relationship already exists between {requester.username} and {buddy_user.username} for habit {habit.title}. Skipping.")
            continue # Skip if already exists

        # Create the new accountability buddy request
        try:
            new_request = AccountabilityBuddy.objects.create(user=requester, buddy=buddy_user, habit=habit)
            created_requests.append(new_request)

            # Define notification content
            notification_title = "New Buddy Request"
            notification_body = (
                f"{requester.get_full_name() or requester.username} "
                f"wants to be your accountability buddy for the habit: {new_request.habit.title}."
            )

            # Get all FCM tokens for the buddy user
            tokens = [
                device_token.token
                for device_token in DeviceToken.objects.filter(user=buddy_user)
            ]

            # Send notification using the helper function
            if tokens:
                send_push_and_store(
                    buddy_user,
                    notification_title,
                    notification_body,
                    tokens # Pass the list of tokens
                )

        except Exception as e:
            print(f"Error creating buddy request or sending notification for {buddy_user.username}: {e}")
            # Consider adding this failed request to a separate list to report back,
            # or rolling back the transaction if any request failure makes the whole operation invalid.

    # Serialize the successfully created requests and return the response
    if not created_requests:
        return Response({"message": "No new buddy requests were created (they might already exist or users not found)."}, status=status.HTTP_200_OK)

    serializer = AccountabilityBuddySerializer(created_requests, many=True)
    return Response(serializer.data, status=status.HTTP_201_CREATED)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def incoming_buddy_requests(request):
    """List all buddy requests sent TO the current user that are still pending."""
    requests = AccountabilityBuddy.objects.filter(
        buddy=request.user,
        status="pending"
    ).select_related("user", "habit").order_by('-created_at')

    data = []
    for req in requests:
        data.append({
            "id": req.id,
            "from_user_id": req.user.id,
            "from_username": req.user.username,
            "habit_id": req.habit.id,
            "habit_title": req.habit.title,
            "status": req.status,
            "sent_at": req.created_at,
        })
    return Response(data, status=status.HTTP_200_OK)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def outgoing_buddy_requests(request):
    """List all buddy requests SENT by the current user with their statuses."""
    requests = AccountabilityBuddy.objects.filter(
        user=request.user,status="pending"
    ).select_related("buddy", "habit").order_by('-created_at')

    data = []
    for req in requests:
        data.append({
            "id": req.id,
            "to_user_id": req.buddy.id,
            "to_username": req.buddy.username,
            "habit_id": req.habit.id,
            "habit_title": req.habit.title,
            "status": req.status,
            "sent_at": req.created_at,
        })
    return Response(data, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def respond_buddy_request(request, habit_id):
    """
    Allows a user to accept or reject an accountability buddy request.
    The habit_id is passed in the URL.
    """
    request_id = request.data.get("request_id")
    action = request.data.get("action")

    if request_id is None or action is None:
        return Response({"error": "request_id and action are required."}, status=status.HTTP_400_BAD_REQUEST)
    
    # Use the 'action' directly to determine the new status
    new_status = 'accepted' if action == "accepted" else 'rejected'

    try:
        buddy_request = AccountabilityBuddy.objects.get(id=request_id, buddy=request.user)
    except AccountabilityBuddy.DoesNotExist:
        return Response({"error": "Buddy request not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": f"An error occurred fetching the request: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    with transaction.atomic():
        requester = buddy_request.user # The original requester is in the 'user' field
        
        # Update the 'status' field correctly
        buddy_request.status = new_status
        buddy_request.save()

        # Send notification logic
        if new_status == 'accepted':
            notification_title = "Buddy Request Accepted 🎉"
            notification_body = (
                f"{request.user.get_full_name() or request.user.username} has accepted "
                f"your buddy request for the habit: {buddy_request.habit.title}."
            )
        else: # action == "rejected"
            notification_title = "Buddy Request Declined 😔"
            notification_body = (
                f"{request.user.get_full_name() or request.user.username} has declined "
                f"your buddy request for the habit: {buddy_request.habit.title}."
            )
            # Delete the request for a rejected status
            buddy_request.delete()

        # Get all FCM tokens for the requester
        tokens = [
            device_token.token
            for device_token in DeviceToken.objects.filter(user=requester)
        ]

        if tokens:
            try:
                send_push_and_store(requester, notification_title, notification_body, tokens)
            except Exception as e:
                print(f"Error sending notification: {e}")

        if new_status == 'accepted':
            return Response({"message": "Buddy request accepted."})
        else:
            return Response({"message": "Buddy request rejected."})



# =====================
#  GenAI
# =====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def wellness_feedback_view(request):
    # Retrieve all necessary data from the request payload
    habit_title = request.data.get("habit_title")
    mood_score = request.data.get("mood_score")
    text = request.data.get("text")
    streak = request.data.get("streak")
    
    # New fields from the frontend
    username = request.data.get("username")
    schedule_type = request.data.get("schedule_type")
    scheduled_days = request.data.get("scheduled_days")
    
    now = timezone.now()
    today_str = now.strftime('%a').lower()

    # A more robust validation check
    if not all([habit_title, mood_score, text, username, schedule_type]):
        return Response(
            {"error": "habit_title, mood_score, text, username, and schedule_type are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    streak+=1
    # Pass all the relevant data to the feedback generation function
    feedback = generate_wellness_feedback(
        habit_title, 
        mood_score, 
        text, 
        streak, 
        username, 
        schedule_type, 
        scheduled_days,
        today_str
    )
    
    return Response({"feedback": feedback})




# =======================
# DEVICE TOKEN
# =======================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_device_token(request):
    token = request.data.get("fcm_token")
    if not token:
        return Response({"error": "Token is required."}, status=status.HTTP_400_BAD_REQUEST)

    DeviceToken.objects.update_or_create(user=request.user, defaults={"token": token})
    return Response({"message": "Device token saved successfully."})






# =======================
# NOTIFICATIONS
# =======================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    notifications = Notification.objects.filter(user=request.user).order_by("-created_at")
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)



# =======================
# NOTIFICATIONS
# =======================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_notification_read(request):
    """
    Marks a notification as read.
    """
    notification_id = request.data.get("notification_id")
    if not notification_id:
        return Response({"error": "notification_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Get the notification and ensure it belongs to the current user
        notification = Notification.objects.get(id=notification_id, user=request.user)
    except Notification.DoesNotExist:
        return Response({"error": "Notification not found or does not belong to the user."}, status=status.HTTP_404_NOT_FOUND)

    # Correctly update the 'read' field from your model
    notification.read = True
    notification.save()
    return Response({"message": "Notification marked as read."})



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_all_notifications_as_read(request):
    """
    Marks all unread notifications for the current user as read.
    """
    try:
        # Use an atomic transaction for safety
        with transaction.atomic():
            # Update all unread notifications for the user in a single query
            updated_count = Notification.objects.filter(user=request.user, read=False).update(read=True)
        return Response({"message": f"{updated_count} notifications marked as read."})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_selected_notifications_as_read(request):
    """
    Marks a list of specified notifications as read.
    Expects a list of notification IDs in the request body.
    """
    notification_ids = request.data.get("notification_ids")

    if not isinstance(notification_ids, list) or not notification_ids:
        return Response({"error": "notification_ids must be a non-empty list."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            # Filter for notifications belonging to the user and whose IDs are in the provided list
            # This ensures a user can't mark someone else's notifications as read
            updated_count = Notification.objects.filter(
                user=request.user, id__in=notification_ids
            ).update(read=True)
        return Response({"message": f"{updated_count} notifications marked as read."})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




@api_view(['GET'])
def general_leaderboard_view(request):
    """
    API endpoint for the general leaderboard based on total XP.
    """
    # Use .select_related() to retrieve related user data
    top_users_stats = UserStats.objects.select_related('user').order_by(F('xp').desc())[:50]
    
    # Manually format the data to include a nested user object
    leaderboard_data = []
    for stats in top_users_stats:
        leaderboard_data.append({
            'id': stats.id,
            'user': {
                'id': stats.user.id,
                'username': stats.user.username
            },
            'xp': stats.xp
        })
    
    current_user_rank = None
    if request.user.is_authenticated:
        try:
            current_user_stats = UserStats.objects.get(user=request.user)
            current_user_rank = UserStats.objects.filter(xp__gt=current_user_stats.xp).count() + 1
        except UserStats.DoesNotExist:
            pass
            
    response_data = {
        'leaderboard': leaderboard_data,
        'current_user_rank': current_user_rank
    }
    
    return Response(response_data)


@api_view(['GET'])
def habit_list_view(request):
    """
    API endpoint to get a list of all unique habit titles with their IDs.
    """
    # Use .values() to return a list of dictionaries with 'id' and 'title'.
    habits = Habit.objects.all().values('id', 'title').distinct()
    return Response(list(habits))



@api_view(['GET'])
def habit_leaderboard_view(request, habit_id):
    """
    API endpoint for the habit-specific leaderboard based on streaks for a given habit ID.
    """
    try:
        # Get the habit to filter on its title
        habit = Habit.objects.get(id=habit_id)
    except Habit.DoesNotExist:
        return Response({"error": "Habit not found."}, status=404)

    # Filter all habits by the same title across all users and order by streak.
    # Use .select_related() to retrieve related user data
    leaderboard_data = Habit.objects.filter(title=habit.title) \
        .select_related('user') \
        .order_by(F('streak').desc())[:50]
    
    # Manually format the data to include the nested 'user' object
    formatted_data = []
    for item in leaderboard_data:
        formatted_data.append({
            'id': item.id,
            'user': {
                'id': item.user.id,
                'username': item.user.username
            },
            'title': item.title,
            'description': item.description,
            'status': item.status,
            'streak': item.streak,
            'scheduled_days': item.scheduled_days,
            'schedule_type': item.schedule_type,
            'allow_buddy': item.allow_buddy,
            'visibility': item.visibility,
        })
        
    return Response(formatted_data)
