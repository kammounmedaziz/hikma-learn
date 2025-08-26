# merged_IA/core/utils/emotion_worker.py
from queue import Queue
from core.detection.facial_emotion_combined import FacialEmotionDetector  # Updated import path

class EmotionWorker:
    def __init__(self, model_path="data/models/emotion/emotion_cnn_combined.keras"):
        self.detector = FacialEmotionDetector(model_path)  # Use merged project's detector
        self.current_emotion = None
        self.emotion_queue = Queue()
        self.lock = Lock()

    def start(self):
        """Start emotion detection in a thread"""
        self.detector.start()
        Thread(target=self._update_emotion, daemon=True).start()
    
    def _update_emotion(self):
        """Continuously get dominant emotion"""
        while True:
            emotion = self.detector.get_dominant_emotion()
            if emotion:
                with self.lock:
                    self.current_emotion = emotion
                    self.emotion_queue.put(emotion)
            time.sleep(0.1)  # Update 10x/sec

    def stop(self):
        self.detector.stop()
    
    def get_emotion(self):
        """Get latest emotion without blocking"""
        with self.lock:
            return self.current_emotion

    def get_emotion_queue(self):
        """Get the queue object for event-driven systems"""
        return self.emotion_queue