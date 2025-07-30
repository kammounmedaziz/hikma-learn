from django.db import models
from accounts.models import User, UserType
# from courses.models import Chapter
from django.core.exceptions import ValidationError

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

    def clean(self) -> None:
        if self.student.user_type != UserType.STUDENT:
            raise ValidationError({'student': "Only students can submit quizzes."})

        # Validate that answers are provided for all quiz questions
        question_ids = set(self.quiz.questions.values_list('id', flat=True))
        answered_question_ids = set(self.answers.values_list('question_id', flat=True))

        missing_questions = question_ids - answered_question_ids
        if missing_questions:
            missing_texts = list(
                self.quiz.questions.filter(id__in=missing_questions).values_list('text', flat=True)
            )
            raise ValidationError({
                'answers': f"Missing answers for questions: {', '.join(missing_texts)}"
            })

    def calculate_grade(self):
        PENALTY_RATIO = 0.5

        questions = self.quiz.questions.all()
        total_points = sum(q.points for q in questions)
        if total_points == 0:
            return 0.0

        chosen_map = {}
        for sa in self.answers.select_related('chosen_answer', 'question'):
            chosen_map.setdefault(sa.question_id, set()).add(sa.chosen_answer_id)

        weighted_score = 0.0
        for q in questions:
            correct_ids = set(q.answers.filter(is_correct=True).values_list('id', flat=True))
            chosen_ids  = chosen_map.get(q.id, set())

            num_correct_total = len(correct_ids)
            if num_correct_total == 0:
                continue

            correct_chosen = len(chosen_ids & correct_ids)
            wrong_chosen   = len(chosen_ids - correct_ids)

            raw_score = correct_chosen - PENALTY_RATIO * wrong_chosen
            raw_score = max(raw_score, 0.0)

            ratio = raw_score / num_correct_total
            weighted_score += ratio * q.points

        return weighted_score / total_points

class SubmissionAnswer(models.Model):
    submission = models.ForeignKey(QuizSubmission, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    chosen_answer = models.ForeignKey(Answer, on_delete=models.CASCADE)

    def clean(self) -> None:

        if self.submission.quiz != self.question.quiz:
            raise ValidationError("The question does not belong to the quiz of this submission.")

        if self.chosen_answer.question != self.question:
            raise ValidationError("The chosen answer does not belong to the specified question.")
