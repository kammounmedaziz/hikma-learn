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

    def calculate_grade(self):
        """
        Calculate the normalized grade for this quiz submission.

        The grade is computed by evaluating each question's chosen answers:
        - If the set of chosen answers exactly matches the set of correct answers,
        the student earns full points for that question.
        - Otherwise, a penalty is applied for each incorrect chosen answer.
        The penalty per wrong answer is defined by PENALTY_RATIO (0.5 points).
        - The score for each question is the question's points minus penalties,
        floored at zero (no negative scores).
        - The final grade is the sum of earned points divided by the total possible points,
        resulting in a value between 0.0 and 1.0.

        Returns:
            float: The normalized grade (0.0 to 1.0) for the quiz submission.
        """
        PENALTY_RATIO = 0.5
        questions = self.quiz.questions.all()
        total_points = sum(q.points for q in questions)
        if total_points == 0:
            return 0.0

        # Group answers by question ID
        answers_by_question = {}
        for sa in self.answers.select_related('chosen_answer', 'question'):
            answers_by_question.setdefault(sa.question_id, []).append(sa.chosen_answer)

        earned_points = 0.0
        for question in questions:
            chosen_answers = answers_by_question.get(question.id, [])
            if not chosen_answers:
                continue

            chosen_ids = {ans.id for ans in chosen_answers}
            correct_ids = set(question.answers.filter(is_correct=True).values_list('id', flat=True))
            wrong_count = sum(not ans.is_correct for ans in chosen_answers)

            if chosen_ids == correct_ids:
                question_score = question.points
            else:
                penalty = PENALTY_RATIO * wrong_count
                question_score = max(question.points - penalty, 0)

            earned_points += question_score

        return earned_points / total_points

class SubmissionAnswer(models.Model):
    submission = models.ForeignKey(QuizSubmission, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    chosen_answer = models.ForeignKey(Answer, on_delete=models.CASCADE)
