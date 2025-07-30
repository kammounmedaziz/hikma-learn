from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from accounts.models import User, UserType
from quiz.models import Quiz, Question, Answer, QuizSubmission, SubmissionAnswer


class QuizSubmissionTests(APITestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(username='teacher1', password='pass', user_type=UserType.TEACHER)
        self.teacher2 = User.objects.create_user(username='teacher2', password='pass', user_type=UserType.TEACHER)
        self.student = User.objects.create_user(username='student1', password='pass', user_type=UserType.STUDENT)
        self.other_student = User.objects.create_user(username='student2', password='pass', user_type=UserType.STUDENT)

        self.quiz = Quiz.objects.create(teacher=self.teacher, title="Sample Quiz", is_published=True)
        self.quiz_other = Quiz.objects.create(teacher=self.teacher2, title="Other Quiz", is_published=True)

        self.q1 = Question.objects.create(quiz=self.quiz, text="Q1", points=1)
        self.a1_1 = Answer.objects.create(question=self.q1, text="Correct", is_correct=True)
        self.a1_2 = Answer.objects.create(question=self.q1, text="Wrong", is_correct=False)

        self.q2 = Question.objects.create(quiz=self.quiz, text="Q2", points=1)
        self.a2_1 = Answer.objects.create(question=self.q2, text="Correct", is_correct=True)
        self.a2_2 = Answer.objects.create(question=self.q2, text="Wrong", is_correct=False)

        self.q_other = Question.objects.create(quiz=self.quiz_other, text="Other Q")
        self.a_other = Answer.objects.create(question=self.q_other, text="Other Answer", is_correct=True)

        self.client = APIClient()

    def test_student_can_submit_valid_submission(self):
        self.client.login(username='student1', password='pass')
        url = reverse('submission-list', kwargs={'quiz_pk': self.quiz.pk})
        data = {
            "answers": [
                {"chosen_answer": self.a1_1.id},
                {"chosen_answer": self.a2_2.id}
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_student_cannot_submit_twice(self):
        self.test_student_can_submit_valid_submission()
        self.client.login(username='student1', password='pass')
        url = reverse('submission-list', kwargs={'quiz_pk': self.quiz.pk})
        data = {
            "answers": [
                {"chosen_answer": self.a1_1.id},
                {"chosen_answer": self.a2_1.id}
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already submitted", str(response.data))

    def test_student_submission_missing_answers(self):
        self.client.login(username='student1', password='pass')
        url = reverse('submission-list', kwargs={'quiz_pk': self.quiz.pk})
        data = {
            "answers": [
                {"chosen_answer": self.a1_1.id}
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("missing answers", str(response.data).lower())

    def test_student_submission_with_chosen_answer_from_other_quiz(self):
        self.client.login(username='student1', password='pass')
        url = reverse('submission-list', kwargs={'quiz_pk': self.quiz.pk})
        data = {
            "answers": [
                {"chosen_answer": self.a1_1.id},
                {"chosen_answer": self.a_other.id}
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("does not belong to the quiz", str(response.data))

    def test_teacher_can_view_own_quiz_submissions(self):
        submission = QuizSubmission.objects.create(student=self.student, quiz=self.quiz)
        SubmissionAnswer.objects.create(submission=submission, question=self.q1, chosen_answer=self.a1_1)
        self.client.login(username='teacher1', password='pass')
        url = reverse('submission-list', kwargs={'quiz_pk': self.quiz.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_teacher_cannot_view_other_teachers_quiz_submissions(self):
        submission = QuizSubmission.objects.create(student=self.student, quiz=self.quiz_other)
        SubmissionAnswer.objects.create(submission=submission, question=self.q_other, chosen_answer=self.a_other)
        self.client.login(username='teacher1', password='pass')
        url = reverse('submission-list', kwargs={'quiz_pk': self.quiz_other.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_user_cannot_access(self):
        url = reverse('submission-list', kwargs={'quiz_pk': self.quiz.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_cannot_view_other_students_submissions(self):
        submission = QuizSubmission.objects.create(student=self.other_student, quiz=self.quiz)
        SubmissionAnswer.objects.create(submission=submission, question=self.q1, chosen_answer=self.a1_1)
        self.client.login(username='student1', password='pass')
        url = reverse('submission-detail', kwargs={'quiz_pk': self.quiz.pk, 'pk': submission.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_admin_can_view_any_quiz_submission(self):
        admin = User.objects.create_user(username='admin', password='adminpass', user_type=UserType.ADMIN, is_superuser=True)
        submission = QuizSubmission.objects.create(student=self.student, quiz=self.quiz)
        SubmissionAnswer.objects.create(submission=submission, question=self.q1, chosen_answer=self.a1_1)

        self.client.login(username='admin', password='adminpass')
        url = reverse('submission-detail', kwargs={'quiz_pk': self.quiz.pk, 'pk': submission.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], submission.id)

    def test_admin_cannot_create_submission(self):
        admin = User.objects.create_user(username='admin2', password='adminpass2', user_type=UserType.ADMIN, is_superuser=True)

        self.client.login(username='admin2', password='adminpass2')
        url = reverse('submission-list', kwargs={'quiz_pk': self.quiz.pk})
        data = {
            "answers": [
                {"chosen_answer": self.a1_1.id},
                {"chosen_answer": self.a2_2.id}
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

class QuizGradingLogicTests(TestCase):
    """Unit tests for QuizSubmission.calculate_grade() across several quizzes."""

    def setUp(self):
        self.teacher = User.objects.create_user(
            username='t', password='p', user_type=UserType.TEACHER)
        self.student = User.objects.create_user(
            username='s', password='p', user_type=UserType.STUDENT)

        # --- Quiz 1 : two questions (original scenario) ---
        self.quiz_2q = Quiz.objects.create(
            teacher=self.teacher, title="Two-Question Quiz", is_published=True)
        self.q1_2q = self._make_question(
            quiz=self.quiz_2q, text="Q1", points=2,
            correct_texts=["C1"], wrong_texts=["W1"])
        self.q2_2q = self._make_question(
            quiz=self.quiz_2q, text="Q2", points=3,
            correct_texts=["C2"], wrong_texts=["W2", "W3"])

        # --- Quiz 2 : single question ---
        self.quiz_1q = Quiz.objects.create(
            teacher=self.teacher, title="Single-Question Quiz", is_published=True)
        self.q1_1q = self._make_question(
            quiz=self.quiz_1q, text="Only Q", points=5,
            correct_texts=["Right"], wrong_texts=["Wrong"])

        # --- Quiz 3 : multiple correct answers + different weights ---
        self.quiz_mc = Quiz.objects.create(
            teacher=self.teacher, title="Multi-Correct Quiz", is_published=True)
        self.q1_mc = self._make_question(
            quiz=self.quiz_mc, text="MC", points=4,
            correct_texts=["C1", "C2"], wrong_texts=["W"])

    # ---------------- helpers ----------------
    def _make_question(self, quiz, text, points, correct_texts, wrong_texts):
        q = Question.objects.create(quiz=quiz, text=text, points=points)
        for txt in correct_texts:
            Answer.objects.create(question=q, text=txt, is_correct=True)
        for txt in wrong_texts:
            Answer.objects.create(question=q, text=txt, is_correct=False)
        return q

    def _submit(self, quiz, mapping):
        """mapping: dict {question: set([chosen_answer_ids])}"""
        submission = QuizSubmission.objects.create(student=self.student, quiz=quiz)
        for question, chosen_ids in mapping.items():
            for aid in chosen_ids:
                SubmissionAnswer.objects.create(
                    submission=submission,
                    question=question,
                    chosen_answer_id=aid)
        return submission

    # ---------------- actual tests ----------------
    def test_two_question_quiz_perfect(self):
        c1 = self.q1_2q.answers.get(is_correct=True)
        c2 = self.q2_2q.answers.get(is_correct=True)
        sub = self._submit(self.quiz_2q, {self.q1_2q: {c1.id}, self.q2_2q: {c2.id}})
        self.assertEqual(sub.calculate_grade(), 1.0)

    def test_two_question_quiz_partial(self):
        c1 = self.q1_2q.answers.get(is_correct=True)
        w2 = self.q2_2q.answers.filter(is_correct=True).first()  # actually correct
        w3 = self.q2_2q.answers.filter(is_correct=False).first()  # wrong
        # Q2: one correct + one wrong  -> ratio 0.5
        sub = self._submit(self.quiz_2q, {self.q1_2q: {c1.id}, self.q2_2q: {w2.id, w3.id}})
        expected = (2*1 + 3*0.5) / 5  # 3.5 / 5 = 0.7
        self.assertAlmostEqual(sub.calculate_grade(), expected)

    def test_single_question_quiz(self):
        correct = self.q1_1q.answers.get(is_correct=True)
        sub = self._submit(self.quiz_1q, {self.q1_1q: {correct.id}})
        self.assertEqual(sub.calculate_grade(), 1.0)

    def test_single_question_quiz_wrong(self):
        wrong = self.q1_1q.answers.filter(is_correct=False).first()
        sub = self._submit(self.quiz_1q, {self.q1_1q: {wrong.id}})
        self.assertEqual(sub.calculate_grade(), 0.0)

    def test_multi_correct_exact(self):
        correct_ids = set(self.q1_mc.answers.filter(is_correct=True).values_list('id', flat=True))
        sub = self._submit(self.quiz_mc, {self.q1_mc: correct_ids})
        self.assertEqual(sub.calculate_grade(), 1.0)

    def test_multi_correct_partial_penalty(self):
        """
        Question has 2 correct answers, 1 wrong.
        Student picks both correct + 1 wrong -> 1 - 0.5*1 = 0.5
        """
        q = self.q1_mc
        correct_ids = set(q.answers.filter(is_correct=True).values_list('id', flat=True))
        wrong = q.answers.filter(is_correct=False).first()

        # both correct + one wrong
        sub = self._submit(self.quiz_mc, {q: correct_ids | {wrong.id}})
        self.assertEqual(sub.calculate_grade(), 0.75)   # (2-0.5)/2

    def test_five_question_quiz_varied_correct_counts(self):
        """
        5 questions whose correct-answer counts are 1,2,3,4,5.
        Points = number of correct answers.
        Student picks ALL correct answers PLUS one wrong answer per question.
        Expected grade = (Σ points_i * (1 - 0.5*1)) / total_points
                    = 0.5   (because every question incurs exactly one penalty)
        """
        quiz = Quiz.objects.create(
            teacher=self.teacher, title="Five-Q Varied-Correct", is_published=True)

        questions = []
        for n in range(1, 6):                       # n = 1..5
            corrects = [f"C{j}" for j in range(1, n + 1)]
            wrongs   = [f"W{j}" for j in range(1, 4)]
            q = self._make_question(
                quiz=quiz,
                text=f"Q{n}",
                points=n,
                correct_texts=corrects,
                wrong_texts=wrongs)
            questions.append(q)

        # pick **all** correct + exactly one wrong for every question
        mapping = {}
        for q in questions:
            chosen = list(q.answers.filter(is_correct=True)) + \
                    [q.answers.filter(is_correct=False).first()]
            mapping[q] = {a.id for a in chosen}

        submission = self._submit(quiz, mapping)
        expected = 12.5 / 15
        self.assertAlmostEqual(submission.calculate_grade(), expected, places=6)

        # sanity – perfect answers (no wrong) still give 1.0
        perfect = {
            q: set(q.answers.filter(is_correct=True).values_list('id', flat=True))
            for q in questions
        }
        perfect_sub = self._submit(quiz, perfect)
        self.assertEqual(perfect_sub.calculate_grade(), 1.0)

    def test_partial_correct_with_penalty(self):
        """
        Question: 3 correct, 1 wrong.
        Policy: ratio = (#correct chosen / 3) - 0.5 * (#wrong chosen)
        """
        quiz = Quiz.objects.create(
            teacher=self.teacher, title="Partial", is_published=True)
        q = self._make_question(
            quiz=quiz,
            text="Pick all three",
            points=3,
            correct_texts=["C1", "C2", "C3"],
            wrong_texts=["W"])

        correct = q.answers.filter(is_correct=True)  # 3 answers
        wrong   = q.answers.filter(is_correct=False).first()

        # --- Case 1: only two correct chosen → 2/3
        two = correct[:2]
        sub1 = self._submit(quiz, {q: {a.id for a in two}})
        self.assertAlmostEqual(sub1.calculate_grade(), 2/3)

        # --- Case 2: all correct → 3/3 = 1
        all_correct = correct
        sub2 = self._submit(quiz, {q: {a.id for a in all_correct}})
        self.assertEqual(sub2.calculate_grade(), 1.0)

        # --- Case 3: all correct + one wrong → (3-0.5)/3 = 2.5/3
        sub3 = self._submit(quiz, {q: {a.id for a in all_correct} | {wrong.id}})
        self.assertAlmostEqual(sub3.calculate_grade(), 2.5/3)