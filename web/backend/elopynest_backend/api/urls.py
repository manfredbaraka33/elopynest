from django.urls import path
from rest_framework_simplejwt.views import ( # type: ignore
    TokenObtainPairView,
    TokenRefreshView,
)

from accounts.views import RegisterView
from dashboard.views import DashboardView,UserStatsUpdateView
from dashboard import views

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("register/", RegisterView.as_view(), name="register"),
    path('user/dashboard/', DashboardView.as_view(), name='user-dashboard'),
    path('user/stats/', UserStatsUpdateView.as_view(), name='user-stats-update'),
    path("user/addroutine/", views.add_routine),
    path("user/addjournal/", views.add_journal),
    path("user/alljournals/", views.all_journals),
    path("user/routine/<int:routine_id>/", views.update_routine),
    path("user/habit/<int:habit_id>/", views.update_habit),
    path("user/routine/<int:routine_id>/delete/", views.delete_routine),
    path("user/habit/<int:habit_id>/delete/", views.delete_habit),
    path('user/habit/create/', views.create_habit),
    path('user/habits/', views.list_habits),
    path('user/moodtrend/', views.get_mood_logs),
    path('user/habit/<int:habit_id>/checkin/', views.checkin_habit),
    path('user/save_streak/<int:habit_id>/', views.save_streak),
    path('user/habits/<int:habit_id>/checkins/', views.habit_checkins_logs, name='habit_checkins'),
    path('user/habits/<int:habit_id>/reflections/', views.add_reflection, name='create_habit_reflection'),
    path('user/reflections/', views.all_reflections, name='all-reflections'),
    path('ai/reflection-feedback/', views.wellness_feedback_view, name='ai-feedback'),
    path('user/habit/search-buddies/', views.search_buddies),
    path('user/habit/send-buddy-request/', views.send_buddy_request),
    path('user/habit/<int:habit_id>/search-buddies/', views.search_buddies, name='search-buddies'),
    path('buddy/incoming/', views.incoming_buddy_requests, name='incoming-buddy-requests'),
    path('buddy/outgoing/', views.outgoing_buddy_requests, name='outgoing-buddy-requests'),
    path('buddy/<int:habit_id>/respond/', views.respond_buddy_request, name='respond-buddy-request'),
    path('notifications/save-token/', views.save_device_token),
    path('notifications/', views.get_notifications, name='get_notifications'),
    path('notifications/mark-all-read/', views.mark_all_notifications_as_read, name='mark-all-notifications-as-read'),
    path('notifications/mark-selected-read/', views.mark_notification_read, name='mark-selected-notifications-as-read'),
     path('leaderboard/general/', views.general_leaderboard_view, name='general-leaderboard'),
    path('leaderboard/habits/', views.habit_list_view, name='habit-list'),
    path('leaderboard/habits/<int:habit_id>/', views.habit_leaderboard_view, name='habit-leaderboard'),
]
