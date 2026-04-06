from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

from .models import Ticket


class TicketAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username="user1", password="pass12345")
        self.user2 = User.objects.create_user(username="user2", password="pass12345")

    def test_unauthorized_access_is_rejected(self):
        response = self.client.get("/api/tickets/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_can_create_ticket(self):
        self.client.force_authenticate(user=self.user1)
        payload = {
            "title": "Login Issue",
            "description": "Cannot login to dashboard",
            "status": "OPEN",
        }
        response = self.client.post("/api/tickets/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Ticket.objects.count(), 1)
        self.assertEqual(Ticket.objects.first().created_by, self.user1)

    def test_user_sees_only_related_tickets(self):
        my_ticket = Ticket.objects.create(
            title="Mine",
            description="Owned by user1",
            created_by=self.user1,
            assigned_to=self.user2,
        )
        Ticket.objects.create(
            title="Other",
            description="Not related",
            created_by=self.user2,
        )

        self.client.force_authenticate(user=self.user1)
        response = self.client.get("/api/tickets/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], my_ticket.id)
