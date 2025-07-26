from django.db import models
from django.utils import timezone

class IssueStatus(models.TextChoices):
    SENT = 'sent', 'Sent'
    IN_PROGRESS = 'inProgress', 'In Progress'
    RESOLVED = 'resolved', 'Resolved'
    REJECTED = 'rejected', 'Rejected'

class Issue(models.Model):
    identifiantRec = models.IntegerField()
    identifiantUser = models.IntegerField()
    title = models.CharField(max_length=255)
    content = models.TextField()
    dateCreated = models.DateTimeField(default=timezone.now)
    status = models.CharField(
        max_length=20,
        choices=IssueStatus.choices,
        default=IssueStatus.SENT
    )

    def __str__(self):
        return self.title
