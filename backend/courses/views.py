import asyncio
import logging
import re
import time
import webvtt
from deepgram import DeepgramClient, PrerecordedOptions, Deepgram
from django.core.files.storage import default_storage
from django.shortcuts import render
from rest_framework import viewsets, permissions, serializers
from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from webvtt import WebVTT, Caption
from moviepy import VideoFileClip

from accounts.models import UserType
from .models import Course, Chapter, CourseFollow, Content, ContentKind, FileKind
from .serializers import CourseSerializer, CourseFollowSerializer, ChapterSerializer, ContentSerializer, SubtitleEditSerializer
from .permissions import IsTeacherOrReadOnly, IsTeacherOfCourse, IsTeacherOfCourseOrReadOnly, IsTeacherOnly, IsStudentOnly, IsTeacherOfChapter
import os
from django.core.files.base import ContentFile
from django.conf import settings

def format_timestamp(seconds):
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds - int(seconds)) * 1000)
    return f"{hours:02}:{minutes:02}:{secs:02}.{millis:03}"

def split_text_to_captions(text, segment_duration=5):
    words = text.split()
    words_per_segment = max(1, int(len(words) / (len(text) / segment_duration / 2)))  # heuristic
    captions = []
    start_time = 0

    for i in range(0, len(words), words_per_segment):
        segment_words = words[i:i+words_per_segment]
        segment_text = ' '.join(segment_words)
        end_time = start_time + segment_duration
        captions.append({
            'start': start_time,
            'end': end_time,
            'text': segment_text,
        })
        start_time = end_time

    return captions

class EmptySerializer(serializers.Serializer):
    pass

