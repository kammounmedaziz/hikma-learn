from django.contrib import admin
from .models import Quiz, Question, Answer

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'teacher', 'is_published', 'question_count')
    search_fields = ('title', 'teacher__username')
    list_filter = ('is_published', 'teacher')

    def question_count(self, obj):
        return obj.question_count
    question_count.short_description = 'Number of Questions'

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'quiz', 'question_type', 'points')
    search_fields = ('text', 'quiz__title')
    list_filter = ('question_type', 'difficulty_level')

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('text', 'question', 'is_correct')
    search_fields = ('text', 'question__text')
    list_filter = ('is_correct',)