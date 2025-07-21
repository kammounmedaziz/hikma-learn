from rest_framework import serializers
from .models import Quiz, Question, Answer
from django.contrib.auth.models import User
# from courses.models import Chapter

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

    def create(self, validated_data):
        answers_data = validated_data.pop('answers')
        question = Question.objects.create(**validated_data)
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
        fields = ['id', 'url', 'title', 'description', 'time_limit', 'is_published', 'creation_date', 'updated_date', 'teacher']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    teacher = serializers.PrimaryKeyRelatedField(read_only=True)
    question_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'teacher', 'title', 'description', 'time_limit', 'is_published', 'creation_date', 'updated_date', 'questions', 'question_count']