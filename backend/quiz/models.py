from django.db import models
from accounts.models import User, UserType
# from courses.models import Chapter

class Quiz(models.Model):
    # chapter = models.ForeignKey(Chapter, related_name='quizzes', on_delete=models.CASCADE)
    teacher = models.ForeignKey(User, limit_choices_to={'user_type': UserType.TEACHER}, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    time_limit = models.IntegerField(blank=True, null=True)  # In minutes
    is_published = models.BooleanField(default=False)
    creation_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title}"

    @property
    def question_count(self):
        return self.questions.count()

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, related_name='questions', on_delete=models.CASCADE)
    text = models.TextField(blank=True, null=True)  # Allow null/blank for flexibility
    question_type = models.CharField(max_length=50, default='MCQ', choices=[('MCQ', 'Multiple Choice')])
    points = models.IntegerField(default=1)
    difficulty_level = models.CharField(max_length=50, choices=[('EASY', 'Easy'), ('MEDIUM', 'Medium'), ('HARD', 'Hard')], blank=True, null=True)
    creation_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text[:50] if self.text else "No text"

class Answer(models.Model):
    question = models.ForeignKey(Question, related_name='answers', on_delete=models.CASCADE)
    text = models.CharField(max_length=500, blank=True, null=True)  # Allow null/blank
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text[:50] if self.text else "No text"

class QuizSubmission(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='submissions')
    submitted_at = models.DateTimeField(auto_now_add=True)
    grade = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Submission by {self.student.username} for {self.quiz.title}"

class SubmissionAnswer(models.Model):
    submission = models.ForeignKey(QuizSubmission, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    chosen_answer = models.ForeignKey(Answer, on_delete=models.CASCADE)
