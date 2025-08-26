import cv2
import numpy as np
import onnxruntime as ort
from threading import Thread, Event
import time
import os
from collections import deque

class FacialEmotionDetector:
    def __init__(self, model_path="models/emotion_model.onnx"):
        # Initialize ONNX Runtime
        self.session = ort.InferenceSession(model_path)
        self.input_name = self.session.get_inputs()[0].name
        self.emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
        
        # Emotion tracking
        self.emotion_history = deque(maxlen=30)
        self.current_emotion = "Neutral"
        self.current_confidence = 0.0
        self.stop_event = Event()
        self.cap = None

        # Visualization settings
        self.emotion_colors = {
            "Angry": (0, 0, 255),
            "Disgust": (0, 102, 0),
            "Fear": (153, 0, 153),
            "Happy": (0, 255, 0),
            "Sad": (255, 0, 0),
            "Surprise": (0, 191, 255),
            "Neutral": (255, 255, 255)
        }

        # Performance tracking
        self.frame_count = 0
        self.last_fps_time = time.time()
        self.gui_available = self._check_gui_support()

    def _check_gui_support(self):
        """Check if OpenCV GUI is available"""
        try:
            test_img = np.zeros((100, 100, 3), dtype=np.uint8)
            cv2.imshow('test', test_img)
            cv2.waitKey(1)
            cv2.destroyAllWindows()
            return True
        except:
            print("⚠️ GUI not available - running in console mode")
            return False

    def _preprocess_frame(self, frame):
        """Convert frame to model input format"""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        resized = cv2.resize(gray, (48, 48), interpolation=cv2.INTER_AREA)
        return np.expand_dims(resized / 255.0, axis=(0, -1)).astype(np.float32)

    def _detect_emotion(self, frame):
        """Run emotion prediction on a frame"""
        try:
            input_data = self._preprocess_frame(frame)
            results = self.session.run(None, {self.input_name: input_data})[0][0]
            emotion_idx = np.argmax(results)
            confidence = float(results[emotion_idx])
            
            # Update tracking
            self.current_emotion = self.emotion_labels[emotion_idx]
            self.current_confidence = confidence
            self.emotion_history.append(self.current_emotion)
            
            return self.current_emotion, confidence
            
        except Exception as e:
            print(f"⚠️ Detection error: {str(e)}")
            return "Neutral", 0.0

    def _display_console(self):
        """Console output when GUI is unavailable"""
        os.system('cls' if os.name == 'nt' else 'clear')
        print("\n" + "="*40)
        print(f"Current Emotion: {self.current_emotion}")
        print(f"Confidence: {self.current_confidence:.0%}")
        print(f"FPS: {self.frame_count / (time.time() - self.last_fps_time):.1f}")
        print("="*40 + "\n")
        print("Press Ctrl+C to exit")

    def _display_gui(self, frame):
        """Visualization with OpenCV"""
        color = self.emotion_colors.get(self.current_emotion, (255, 255, 255))
        
        # Emotion text
        cv2.putText(frame, f"{self.current_emotion}: {self.current_confidence:.0%}", 
                   (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        
        # Confidence bar
        bar_width = int(200 * self.current_confidence)
        cv2.rectangle(frame, (10, 40), (10 + bar_width, 50), color, -1)
        
        # FPS counter
        fps = self.frame_count / (time.time() - self.last_fps_time)
        cv2.putText(frame, f"FPS: {fps:.1f}", (10, 80), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 1)
        
        cv2.imshow("Facial Emotion Detection", frame)

    def run(self):
        """Main detection loop"""
        try:
            # Initialize camera
            for api in [cv2.CAP_DSHOW, cv2.CAP_MSMF, cv2.CAP_ANY]:
                self.cap = cv2.VideoCapture(0, api)
                if self.cap.isOpened():
                    break
            
            if not self.cap or not self.cap.isOpened():
                print("❌ Could not open camera")
                return

            # Camera settings
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self.cap.set(cv2.CAP_PROP_FPS, 30)
            
            while not self.stop_event.is_set():
                ret, frame = self.cap.read()
                if not ret:
                    print("⚠️ Frame read failed")
                    break
                
                # Process every 3rd frame (reduce CPU load)
                if self.frame_count % 3 == 0:
                    self._detect_emotion(frame)
                
                # Display results
                if self.gui_available:
                    self._display_gui(frame)
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break
                else:
                    self._display_console()
                
                # FPS calculation
                self.frame_count += 1
                if time.time() - self.last_fps_time > 1:
                    self.last_fps_time = time.time()
                    self.frame_count = 0
                    
        except Exception as e:
            print(f"❌ Runtime error: {str(e)}")
        finally:
            if hasattr(self, 'cap') and self.cap:
                self.cap.release()
            if self.gui_available:
                cv2.destroyAllWindows()

    def start(self):
        """Start detection thread"""
        self.thread = Thread(target=self.run)
        self.thread.daemon = True
        self.thread.start()

    def stop(self):
        """Stop detection thread"""
        self.stop_event.set()
        if hasattr(self, 'thread'):
            self.thread.join(timeout=1)
        if self.gui_available:
            cv2.destroyAllWindows()

    def get_dominant_emotion(self, min_duration=3):
        """Get sustained emotion (same as original)"""
        if len(self.emotion_history) < 10:
            return None
            
        dominant = max(set(self.emotion_history), key=self.emotion_history.count)
        proportion = self.emotion_history.count(dominant) / len(self.emotion_history)
        
        if (proportion > 0.8 and 
            time.time() - self.last_emotion_change > min_duration):
            return dominant
        return None


if __name__ == "__main__":
    print("🚀 Starting Facial Emotion Detector (ONNX)")
    try:
        detector = FacialEmotionDetector()
        detector.start()
        
        # Keep main thread alive
        while not detector.stop_event.is_set():
            time.sleep(0.1)
            
    except KeyboardInterrupt:
        print("\n🛑 Shutting down...")
    finally:
        if 'detector' in locals():
            detector.stop()
        print("✅ Clean exit")