from rest_framework.response import Response # type: ignore
from rest_framework.decorators import api_view # type: ignore
from .models import Habit
from .serializers import HabitSerializer


@api_view(['GET'])
def list_habits(request):
    habits = Habit.objects.filter(user=request.user)
    serializer = HabitSerializer(habits, many=True)
    return Response(serializer.data)

