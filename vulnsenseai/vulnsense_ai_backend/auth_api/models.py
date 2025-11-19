from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("superadmin", "Super Admin"),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="admin")

    def __str__(self):
        return f"{self.username} ({self.role})"


class SystemActivity(models.Model):
    ACTION_CHOICES = (
        ('add_user', 'Add User'),
        ('delete_user', 'Delete User'),
        ('activate_user', 'Activate User'),
        ('deactivate_user', 'Deactivate User'),
        ('promote_superadmin', 'Promote to SuperAdmin'),
        ('login', 'Login'),
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="actions")
    target_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="targeted_actions")
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action} on {self.target_user} by {self.performed_by}"