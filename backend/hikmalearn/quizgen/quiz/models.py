from django.db import models

class Student(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

class TopicKnowledge(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    topic = models.CharField(max_length=100)
    level = models.CharField(max_length=20)  # beginner/intermediate/advanced
    weakness = models.BooleanField(default=False)

class QuizQuestion(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    topic = models.CharField(max_length=100)
    question_text = models.TextField()
    options = models.JSONField()
    correct_answer = models.CharField(max_length=200)
    explanation = models.TextField(null=True, blank=True)
