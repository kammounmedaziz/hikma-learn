from rest_framework import serializers
from .models import Quiz, Question, Answer, QuizSubmission, SubmissionAnswer
from django.contrib.auth.models import User

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'text', 'is_correct']
        extra_kwargs = {'is_correct': {'required': True}}

class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True)

    class Meta:
        model = Question
        fields = ['id', 'quiz', 'text', 'question_type', 'points', 'difficulty_level', 'answers']
        extra_kwargs = {'quiz': {'required': False, 'allow_null': True}}

    def create(self, validated_data):
        answers_data = validated_data.pop('answers')
        quiz = self.context.get('quiz')
        if not quiz:
            raise serializers.ValidationError("Quiz context is missing")
        question = Question.objects.create(quiz=quiz, **validated_data)
        for answer_data in answers_data:
            Answer.objects.create(question=question, **answer_data)
        return question

    def update(self, instance, validated_data):
        answers_data = validated_data.pop('answers')
        instance.text = validated_data.get('text', instance.text)
        instance.question_type = validated_data.get('question_type', instance.question_type)
        instance.points = validated_data.get('points', instance.points)
        instance.difficulty_level = validated_data.get('difficulty_level', instance.difficulty_level)
        instance.save()

        instance.answers.all().delete()
        for answer_data in answers_data:
            Answer.objects.create(question=instance, **answer_data)
        return instance

class QuizStudentSerializer(serializers.ModelSerializer):
    teacher = serializers.CharField(source='teacher.username', read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id', 'url', 'title', 'description', 'time_limit',
            'is_published', 'creation_date', 'updated_date', 'teacher'
        ]

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)
    teacher = serializers.PrimaryKeyRelatedField(read_only=True)
    question_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id', 'teacher', 'title', 'description', 'time_limit',
            'is_published', 'creation_date', 'updated_date',
            'questions', 'question_count'
        ]

    def create(self, validated_data):
        questions_data = validated_data.pop('questions')
        quiz = Quiz.objects.create(**validated_data)

        for question_data in questions_data:
            if 'answers' not in question_data or not question_data['answers']:
                raise serializers.ValidationError({
                    "answers": [f"This field is required for question '{question_data.get('text', '<unknown>')}'."]
                })

            question_serializer = QuestionSerializer(
                data=question_data,
                context={'quiz': quiz}
            )
            question_serializer.is_valid(raise_exception=True)
            question_serializer.save()

        return quiz

    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions')
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.time_limit = validated_data.get('time_limit', instance.time_limit)
        instance.is_published = validated_data.get('is_published', instance.is_published)
        instance.save()

        instance.questions.all().delete()

        for question_data in questions_data:
            if 'answers' not in question_data or not question_data['answers']:
                raise serializers.ValidationError({
                    "answers": [f"This field is required for question '{question_data.get('text', '<unknown>')}'."]
                })

            question_serializer = QuestionSerializer(
                data=question_data,
                context={'quiz': instance}
            )
            question_serializer.is_valid(raise_exception=True)
            question_serializer.save()

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
