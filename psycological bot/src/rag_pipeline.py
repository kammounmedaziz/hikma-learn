import faiss
import torch
import tensorflow as tf
import numpy as np
from sentence_transformers import SentenceTransformer
from langchain_community.llms import Ollama
import pandas as pd
from pathlib import Path
import yaml
import random
import time
from collections import deque
from threading import Thread, Event, Lock
import sys
import cv2
import os
from typing import Optional, Dict, Any
from speech.stt_engine import SpeechToTextEngine
from speech.tts.engine import NaturalChildVoice
from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech, SpeechT5HifiGan
from datasets import load_dataset
import pygame
import math
from flask import Flask, render_template
from flask_socketio import SocketIO
import soundfile as sf
import sounddevice as sd
import librosa

project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# Load configuration
with open('configs/paths.yaml') as f:
    config = yaml.safe_load(f)

BASE_DIR = Path(config['paths']['base_dir'])

class FaceAnimator:
    def __init__(self):
        pygame.init()
        self.surface = pygame.Surface((300, 300))
        self.current_emotion = "neutral"
        self.is_speaking = False
        self.mouth_progress = 0
        self._running = True
        
        # Setup Flask server with correct template path
        self.app = Flask(__name__, template_folder=str(project_root / "src" / "templates"))
        self.socketio = SocketIO(self.app, async_mode='threading')
        
        @self.app.route('/')
        def index():
            return render_template('bot_face.html')
            
        @self.socketio.on('connect')
        def handle_connect():
            print("Client connected to face stream")

    def update_emotion(self, emotion):
        self.current_emotion = emotion.lower()
        self._draw_face()

    def set_speaking(self, speaking):
        self.is_speaking = speaking
        self._draw_face()

    def _draw_face(self):
        self.surface.fill((30, 30, 40))  # Dark background
        
        # Draw eyes based on emotion
        eye_y = 100
        left_x, right_x = 100, 200
        
        if self.current_emotion == "happy":
            pygame.draw.arc(self.surface, (255,255,255), (left_x-30, eye_y-15, 60, 30), math.pi, 2*math.pi, 2)
            pygame.draw.arc(self.surface, (255,255,255), (right_x-30, eye_y-15, 60, 30), math.pi, 2*math.pi, 2)
        elif self.current_emotion == "sad":
            pygame.draw.arc(self.surface, (255,255,255), (left_x-30, eye_y+15, 60, 30), 0, math.pi, 2)
            pygame.draw.arc(self.surface, (255,255,255), (right_x-30, eye_y+15, 60, 30), 0, math.pi, 2)
        elif self.current_emotion == "angry":
            pygame.draw.line(self.surface, (255,255,255), (left_x-15, eye_y-15), (left_x+15, eye_y+15), 2)
            pygame.draw.line(self.surface, (255,255,255), (left_x-15, eye_y+15), (left_x+15, eye_y-15), 2)
            pygame.draw.line(self.surface, (255,255,255), (right_x-15, eye_y-15), (right_x+15, eye_y+15), 2)
            pygame.draw.line(self.surface, (255,255,255), (right_x-15, eye_y+15), (right_x+15, eye_y-15), 2)
        else:  # neutral
            pygame.draw.line(self.surface, (255,255,255), (left_x-15, eye_y), (left_x+15, eye_y), 2)
            pygame.draw.line(self.surface, (255,255,255), (right_x-15, eye_y), (right_x+15, eye_y), 2)

        # Draw mouth with faster animation
        mouth_y = 180
        if self.is_speaking:
            self.mouth_progress += 0.5  # Adjust this value for speed
            openness = 20 * (0.5 + 0.5 * math.sin(self.mouth_progress * 3))  # More dynamic
            
            # Draw a more animated mouth
            for i in range(5):  # Fewer points for smoother animation
                x = 50 + (200/4)*i
                y = mouth_y + openness * math.sin(self.mouth_progress + i*0.8)
                if i == 0:
                    pygame.draw.line(self.surface, (255,255,255), (x,y), (x,y), 2)
                else:
                    prev_x = 50 + (200/4)*(i-1)
                    prev_y = mouth_y + openness * math.sin(self.mouth_progress + (i-1)*0.8)
                    pygame.draw.line(self.surface, (255,255,255), (prev_x,prev_y), (x,y), 2)
            
        # Convert to JPEG with correct orientation and size
        frame = pygame.surfarray.array3d(self.surface)
        frame = np.rot90(frame, 3)  # Rotate 270 degrees to fix upside-down issue
        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        _, jpeg = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
        self.socketio.emit('face_frame', {'image': jpeg.tobytes().hex()})

    def run_server(self):
        """Run the streaming server in a thread"""
        print("\n🌐 Starting face stream server at http://localhost:5001")
        self.socketio.run(self.app, host='0.0.0.0', port=5001, debug=False, use_reloader=False)

    def stop(self):
        self._running = False
        pygame.quit()

    def run_server(self):
        """Run the streaming server in a thread"""
        print("\n🌐 Starting face stream server at http://localhost:5001")
        self.socketio.run(self.app, host='0.0.0.0', port=5001, debug=False, use_reloader=False)

    def stop(self):
        self._running = False
        pygame.quit()

