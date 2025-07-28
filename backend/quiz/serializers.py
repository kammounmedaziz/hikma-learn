from rest_framework import serializers
from .models import Quiz, Question, Answer
from django.contrib.auth.models import User

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'text', 'is_correct']
        extra_kwargs = {'is_correct': {'required': True}}

class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, required=True)

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
    url = serializers.HyperlinkedIdentityField(view_name='quiz:quiz-detail', lookup_field='pk')
    teacher = serializers.CharField(source='teacher.username', read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id', 'url', 'title', 'description', 'time_limit',
            'is_published', 'creation_date', 'updated_date', 'teacher'
        ]

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, required=True)
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
        quiz = Quiz.objects.create(**validated_data)  # Viewset should set teacher

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
