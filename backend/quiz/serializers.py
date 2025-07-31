from rest_framework import serializers
from .models import Quiz, Question, Answer, QuizSubmission, SubmissionAnswer
from django.contrib.auth.models import User

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'text', 'is_correct']
        extra_kwargs = {'is_correct': {'required': True}}

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        if request and request.user.user_type == 'student':
            representation.pop('is_correct', None)
        return representation

class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'question_type', 'points',
                  'difficulty_level', 'answers']

    def create(self, validated_data):
        answers = validated_data.pop('answers')
        q = Question.objects.create(quiz=self.context['quiz'], **validated_data)
        Answer.objects.bulk_create(
            Answer(question=q, **a) for a in answers
        )
        return q

    def update(self, instance, validated_data):
        answers = validated_data.pop('answers')
        instance = super().update(instance, validated_data)
        instance.answers.all().delete()
        Answer.objects.bulk_create(
            Answer(question=instance, **a) for a in answers
        )
        return instance


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=False)
    teacher  = serializers.PrimaryKeyRelatedField(read_only=True)
    question_count = serializers.ReadOnlyField()

    class Meta:
        model = Quiz
        fields = ['id', 'url', 'teacher', 'title', 'description',
                  'time_limit', 'is_published', 'creation_date',
                  'updated_date', 'questions', 'question_count']

    def create(self, validated_data):
        questions = validated_data.pop('questions')
        quiz = Quiz.objects.create(**validated_data)
        for qd in questions:
            QuestionSerializer(context={'quiz': quiz}).create(qd)
        return quiz

    def update(self, instance, validated_data):
        questions = validated_data.pop('questions')
        instance = super().update(instance, validated_data)
        instance.questions.all().delete()
        for qd in questions:
            QuestionSerializer(context={'quiz': instance}).create(qd)
        return instance

class SubmissionAnswerSerializer(serializers.ModelSerializer):

    is_correct = serializers.BooleanField(source='chosen_answer.is_correct', read_only=True)

    class Meta:
        model = SubmissionAnswer
        fields = ['question', 'chosen_answer', 'is_correct']
        read_only_fields = ['question']

    def validate(self, data):
        chosen_answer = data.get('chosen_answer')
        if not chosen_answer:
            raise serializers.ValidationError("A chosen answer is required.")

        # Check chosen_answer has a related question
        if chosen_answer.question is None:
            raise serializers.ValidationError("Chosen answer must be linked to a question.")

        return data

    def create(self, validated_data):
        # Attach question inferred from chosen_answer
        validated_data['question'] = validated_data['chosen_answer'].question
        return super().create(validated_data)


class QuizSubmissionSerializer(serializers.ModelSerializer):
    answers = SubmissionAnswerSerializer(many=True)

    class Meta:
        model = QuizSubmission
        fields = ['id', 'quiz', 'student', 'submitted_at', 'grade', 'answers']
        read_only_fields = ['student', 'quiz', 'submitted_at', 'grade']

    def validate(self, data):
        user = self.context['request'].user
        quiz = self.context.get('quiz')
        if quiz is None:
            raise serializers.ValidationError("Quiz context is missing.")

        # Prevent duplicate submissions
        if QuizSubmission.objects.filter(student=user, quiz=quiz).exists():
            raise serializers.ValidationError("You have already submitted this quiz.")


        answers = data.get('answers', [])

        # Check all questions have answers
        quiz_questions = set(quiz.questions.values_list('id', flat=True))
        answered_questions = set()
        for answer in answers:
            chosen_answer = answer.get('chosen_answer')
            if not chosen_answer:
                raise serializers.ValidationError("Each answer must have a chosen answer.")

            # Validate that chosen_answer belongs to the quiz's questions
            question_id = chosen_answer.question_id
            if question_id not in quiz_questions:
                error_msg = f'Chosen answer "{chosen_answer.text}" does not belong to the quiz.'
                raise serializers.ValidationError(error_msg)
            answered_questions.add(question_id)

        missing_questions = quiz_questions - answered_questions
        if missing_questions:
            missing_texts = quiz.questions.filter(id__in=missing_questions).values_list('text', flat=True)
            missing_texts_quoted = [f'"{text}"' for text in missing_texts]
            raise serializers.ValidationError(
                f"Submission is missing answers for questions: {', '.join(missing_texts_quoted)}"
            )

        return data

    def create(self, validated_data):
        answers_data = validated_data.pop('answers')
        user = self.context['request'].user
        quiz = self.context['quiz']

        submission = QuizSubmission.objects.create(student=user, quiz=quiz)

        for answer_data in answers_data:
            chosen_answer = answer_data['chosen_answer']
            SubmissionAnswer.objects.create(
                submission=submission,
                chosen_answer=chosen_answer,
                question=chosen_answer.question
            )

        # Calculate grade
        submission.grade = submission.calculate_grade()
        submission.save()

        return submission
