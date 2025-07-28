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
    recipient_type = models.CharField(
        max_length=10,
        choices=RecipientType.choices,
        default=RecipientType.TEACHER
    )

    def __str__(self):
        return self.title

class Response(models.Model):
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='responses')
    identifiantRes = models.IntegerField()
    identifiantRec = models.IntegerField()
    identifiantUser = models.IntegerField()
    content = models.TextField()
    dateCreated = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Response to Issue #{self.issue.id}"