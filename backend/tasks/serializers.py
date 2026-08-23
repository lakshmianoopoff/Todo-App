from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["id", "title", "is_completed", "created_at", "owner"]
        read_only_fields = ["id", "created_at", "owner"]

    def validate_title(self, value):
        if value is None:
            raise serializers.ValidationError("Title is required.")
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title cannot be empty or whitespace only.")
        return value
