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


class QuizGradingTests(APITestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(username='teacher1', password='pass', user_type=UserType.TEACHER)
        self.student = User.objects.create_user(username='student1', password='pass', user_type=UserType.STUDENT)

        self.quiz = Quiz.objects.create(teacher=self.teacher, title="Grading Quiz", is_published=True)

        self.q1 = Question.objects.create(quiz=self.quiz, text="Q1", points=2)
        self.a1_1 = Answer.objects.create(question=self.q1, text="Correct", is_correct=True)
        self.a1_2 = Answer.objects.create(question=self.q1, text="Wrong", is_correct=False)
        self.a1_3 = Answer.objects.create(question=self.q1, text="Wrong 2", is_correct=False)

        self.q2 = Question.objects.create(quiz=self.quiz, text="Q2", points=3)
        self.a2_1 = Answer.objects.create(question=self.q2, text="Correct", is_correct=True)
        self.a2_2 = Answer.objects.create(question=self.q2, text="Wrong", is_correct=False)

        self.client = APIClient()

    def submit_answers(self, answers):
        self.client.login(username='student1', password='pass')
        url = reverse('submission-list', kwargs={'quiz_pk': self.quiz.pk})
        data = {"answers": [{"chosen_answer": ans.id} for ans in answers]}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return QuizSubmission.objects.get(student=self.student, quiz=self.quiz)

    def test_grading_all_correct(self):
        submission = self.submit_answers([self.a1_1, self.a2_1])
        self.assertEqual(submission.grade, 1.0)  # full grade (5/5)

    def test_grading_one_question_partial_penalty(self):
        # Q1 has correct + 1 wrong answer -> penalty applied but grade >= 0
        submission = self.submit_answers([self.a1_1, self.a1_2, self.a2_1])
        # Q1: 2 - 0.5*1 = 1.5 points, Q2: 3 points; total 4.5/5
        self.assertAlmostEqual(submission.grade, 4.5/5)

    def test_grading_multiple_wrong_answers_penalty_min_zero(self):
        # Q1 has 2 wrong answers, so penalty = 0.5 * 2 = 1.0; 2 - 1 = 1 (but clamp to 0 if negative)
        submission = self.submit_answers([self.a1_2, self.a1_3, self.a2_1])
        # Q1: 2 - 0.5*2 = 1.0 (still positive), Q2: 3 points; total 4.0/5
        self.assertAlmostEqual(submission.grade, 4.0/5)

    def test_grading_all_wrong_answers(self):
        submission = self.submit_answers([self.a1_2, self.a2_2])
        # Q1: 2 - 0.5*1 = 1.5, Q2: 3 - 0.5*1 = 2.5; total 4/5
        self.assertAlmostEqual(submission.grade, 4.0/5)
