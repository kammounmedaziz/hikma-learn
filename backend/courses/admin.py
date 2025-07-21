from django.contrib import admin
from .models import Course, Chapter, Content, CourseFollow, ContentSeen

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'teacher', 'creation_date', 'updated_date')
    search_fields = ('title', 'teacher__username')
    list_filter = ('teacher',)

@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    search_fields = ('title', 'course__title')
    list_filter = ('course',)

@admin.register(Content)
class ContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'chapter', 'content_kind', 'file_kind', 'order')
    search_fields = ('title', 'chapter__title')
    list_filter = ('content_kind', 'chapter')

@admin.register(CourseFollow)
class CourseFollowAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'follow_date')
    search_fields = ('student__username', 'course__title')
    list_filter = ('course',)

@admin.register(ContentSeen)
class ContentSeenAdmin(admin.ModelAdmin):
    list_display = ('student', 'content', 'seen_date')
    search_fields = ('student__username', 'content__title')
    list_filter = ('content',)