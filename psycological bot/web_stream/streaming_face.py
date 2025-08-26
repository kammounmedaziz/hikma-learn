import sys
from pathlib import Path
import time
import pygame
import math
import socket
import cv2
import numpy as np
from enum import Enum
from threading import Thread, Lock
from multiprocessing import Queue
from flask import Flask, render_template
from flask_socketio import SocketIO

# Initialize Flask app
app = Flask(__name__, template_folder='templates')
app.config['SECRET_KEY'] = 'your_secret_key_here'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

class EmotionState(Enum):
    NEUTRAL = 0
    HAPPY = 1
    SAD = 2
    ANGRY = 3
    SURPRISE = 4

class FaceStreamer:
    def __init__(self):
        self.emotion_queue = Queue()
        self.is_speaking = False
        self.current_emotion = "neutral"
        self._running = True
        self._mouth_progress = 0
        self.frame_queue = Queue(maxsize=3)  # Increased buffer size
        self.lock = Lock()
        
        # Initialize pygame
        pygame.init()
        self.surface = pygame.Surface((600, 400))
        
        # Start threads
        self.render_thread = Thread(target=self._render_face, daemon=True)
        self.render_thread.start()
        self.sender_thread = Thread(target=self._send_frames, daemon=True)
        self.sender_thread.start()

    def _render_face(self):
        """Render face frames with pygame"""
        clock = pygame.time.Clock()
        
        while self._running:
            # Check for emotion updates
            if not self.emotion_queue.empty():
                with self.lock:
                    self.current_emotion = self.emotion_queue.get()
            
            # Render the face
            self.surface.fill((30, 30, 40))  # Dark blue background
            self._draw_face()
            
            # Convert to JPEG
            frame = pygame.surfarray.array3d(self.surface)
            frame = np.rot90(frame)  # Correct orientation
            frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
            
            # Encode as JPEG with higher quality
            _, jpeg = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
            
            # Put frame in queue if there's space
            if not self.frame_queue.full():
                self.frame_queue.put(jpeg.tobytes())
            
            clock.tick(30)  # Maintain ~30 FPS

    def _draw_face(self):
        """Draw the face with current emotion and speaking state"""
        # Draw eyes based on emotion
        eye_y = 150
        left_x, right_x = 200, 400
        
        try:
            emotion = EmotionState[self.current_emotion.upper()]
        except KeyError:
            emotion = EmotionState.NEUTRAL
            
        # Draw eyes
        if emotion == EmotionState.HAPPY:  # ^_^
            pygame.draw.arc(self.surface, (255,255,255), (left_x-30, eye_y-15, 60, 30), math.pi, 2*math.pi, 4)
            pygame.draw.arc(self.surface, (255,255,255), (right_x-30, eye_y-15, 60, 30), math.pi, 2*math.pi, 4)
        elif emotion == EmotionState.SAD:  # ._.
            pygame.draw.circle(self.surface, (255,255,255), (left_x, eye_y), 15, 3)
            pygame.draw.circle(self.surface, (255,255,255), (right_x, eye_y), 15, 3)
        elif emotion == EmotionState.ANGRY:  # >_<
            pygame.draw.line(self.surface, (255,255,255), (left_x-15, eye_y-15), (left_x+15, eye_y+15), 3)
            pygame.draw.line(self.surface, (255,255,255), (left_x-15, eye_y+15), (left_x+15, eye_y-15), 3)
            pygame.draw.line(self.surface, (255,255,255), (right_x-15, eye_y-15), (right_x+15, eye_y+15), 3)
            pygame.draw.line(self.surface, (255,255,255), (right_x-15, eye_y+15), (right_x+15, eye_y-15), 3)
        elif emotion == EmotionState.SURPRISE:  # O_O
            pygame.draw.circle(self.surface, (255,255,255), (left_x, eye_y), 20, 3)
            pygame.draw.circle(self.surface, (30,30,40), (left_x, eye_y), 8)
            pygame.draw.circle(self.surface, (255,255,255), (right_x, eye_y), 20, 3)
            pygame.draw.circle(self.surface, (30,30,40), (right_x, eye_y), 8)
        else:  # NEUTRAL -_-
            pygame.draw.line(self.surface, (255,255,255), (left_x-15, eye_y), (left_x+15, eye_y), 3)
            pygame.draw.line(self.surface, (255,255,255), (right_x-15, eye_y), (right_x+15, eye_y), 3)

        # Draw mouth
        mouth_x, mouth_y = 200, 280
        if self.is_speaking:
            self._mouth_progress += 0.2
            points = [
                (mouth_x + (200/8)*i, 
                 mouth_y + 15*math.sin(self._mouth_progress + i*0.5))
                for i in range(9)
            ]
            pygame.draw.lines(self.surface, (255,255,255), False, points, 4)
        else:
            pygame.draw.line(self.surface, (255,255,255), (mouth_x, mouth_y), (mouth_x+200, mouth_y), 4)

    def _send_frames(self):
        """Send frames to connected clients"""
        while self._running:
            try:
                if not self.frame_queue.empty():
                    frame_bytes = self.frame_queue.get()
                    socketio.emit('face_frame', {
                        'image': frame_bytes.hex(),
                        'timestamp': time.time()
                    })
                time.sleep(0.03)  # ~30 FPS
            except Exception as e:
                print(f"Frame sending error: {str(e)}")
                time.sleep(0.1)

    def stop(self):
        """Clean shutdown"""
        self._running = False
        pygame.quit()
        if self.render_thread:
            self.render_thread.join(timeout=1)
        if self.sender_thread:
            self.sender_thread.join(timeout=1)

@app.route('/')
def index():
    return render_template('stream_face.html')

@app.route('/health')
def health_check():
    return {'status': 'healthy', 'timestamp': time.time()}

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

if __name__ == '__main__':
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    print(f"\n🌐 Face stream available at:")
    print(f" - Local: http://localhost:5001")
    print(f" - Network: http://{local_ip}:5001")
    
    face_streamer = FaceStreamer()
    try:
        socketio.run(app, host='0.0.0.0', port=5001, debug=False)
    finally:
        face_streamer.stop()