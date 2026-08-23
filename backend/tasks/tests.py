from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Task

User = get_user_model()

class TaskAPITestCase(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username="user1", password="password123")
        self.user2 = User.objects.create_user(username="user2", password="password123")

    def test_create_task_success(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post("/api/tasks/", {"title": " Buy grocery "}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Buy grocery")
        self.assertFalse(response.data["is_completed"])
        self.assertEqual(response.data["owner"], self.user1.id)

    def test_create_task_empty_title(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post("/api/tasks/", {"title": "   "}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_task_isolation(self):
        task1 = Task.objects.create(title="User 1 Task", owner=self.user1)
        task2 = Task.objects.create(title="User 2 Task", owner=self.user2)

        # Authenticate as User 1
        self.client.force_authenticate(user=self.user1)
        response = self.client.get("/api/tasks/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task_ids = [t["id"] for t in response.data]
        self.assertIn(task1.id, task_ids)
        self.assertNotIn(task2.id, task_ids)

        # User 1 attempting to access User 2's task directly returns 404
        response = self.client.patch(f"/api/tasks/{task2.id}/", {"is_completed": True}, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # User 1 attempting to delete User 2's task returns 404
        response = self.client.delete(f"/api/tasks/{task2.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_toggle_and_delete_task(self):
        self.client.force_authenticate(user=self.user1)
        task = Task.objects.create(title="Toggle test", owner=self.user1)

        # Toggle is_completed
        patch_response = self.client.patch(f"/api/tasks/{task.id}/", {"is_completed": True}, format="json")
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        self.assertTrue(patch_response.data["is_completed"])

        # Delete task
        delete_response = self.client.delete(f"/api/tasks/{task.id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=task.id).exists())