# Create your views here.
class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsTeacherOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    @action(detail=False, methods=['get'], url_path='my-courses', permission_classes=[IsTeacherOnly])
    def my_courses(self, request):
        courses = Course.objects.filter(teacher=request.user)
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='followed-courses', permission_classes=[IsStudentOnly])
    def student_courses(self, request):
        courses = Course.objects.filter(coursefollow__student=request.user)
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["get", "post", "delete"],
        permission_classes=[IsStudentOnly],
        serializer_class=EmptySerializer,
        url_path="follow",
    )
    def follow(self, request, pk=None):
        course = self.get_object()
        student = request.user

        if request.method == "GET":
            try:
                follow = CourseFollow.objects.get(student=student, course=course)
                serializer = CourseFollowSerializer(follow, context={"request": request})
                return Response(serializer.data)
            except CourseFollow.DoesNotExist:
                return Response({"detail": "Not following this course."}, status=status.HTTP_404_NOT_FOUND)

        elif request.method == "POST":
            follow, created = CourseFollow.objects.get_or_create(student=student, course=course)
            if not created:
                return Response({"detail": "Already following this course."}, status=status.HTTP_200_OK)
            serializer = CourseFollowSerializer(follow, context={"request": request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        elif request.method == "DELETE":
            deleted, _ = CourseFollow.objects.filter(student=student, course=course).delete()
            if deleted:
                return Response(status=status.HTTP_204_NO_CONTENT)
            return Response({"detail": "You are not following this course."}, status=status.HTTP_400_BAD_REQUEST)


class ChapterViewSet(viewsets.ModelViewSet):
    serializer_class = ChapterSerializer
    permission_classes = [IsTeacherOfCourseOrReadOnly]

    def get_queryset(self):
        # Filter chapters by the course from the URL and order by 'order'
        course_id = self.kwargs['course_pk']
        return Chapter.objects.filter(course_id=course_id).order_by('order')

    def perform_create(self, serializer):
        # Set the course when creating a new chapter
        course_id = self.kwargs['course_pk']
        serializer.save(course_id=course_id)

    def get_serializer_class(self):
        if self.action == 'reorder':
            from .serializers import ReorderSerializer
            return ReorderSerializer
        return super().get_serializer_class()

    @action(detail=False, methods=['post'], permission_classes=[IsTeacherOfCourse])
    def reorder(self, request, course_pk=None):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        item_ids = serializer.validated_data['item_ids']
        all_ids = set(self.get_queryset().values_list('id', flat=True))
        submitted_ids = set(item_ids)

        if all_ids != submitted_ids:
            return Response(
                {"detail": "Some chapters are missing or extra."},
                status=status.HTTP_400_BAD_REQUEST
            )

        for order, chapter_id in enumerate(item_ids, start=1):
            Chapter.objects.filter(id=chapter_id).update(order=order)

        return Response(
            {"detail": "Chapters reordered successfully."},
            status=status.HTTP_200_OK,
        )

class ContentViewSet(viewsets.ModelViewSet):
    serializer_class = ContentSerializer
    permission_classes = [IsTeacherOfChapter]

    def get_queryset(self):
        chapter_pk = self.kwargs['chapter_pk']
        return Content.objects.filter(chapter_id=chapter_pk).order_by('order')

    def perform_create(self, serializer):
        chapter_pk = self.kwargs['chapter_pk']
        serializer.save(chapter_id=chapter_pk)

    def get_serializer_class(self):
        if self.action == 'reorder':
            from .serializers import ReorderSerializer
            return ReorderSerializer
        elif self.action == 'edit_subtitles':
            return SubtitleEditSerializer
        return super().get_serializer_class()

    @action(detail=False, methods=['post'], permission_classes=[IsTeacherOfChapter])
    def reorder(self, request, course_pk=None, chapter_pk=None):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        item_ids = serializer.validated_data['item_ids']
        all_ids = set(self.get_queryset().values_list('id', flat=True))
        submitted_ids = set(item_ids)
        if all_ids != submitted_ids:
            return Response(
                {"detail": "Some contents are missing or extra."},
                status=status.HTTP_400_BAD_REQUEST
            )

        for order, content_id in enumerate(item_ids, start=1):
            Content.objects.filter(id=content_id).update(order=order)

        return Response({"detail": "Contents reordered successfully."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post', 'put'], url_path='upload-subtitles')
    def upload_subtitles(self, request, course_pk=None, chapter_pk=None, pk=None):
        content = self.get_object()
        subtitle_file = request.FILES.get('subtitle_file')
        if not subtitle_file:
            return Response({'error': 'subtitle_file is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Validate file format
            file_content = subtitle_file.read().decode('utf-8', errors='ignore')
            subtitle_file.seek(0)  # Reset file pointer
            webvtt.from_string(file_content)

            # Use serializer to validate and save
            serializer = ContentSerializer(content, data={'subtitle_file': subtitle_file}, partial=True,
                                           context={'request': request})
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error(f"Error uploading subtitle for content {pk}: {str(e)}")
            return Response({'detail': f'Internal server error: {str(e)}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    @action(detail=True, methods=['post'], url_path='generate-subtitles', permission_classes=[IsTeacherOfChapter])
    def generate_subtitles(self, request, pk=None, course_pk=None, chapter_pk=None):
        logger = logging.getLogger(__name__)
        logger.debug(f"User: {request.user}, Action: generate_subtitles for content {pk}")

        content = self.get_object()

        if content.content_kind != 'FILE' or content.file_kind != 'VIDEO':
            return Response({'detail': 'Subtitles can only be generated for video content.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if not content.file:
            return Response({'detail': 'No video file available for transcription.'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            # Get video duration using moviepy
            video = VideoFileClip(content.file.path)
            video_duration = video.duration  # Duration in seconds
            video.close()
            logger.debug(f"Video duration: {video_duration} seconds")

            with open(content.file.path, 'rb') as f:
                bytes_data = f.read()

            from deepgram import DeepgramClient, PrerecordedOptions
            # Initialize Deepgram client
            dg_client = DeepgramClient(api_key=settings.DEEPGRAM_API_KEY)
            source = {
                'buffer': bytes_data,
                'mimetype': content.file_mime_type,
            }
            options = PrerecordedOptions(
                model='enhanced',  # Try 'enhanced' model for better utterance detection
                smart_format=True,
                punctuate=True,
                utterances=True,
                diarize=True
            )
            # Use synchronous transcribe_file method
            response = dg_client.listen.rest.v('1').transcribe_file(source, options)
            logger.debug(f"Transcription response type: {type(response)}, content: {response.to_dict()}")

            # Extract transcript and utterances
            transcript = response.results.channels[0].alternatives[0]  # ListenRESTAlternative object
            logger.debug(f"Transcript attributes: {dir(transcript)}")
            transcript_text = getattr(transcript, 'transcript', '') or ''
            utterances = getattr(transcript, 'utterances', []) or []

            # Generate WebVTT content
            vtt = WebVTT()
            if utterances:
                logger.debug(f"Found {len(utterances)} utterances")
                for utterance in utterances:
                    start = getattr(utterance, 'start', 0)
                    end = getattr(utterance, 'end', start + 5.0)  # Fallback end time
                    text = getattr(utterance, 'transcript', '')
                    speaker = getattr(utterance, 'speaker', 'Unknown')
                    if text:  # Only add captions with non-empty text
                        caption = Caption(
                            start=format_timestamp(start),
                            end=format_timestamp(end),
                            text=f"Speaker {speaker}: {text}"
                        )
                        vtt.captions.append(caption)
            else:
                logger.warning("No utterances returned; checking for word-level data")
                # Fallback: Try word-level data
                words = getattr(transcript, 'words', []) or []
                if words:
                    logger.debug(f"Found {len(words)} words")
                    chunk_duration = 5.0  # Target ~5 seconds per caption
                    current_time = 0.0
                    current_text = []
                    for word in words:
                        word_start = getattr(word, 'start', current_time)
                        word_end = getattr(word, 'end', word_start + 0.5)  # Estimate word duration
                        word_text = getattr(word, 'punctuated_word', getattr(word, 'word', ''))
                        current_text.append(word_text)
                        if word_end - current_time >= chunk_duration or len(current_text) >= 10:  # Limit chunk size
                            caption = Caption(
                                start=format_timestamp(current_time),
                                end=format_timestamp(word_end),
                                text=' '.join(current_text)
                            )
                            vtt.captions.append(caption)
                            current_time = word_end
                            current_text = []
                    # Add final chunk if any words remain
                    if current_text:
                        caption = Caption(
                            start=format_timestamp(current_time),
                            end=format_timestamp(min(current_time + 5.0, video_duration)),
                            text=' '.join(current_text)
                        )
                        vtt.captions.append(caption)
                else:
                    logger.warning("No words returned; falling back to text segmentation")
                    # Last resort: Split transcript text into chunks
                    if transcript_text:
                        words = transcript_text.split()
                        words_per_chunk = max(10, len(words) // 10)  # Aim for ~10 chunks
                        chunk_duration = video_duration / max(1, len(words) // words_per_chunk)
                        for i in range(0, len(words), words_per_chunk):
                            chunk_text = ' '.join(words[i:i + words_per_chunk])
                            start_time = i * chunk_duration / words_per_chunk
                            end_time = min((i + words_per_chunk) * chunk_duration / words_per_chunk, video_duration)
                            caption = Caption(
                                start=format_timestamp(start_time),
                                end=format_timestamp(end_time),
                                text=chunk_text
                            )
                            vtt.captions.append(caption)
                    else:
                        logger.warning("No transcript text available; creating empty subtitle")
                        caption = Caption(
                            start='00:00:00.000',
                            end=format_timestamp(min(1.0, video_duration)),
                            text='No speech detected'
                        )
                        vtt.captions.append(caption)

            # Save WebVTT file
            vtt_content = vtt.content
            file_name = f"subtitles_{content.id}.vtt"
            content.subtitle_file.save(file_name, ContentFile(vtt_content.encode('utf-8')))
            content.transcript_text = transcript_text
            content.save()

            serializer = self.get_serializer(content)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception(f"Error generating subtitles for content {pk}: {str(e)}")
            return Response({'detail': f'Failed to generate subtitles: {str(e)}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    @action(detail=True, methods=['get', 'post'], url_path='edit-subtitles')
    def edit_subtitles(self, request, course_pk=None, chapter_pk=None, pk=None):
        logger = logging.getLogger(__name__)
        logger.info(
            f"Received {request.method} request to edit_subtitles for content {pk}, course {course_pk}, chapter {chapter_pk}")

        content = self.get_object()
        if not content.subtitle_file:
            logger.error("No subtitle file exists for this content")
            return Response({'error': 'No subtitle file exists for this content.'}, status=status.HTTP_400_BAD_REQUEST)

        if request.method == 'GET':
            logger.info("Fetching subtitle content")
            try:
                with open(content.subtitle_file.path, 'r', encoding='utf-8') as f:
                    subtitle_content = f.read()
                return Response({'subtitle_content': subtitle_content}, status=status.HTTP_200_OK)
            except Exception as e:
                logger.exception(f"Failed to read subtitle file for content {pk}: {str(e)}")
                return Response({'error': f'Failed to read subtitle file: {str(e)}'},
                                status=status.HTTP_400_BAD_REQUEST)

        elif request.method == 'POST':
            logger.info(f"POST request data: {request.data}")
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            subtitle_content = serializer.validated_data['subtitle_content']
            logger.info("Valid subtitle content received")

            try:
                webvtt.from_string(subtitle_content)
                logger.info("WebVTT content is valid")

                original_filename = os.path.basename(
                    content.subtitle_file.name) if content.subtitle_file.name else 'subtitles.vtt'
                # Overwrite the file instead of deleting to avoid PermissionError
                with open(content.subtitle_file.path, 'w', encoding='utf-8') as f:
                    f.write(subtitle_content)
                content.save()

                serializer = ContentSerializer(content, context={'request': request})
                logger.info("Subtitles updated successfully")
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as e:
                logger.exception(f"Subtitle update failed for content {pk}: {str(e)}")
                return Response({'error': f'Failed to update subtitle file: {str(e)}'},
                                status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='subtitles')
    def delete_subtitles(self, request, course_pk=None, chapter_pk=None, pk=None):
        content = self.get_object()
        if not content.subtitle_file:
            return Response({'error': 'No subtitle file to delete.'}, status=status.HTTP_400_BAD_REQUEST)

        file_path = content.subtitle_file.name
        content.subtitle_file = None
        content.transcript_text = ''
        content.save()

        # Attempt to delete the physical file with retries
        for _ in range(3):  # Retry up to 3 times
            try:
                if default_storage.exists(file_path):
                    default_storage.delete(file_path)
                break
            except PermissionError:
                time.sleep(0.5)  # Wait briefly before retrying
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'], url_path='get-subtitles')
    def get_subtitles(self, request, course_pk=None, chapter_pk=None, pk=None):
        content = self.get_object()
        if not content.subtitle_file:
            return Response({'subtitle_content': ''})

        file_path = content.subtitle_file.path
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content_text = f.read()
            return Response({'subtitle_content': content_text})
        except Exception as e:
            return Response({'error': str(e)}, status=500)