class NaturalChildVoiceWithFace:
    def __init__(self, face_animator, device="auto"):
        try:
            self.face_animator = face_animator
            self.project_root = Path(__file__).parent.parent.parent.parent
            self.cache_dir = self.project_root / "data" / "tts_audio_cache"
            os.makedirs(self.cache_dir, exist_ok=True)
            
            self.device = torch.device(
                "cuda" if device == "auto" and torch.cuda.is_available() else "cpu"
            )
            
            print("🧒 Loading child voice...")
            self.processor = SpeechT5Processor.from_pretrained("microsoft/speecht5_tts")
            self.model = SpeechT5ForTextToSpeech.from_pretrained(
                "microsoft/speecht5_tts",
                attn_implementation="eager"
            ).to(self.device)
            self.vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan").to(self.device)
            
            self.speaker_id = 2  # SLT speaker
            self.speaker_embeddings = load_dataset("Matthijs/cmu-arctic-xvectors", split="validation")
            self.sample_rate = 22050
            
            self.emotion_settings = {
                "happy": {"pitch_shift": 2, "speed": 1.05},
                "sad": {"pitch_shift": 0, "speed": 0.95},
                "angry": {"pitch_shift": 1, "speed": 1.1},
                "surprise": {"pitch_shift": 3, "speed": 1.15},
                "neutral": {"pitch_shift": 1, "speed": 1.0}
            }
            
            print("🎀 Voice ready with face animation!")
            
        except Exception as e:
            print(f"❌ Initialization failed: {str(e)}")
            raise

    def _process_audio(self, audio, emotion):
        params = self.emotion_settings.get(emotion.lower(), self.emotion_settings["neutral"])
        audio = librosa.effects.pitch_shift(
            y=audio,
            sr=self.sample_rate,
            n_steps=params["pitch_shift"],
            bins_per_octave=36
        )
        audio = librosa.effects.time_stretch(audio, rate=params["speed"])
        return audio

    def text_to_speech(self, text, emotion="neutral"):
        try:
            spk_emb = torch.tensor(
                self.speaker_embeddings[self.speaker_id]["xvector"]
            ).unsqueeze(0).to(self.device)
            
            inputs = self.processor(text=text, return_tensors="pt").to(self.device)
            with torch.no_grad():
                speech = self.model.generate_speech(
                    inputs["input_ids"],
                    spk_emb,
                    vocoder=self.vocoder
                )
                speech = self._process_audio(
                    speech.cpu().numpy().astype(np.float32),
                    emotion
                )
            
            output_path = self.cache_dir / f"tts_{int(time.time())}.wav"
            sf.write(output_path, speech, self.sample_rate)
            return str(output_path)
        
        except Exception as e:
            print(f"❌ Generation failed: {str(e)}")
            raise

    def speak(self, text, emotion="neutral"):
        try:
            # Generate audio FIRST
            audio_path = self.text_to_speech(text, emotion)
            data, fs = sf.read(audio_path)
            duration = len(data) / fs
            
            # THEN activate face animation
            self.face_animator.set_speaking(True)
            self.face_animator.update_emotion(emotion)
            
            # Play audio
            sd.play(data, fs)
            
            # Animate during playback
            start_time = time.time()
            while time.time() - start_time < duration:
                self.face_animator._draw_face()  # Force redraw
                time.sleep(0.05)  # Adjust for smoothness
                
            sd.wait()
        finally:
            self.face_animator.set_speaking(False)

