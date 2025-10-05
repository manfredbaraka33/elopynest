from langchain import PromptTemplate, LLMChain
from langchain_groq import ChatGroq  # type: ignore
import os
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

llm = ChatGroq(
    temperature=0.7,
    groq_api_key=GROQ_API_KEY,
    model_name="llama-3.3-70b-versatile",
    max_tokens=200
)

# The template now includes 'today_str' to give the LLM the current day
template = """
You are an AI wellness coach. Based on the following user input in not more than 190 tokens,
provide an insightful and encouraging feedback to help improve their wellness journey.

User Input:
- User: {username}
- Today is: {today_str}
- Habit: {habit_title}
- Schedule: {schedule_type} {scheduled_days}
- Streak {streak}
- Mood Score (1-10): {mood_score}
- Reflection Text: {text}

Instructions:
1. Greet the user by their name.
2. Acknowledge the habit and mood score.
3. Analyze the reflection text to identify the user’s feelings or challenges.
4. Offer positive, actionable suggestions or encouragement to support the user’s progress.
5. End with an empathetic and motivating sign-off.
6. The sign-off should include a clear call to action for their next check-in based on their schedule:
    - If schedule is 'daily', say "I'll see you tomorrow!"
    - If schedule is 'custom', mention the next scheduled day(s) from the list.

Example output:
"Hi John! Great job keeping up with your water drinking for 5 days straight.
A mood score of 3 shows you're struggling. 
It's understandable that drinking water daily can feel inconvenient. Keep focusing on small,
manageable goals to maintain or improve your wellness. I'll see you tomorrow!"

Now, generate the feedback for the input above, be as accurate as possible.
"""

prompt = PromptTemplate(
    input_variables=["habit_title", "mood_score", "text", "streak", "username", 
                     "schedule_type", "scheduled_days", "today_str"],
    template=template
)


chain = prompt | llm


def generate_wellness_feedback(habit_title: str, mood_score: str,
                               text: str, streak: str, username: str,
                               schedule_type: str, scheduled_days: list, today_str: str) -> str:
    response = chain.invoke({
        "habit_title": habit_title,
        "mood_score": mood_score,
        "text": text,
        "streak": streak,
        "username": username,
        "schedule_type": schedule_type,
        "scheduled_days": scheduled_days,
        "today_str": today_str
    })
    return response.content