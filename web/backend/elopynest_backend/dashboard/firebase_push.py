import firebase_admin # type: ignore
from firebase_admin import credentials, messaging # type: ignore
from .models import DeviceToken,Notification
import os

cred_path = os.getenv("FIREBASE_KEY_PATH")


# Load Service Account Key JSON
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

def send_push_and_store(user, title, body, tokens):
    # Store in DB
    Notification.objects.create(user=user, title=title, body=body)

    # Send via FCM
    if not tokens:
        return False
    
    # Create the notification message
    notification = messaging.Notification(title=title, body=body)
    
    # Create the list of messages to send
    messages_to_send = [
        messaging.Message(notification=notification, token=token)
        for token in tokens
    ]

    try:
        # Use send_all to send to multiple devices in a single request
        response = messaging.send_each(messages_to_send)
        print(f'{response.success_count} messages were sent successfully')
        return True
    except Exception as e:
        print(f'Error sending FCM messages: {e}')
        return False