class FacialEmotionDetector:
    def __init__(self, model_path: str):
        try:
            self.model = tf.keras.models.load_model(model_path)
            self.emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
            self.emotion_history = deque(maxlen=30)
            self.current_emotion = "Neutral"
            self.current_confidence = 0.0
            self.stop_event = Event()
            self.face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            self.font = cv2.FONT_HERSHEY_SIMPLEX
            self.emotion_colors = {
                'Happy': (0, 255, 0),
                'Sad': (0, 191, 255),
                'Angry': (0, 0, 255),
                'Fear': (255, 255, 0),
                'Neutral': (255, 255, 255),
                'Surprise': (255, 0, 255),
                'Disgust': (0, 255, 255)
            }
            self.lock = Lock()
            self.last_emotion_change = time.time()
            
        except Exception as e:
            print(f"🔥 Failed to initialize emotion detector: {str(e)}")
            raise

    def _preprocess_face(self, frame: np.ndarray) -> np.ndarray:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        resized = cv2.resize(gray, (48, 48))
        return np.expand_dims(resized / 255.0, axis=(0, -1))

    def _detect_faces(self, frame: np.ndarray) -> list:
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            return self.face_cascade.detectMultiScale(
                gray, 
                scaleFactor=1.1, 
                minNeighbors=5,
                minSize=(100, 100)
            )
        except Exception as e:
            print(f"⚠️ Face detection error: {str(e)}")
            return []

    def _detect_emotion(self, frame: np.ndarray) -> tuple:
        faces = self._detect_faces(frame)
        if len(faces) == 0:
            return "Neutral", 0.0

        x, y, w, h = max(faces, key=lambda f: f[2]*f[3])
        face_roi = frame[y:y+h, x:x+w]
        
        try:
            input_tensor = self._preprocess_face(face_roi)
            predictions = self.model.predict(input_tensor, verbose=0)[0]
            emotion_idx = np.argmax(predictions)
            return self.emotion_labels[emotion_idx], float(predictions[emotion_idx])
        except Exception as e:
            print(f"⚠️ Emotion prediction error: {str(e)}")
            return "Neutral", 0.0

    def _draw_emotion_info(self, frame: np.ndarray) -> np.ndarray:
        with self.lock:
            emotion = self.current_emotion
            confidence = self.current_confidence
            
        faces = self._detect_faces(frame)
        if len(faces) > 0:
            x, y, w, h = max(faces, key=lambda f: f[2]*f[3])
            color = self.emotion_colors.get(emotion, (255, 255, 255))
            cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
            
            emotion_text = f"{emotion}: {confidence:.1%}"
            text_size = cv2.getTextSize(emotion_text, self.font, 0.8, 2)[0]
            text_x = x + (w - text_size[0]) // 2
            
            cv2.rectangle(frame, 
                         (text_x - 5, y - text_size[1] - 5),
                         (text_x + text_size[0] + 5, y - 5),
                         (0, 0, 0), -1)
            
            cv2.putText(frame, emotion_text, 
                       (text_x, y - 10), 
                       self.font, 0.8, color, 2)
        
        return frame

    def run(self):
        try:
            self.cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
            if not self.cap.isOpened():
                self.cap = cv2.VideoCapture(0)
            
            if not self.cap.isOpened():
                raise RuntimeError("Could not open camera")
                
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self.cap.set(cv2.CAP_PROP_FPS, 15)
            
            while not self.stop_event.is_set():
                ret, frame = self.cap.read()
                if not ret:
                    print("⚠️ Could not read frame from camera")
                    break
                    
                if time.time() - self.last_emotion_change > 0.1:
                    emotion, confidence = self._detect_emotion(frame)
                    with self.lock:
                        if emotion != self.current_emotion:
                            self.last_emotion_change = time.time()
                        self.current_emotion = emotion
                        self.current_confidence = confidence
                        self.emotion_history.append(emotion)
                
                frame = self._draw_emotion_info(frame)
                cv2.imshow('Friendly IA - Emotion Detection', frame)
                
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    self.stop_event.set()
                    
        except Exception as e:
            print(f"🔥 Camera error: {str(e)}")
            self.stop_event.set()
        finally:
            if hasattr(self, 'cap'):
                self.cap.release()
            cv2.destroyAllWindows()

    def get_dominant_emotion(self, min_duration: float = 3.0, min_confidence: float = 0.7) -> Optional[str]:
        with self.lock:
            if len(self.emotion_history) < 10:
                return None
                
            dominant = max(set(self.emotion_history), key=self.emotion_history.count)
            proportion = self.emotion_history.count(dominant) / len(self.emotion_history)
            
            if (proportion > 0.7 and
                time.time() - self.last_emotion_change > min_duration and
                self.current_confidence > min_confidence):
                return dominant
            return None

    def start(self):
        self.thread = Thread(target=self.run, daemon=True)
        self.thread.start()

    def stop(self):
        self.stop_event.set()
        if hasattr(self, 'thread'):
            self.thread.join(timeout=1)

