# Location: Friendly_IA/interfaces/pixel_face/face_display.py
import pygame
import threading
import math
import time
from enum import Enum

class EmotionState(Enum):
    NEUTRAL = 0
    HAPPY = 1
    SAD = 2
    ANGRY = 3
    SURPRISE = 4

class FaceDisplay:
    def __init__(self):
        """Face display with guaranteed mouth animation"""
        self._running = False
        self._emotion = EmotionState.NEUTRAL
        self._thread = None
        self._is_speaking = False
        self._mouth_progress = 0
        self._last_speech_time = 0
        
        # Display settings
        self._width, self._height = 600, 400
        self._bg_color = (30, 30, 40)
        self._face_color = (255, 255, 255)
        
        # Start display
        self.start()

    def _draw_eyes(self, surface):
        """Draw static emotion-specific eyes"""
        eye_y = 150
        left_x, right_x = 200, 400
        
        if self._emotion == EmotionState.HAPPY:  # ^_^
            pygame.draw.arc(surface, self._face_color, (left_x-30, eye_y-15, 60, 30), math.pi, 2*math.pi, 4)
            pygame.draw.arc(surface, self._face_color, (right_x-30, eye_y-15, 60, 30), math.pi, 2*math.pi, 4)
        elif self._emotion == EmotionState.SAD:  # ._.
            pygame.draw.circle(surface, self._face_color, (left_x, eye_y), 25, 3)
            pygame.draw.circle(surface, self._face_color, (right_x, eye_y), 25, 3)
        elif self._emotion == EmotionState.ANGRY:  # >_<
            pygame.draw.line(surface, self._face_color, (left_x-25, eye_y-15), (left_x+25, eye_y+15), 4)
            pygame.draw.line(surface, self._face_color, (left_x-25, eye_y+15), (left_x+25, eye_y-15), 4)
            pygame.draw.line(surface, self._face_color, (right_x-25, eye_y-15), (right_x+25, eye_y+15), 4)
            pygame.draw.line(surface, self._face_color, (right_x-25, eye_y+15), (right_x+25, eye_y-15), 4)
        elif self._emotion == EmotionState.SURPRISE:  # O_O
            pygame.draw.circle(surface, self._face_color, (left_x, eye_y), 35, 3)
            pygame.draw.circle(surface, self._bg_color, (left_x, eye_y), 15)
            pygame.draw.circle(surface, self._face_color, (right_x, eye_y), 35, 3)
            pygame.draw.circle(surface, self._bg_color, (right_x, eye_y), 15)
        else:  # NEUTRAL -_-
            pygame.draw.line(surface, self._face_color, (left_x-25, eye_y), (left_x+25, eye_y), 4)
            pygame.draw.line(surface, self._face_color, (right_x-25, eye_y), (right_x+25, eye_y), 4)

    def _draw_mouth(self, surface):
        """Draw animated mouth with persistence"""
        mouth_x, mouth_y = 200, 280
        width = 200
        
        # Keep mouth visible slightly after speech ends
        if self._is_speaking or (time.time() - self._last_speech_time < 0.2):
            # Animated wavy mouth
            self._mouth_progress += 0.2
            segments = 8
            points = [
                (mouth_x + (width/segments) * i, 
                mouth_y + 15 * math.sin(self._mouth_progress + i * 0.5))
                for i in range(segments + 1)
            ]
            pygame.draw.lines(surface, self._face_color, False, points, 4)
        else:
            # Static mouth
            pygame.draw.line(surface, self._face_color, 
                           (mouth_x, mouth_y), (mouth_x + width, mouth_y), 4)

    def _run_display(self):
        """Main display loop"""
        pygame.init()
        screen = pygame.display.set_mode((self._width, self._height))
        pygame.display.set_caption("Friendly IA Face")
        clock = pygame.time.Clock()
        
        while self._running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self._running = False
            
            # Draw everything
            screen.fill(self._bg_color)
            self._draw_eyes(screen)
            self._draw_mouth(screen)
            
            pygame.display.flip()
            clock.tick(30)
        
        pygame.quit()

    def start(self):
        """Start the face display"""
        if not self._running:
            self._running = True
            self._thread = threading.Thread(target=self._run_display, daemon=True)
            self._thread.start()

    def stop(self):
        """Stop the face display"""
        self._running = False
        if self._thread:
            self._thread.join(timeout=1)

    def set_mouth(self, is_speaking: bool):
        """Control mouth animation state"""
        self._is_speaking = is_speaking
        if is_speaking:
            self._last_speech_time = time.time()

    def set_emotion(self, emotion: str):
        """Update displayed emotion"""
        try:
            self._emotion = EmotionState[emotion.upper()]
        except KeyError:
            self._emotion = EmotionState.NEUTRAL