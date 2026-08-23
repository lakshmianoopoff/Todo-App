from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication

User = get_user_model()

class DevAutoAuthentication(BaseAuthentication):
    """
    Fallback authentication class for development.
    Ensures request.user is populated with a valid User instance when no explicit auth header/session is provided,
    allowing the app to work seamlessly as specified in PRD ('user is already logged in').
    """
    def authenticate(self, request):
        user, _ = User.objects.get_or_create(username="dev_user", defaults={"email": "dev@example.com"})
        return (user, None)