class EmotionalSupportRAG:
    def __init__(self):
        from shared.face_recognition import FaceRecognizer
        self.face_recognizer = FaceRecognizer()
        self.current_user = None
        self.authenticated = False
        self.face_animator = None
        self.emotion_detector = None
        self.stt_engine = None
        self.tts_engine = None
        self.last_interaction_time = 0
        self.last_interaction_emotion = None
        self.min_interaction_interval = 120  # 2 minutes between same-emotion responses
        self.emotion_window = 3.5  # Seconds to maintain emotion before responding

    def _load_resources(self):
        """Load RAG knowledge base and embeddings"""
        print("\n🔧 Loading emotional support resources...")
        try:
            # Text embedding model
            self.embedder = SentenceTransformer(
                "all-MiniLM-L6-v2",
                device="cuda" if torch.cuda.is_available() else "cpu"
            )
            
            # Load FAISS index
            self.index = faiss.read_index(
                str(BASE_DIR / "data/embeddings/emotional_support.index")
            )
            
            # Initialize LLM
            self.llm = Ollama(
                model="mistral",
                temperature=0.7,
                top_p=0.9,
                repeat_penalty=1.1
            )
            
            # Load dialogue examples
            self.dialogues = pd.read_csv(
                BASE_DIR / "data/processed/chunks_with_emotion.csv"
            )
            print("✅ Knowledge base loaded successfully")
        except Exception as e:
            print(f"❌ Resource loading failed: {str(e)}")
            raise

    def _setup_prompts(self):
        """Configure emotion-specific response templates"""
        self.emotion_responses = {
            "Happy": {
                "triggers": ["I see that smile! What's making you happy today?", "Your positive energy is contagious!"],
                "context_query": "celebrating joy and positive experiences",
                "follow_up": "Would you like to share what's making you happy?"
            },
            "Sad": {
                "triggers": ["I notice you've seemed down for a while...", "I'm here if you want to share"],
                "context_query": "comforting someone feeling sad or depressed",
                "follow_up": "Would talking about it help you feel better?"
            },
            "Angry": {
                "triggers": ["I can see you're feeling frustrated...", "Would venting help right now?"],
                "context_query": "anger management and emotional regulation",
                "follow_up": "What's causing these feelings?"
            },
            "Fear": {
                "triggers": ["You seem worried - I'm here to help", "Would talking through your concerns help?"],
                "context_query": "reducing anxiety and fear responses",
                "follow_up": "What's making you feel uneasy?"
            },
            "Surprise": {
                "triggers": ["That surprised look! What happened?", "I see that look - what caught you off guard?"],
                "context_query": "responding to surprising events",
                "follow_up": "What surprised you?"
            }
        }
        print("✅ Emotional response prompts configured")

    def _initialize_components(self):
        """Initialize system components after successful authentication"""
        print("\n🚀 Initializing emotional support components...")
        
        # Face animation system
        self.face_animator = FaceAnimator()
        self.stream_thread = Thread(target=self.face_animator.run_server, daemon=True)
        self.stream_thread.start()
        time.sleep(1)  # Server warmup

        # Emotion detection
        self.emotion_detector = FacialEmotionDetector(
            BASE_DIR / "models" / "emotion_cnn_combined.keras"
        )
        
        # Speech components
        self.stt_engine = SpeechToTextEngine()
        self.tts_engine = NaturalChildVoiceWithFace(self.face_animator)
        
        # Load knowledge base
        self._load_resources()
        self._setup_prompts()

        # Start services
        self.emotion_detector.start()
        time.sleep(0.5)  # Model warmup
        self.stt_engine.start()
        print("✅ System components ready")

    def _authenticate_user(self):
        """Secure facial recognition process with live feedback"""
        print("\n🔐 Starting authentication...")
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("❌ Camera inaccessible")
            return False

        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        
        try:
            start_time = time.time()
            attempts = 0
            max_attempts = 3
            
            while time.time() - start_time < 15 and attempts < max_attempts:
                ret, frame = cap.read()
                if not ret:
                    print("⚠️ Frame capture failed")
                    continue

                # Process frame
                display_frame = frame.copy()
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                faces = face_cascade.detectMultiScale(gray, 1.3, 5)
                
                if len(faces) == 1:
                    x,y,w,h = faces[0]
                    face_roi = frame[y:y+h, x:x+w]
                    
                    # Face recognition
                    user_id, confidence = self.face_recognizer.recognize_user(face_roi)
                    
                    # Visual feedback
                    color = (0,255,0) if user_id else (0,0,255)
                    cv2.rectangle(display_frame, (x,y), (x+w,y+h), color, 2)
                    status_text = f"{user_id or 'Unknown'} ({confidence:.2f})" if user_id else "Unknown User"
                    cv2.putText(display_frame, status_text, (x, y-10), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
                    
                    if user_id and confidence < 0.6:  # Confidence threshold
                        self.current_user = user_id
                        self.authenticated = True
                        print(f"✅ Authenticated: {user_id} (confidence: {confidence:.2f})")
                        return True

                else:
                    cv2.putText(display_frame, "Align face in center", (10, 30),
                               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,0,255), 2)
                    attempts += 1

                cv2.imshow('Authentication - Press Q to cancel', display_frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break

            return False
            
        finally:
            cap.release()
            cv2.destroyAllWindows()
            if not self.authenticated:
                print("\n❌ Authentication failed")
                if hasattr(self, 'tts_engine') and self.tts_engine:
                    self.tts_engine.speak("Authentication failed. Please register.", "neutral")

    def _should_respond_to_emotion(self, emotion: str) -> bool:
        """Determine if system should respond to sustained emotion"""
        now = time.time()
        if (now - self.last_interaction_time < self.min_interaction_interval and
            emotion == self.last_interaction_emotion):
            return False
        return True

    def _retrieve_support_content(self, emotion: str) -> str:
        """Retrieve relevant support content from knowledge base"""
        try:
            query = self.emotion_responses[emotion]["context_query"]
            query_embedding = self.embedder.encode([query])
            distances, indices = self.index.search(query_embedding, 3)
            return "\n".join(
                f"- {self.dialogues.iloc[idx]['text']}" 
                for idx in indices[0] 
                if idx < len(self.dialogues)
            )
        except Exception as e:
            print(f"⚠️ Retrieval error: {str(e)}")
            return ""

    def generate_proactive_response(self, emotion: str) -> str:
        """Generate emotion-initiated response"""
        context = self._retrieve_support_content(emotion)
        trigger = random.choice(self.emotion_responses[emotion]["triggers"])
        follow_up = self.emotion_responses[emotion]["follow_up"]
        
        prompt = f"""**Context**: {context}
        **User's Emotion**: {emotion}
        **Trigger Phrase**: "{trigger}"
        
        Craft a 1-2 sentence response that:
        1. Naturally incorporates the trigger
        2. Validates the emotion
        3. Asks the follow-up: "{follow_up}"
        4. Sounds completely natural
        
        **Response**:"""
        
        try:
            response = self.llm(prompt).strip()
            if not response:
                response = f"{trigger} {follow_up}"
            self.tts_engine.speak(response, emotion.lower())
            return response
        except Exception as e:
            print(f"⚠️ LLM error: {str(e)}")
            return f"{trigger} {follow_up}"

    def generate_response(self, user_input: str) -> str:
        """Generate response to user voice input"""
        current_emotion = self.emotion_detector.current_emotion
        context = self._retrieve_support_content(current_emotion)
        
        prompt = f"""**User's Emotion**: {current_emotion}
        **Context**: {context}
        **User Says**: "{user_input}"
        
        Respond with:
        1. Emotional validation
        2. Relevant advice
        3. A thoughtful follow-up
        (Keep it under 3 sentences)
        
        **Response**:"""
        
        try:
            response = self.llm(prompt).strip()
            if len(response.split()) < 3:
                response = "I'd love to hear more about that."
            self.tts_engine.speak(response, current_emotion.lower())
            return response
        except Exception as e:
            print(f"⚠️ LLM error: {str(e)}")
            return "I'm having trouble responding. Could you rephrase that?"

    def run_interaction_loop(self):
        """Main emotional support interaction flow"""
        self._authenticate_user()
        
        if not self.authenticated:
            print("\n🚫 Access denied: Unauthorized user")
            return
            
        try:
            self._initialize_components()
            
            # Personalized greeting
            self.tts_engine.speak(
                f"Welcome back {self.current_user}! Let's explore your emotions.", 
                "happy"
            )
            print(f"\n🌟 {self.current_user}'s Emotional Companion")
            print("Real-time emotion detection active")
            print("Say 'exit' or press Q to quit\n")

            # Interaction state
            last_emotion_check = 0
            current_dominant = None
            emotion_start_time = 0
            
            while True:
                now = time.time()
                
                # Emotion analysis (1Hz refresh)
                if now - last_emotion_check > 1.0:
                    dominant_emotion = self.emotion_detector.get_dominant_emotion()
                    
                    if dominant_emotion:
                        # Update face animation
                        self.face_animator.update_emotion(dominant_emotion.lower())
                        
                        # Handle sustained emotion response
                        if dominant_emotion == current_dominant:
                            if now - emotion_start_time >= self.emotion_window:
                                if self._should_respond_to_emotion(dominant_emotion):
                                    response = self.generate_proactive_response(dominant_emotion)
                                    print(f"\nCompanion: {response}")
                                    self.last_interaction_time = now
                                    emotion_start_time = 0
                        else:
                            current_dominant = dominant_emotion
                            emotion_start_time = now
                    
                    last_emotion_check = now
                
                # Voice input handling
                if (user_input := self.stt_engine.get_transcription(timeout=0.1)):
                    user_input = user_input.strip()
                    
                    # Exit condition
                    if any(cmd in user_input.lower() for cmd in ['exit', 'quit', 'stop']):
                        self.tts_engine.speak(
                            f"Goodbye {self.current_user}! Practice self-care.", 
                            "neutral"
                        )
                        break
                    
                    # Process valid input
                    if len(user_input.split()) > 2:
                        print(f"\n{self.current_user}: {user_input}")
                        response = self.generate_response(user_input)
                        print(f"Companion: {response}")

                time.sleep(0.01)
                
        except KeyboardInterrupt:
            self.tts_engine.speak("Session ended. Take care!", "neutral")
        finally:
            # Cleanup resources
            if self.emotion_detector: self.emotion_detector.stop()
            if self.stt_engine: self.stt_engine.stop()
            if self.face_animator: self.face_animator.stop()
            cv2.destroyAllWindows()    

if __name__ == "__main__":
    try:
        import cv2
        print("✅ OpenCV is available")
    except ImportError:
        print("❌ Please install OpenCV: pip install opencv-python")
        sys.exit(1)

    print("\n🚀 Starting Enhanced Emotional Support Assistant...")
    try:
        # Remove user_name parameter
        assistant = EmotionalSupportRAG()  # Changed line
        assistant.run_interaction_loop()
    except Exception as e:
        print(f"❌ Fatal error: {str(e)}")
        sys.exit(1)