# facial_emotion_combined.py
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from collections import deque
import time

class FacialEmotionDetector:
    def __init__(self, model_path="models/emotion_cnn_combined.keras"):
        # Load TensorFlow model
        self.model = load_model(model_path)
        self.emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
        
        # Emotion tracking
        self.emotion_history = deque(maxlen=30)
        self.current_emotion = "Neutral"
        self.current_confidence = 0.0
        self.stop_event = False
        
        # Face detection
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Visualization
        self.emotion_colors = {
            'Angry': (0, 0, 255),
            'Disgust': (0, 102, 0),
            'Fear': (153, 0, 153),
            'Happy': (0, 255, 0),
            'Sad': (255, 0, 0),
            'Surprise': (0, 191, 255),
            'Neutral': (255, 255, 255)
        }

    def _preprocess_face(self, face_roi):
        """Preprocess face region for emotion prediction"""
        gray = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
        resized = cv2.resize(gray, (48, 48))
        normalized = resized / 255.0
        return np.expand_dims(normalized, axis=(0, -1))  # Add batch and channel dim

    def detect_emotion(self, frame):
        """Detect faces and predict emotions"""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 5)
        
        for (x, y, w, h) in faces:
            # Extract face ROI
            face_roi = frame[y:y+h, x:x+w]
            
            # Predict emotion
            processed_face = self._preprocess_face(face_roi)
            predictions = self.model.predict(processed_face, verbose=0)
            emotion_idx = np.argmax(predictions)
            
            # Update tracking
            self.current_emotion = self.emotion_labels[emotion_idx]
            self.current_confidence = float(predictions[0][emotion_idx])
            self.emotion_history.append(self.current_emotion)
            
            # Draw visualization
            color = self.emotion_colors.get(self.current_emotion, (255, 255, 255))
            cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
            cv2.putText(frame, f"{self.current_emotion}: {self.current_confidence:.0%}",
                       (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        
        return frame

    def run(self):
        """Main camera loop"""
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("❌ Could not open camera")
            return
            
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        try:
            while not self.stop_event:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Process frame
                frame = self.detect_emotion(frame)
                
                # Display
                cv2.imshow('Real-time Emotion Detection', frame)
                
                # Exit on 'q'
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
                    
        finally:
            cap.release()
            cv2.destroyAllWindows()

if __name__ == "__main__":
    print("🚀 Starting Real-time Emotion Detection with Combined Model")
    detector = FacialEmotionDetector()
    
    try:
        detector.run()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down...")
    finally:
        detector.stop_event = True
        print("✅ Clean exit")