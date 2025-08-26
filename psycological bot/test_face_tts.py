# Location: Friendly_IA/test_face_tts.py
import time
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent))

from interfaces.pixel_face.face_display import FaceDisplay
from src.speech.tts.engine import NaturalChildVoice

def main():
    print("Starting Talking Face Demo...")
    
    # Initialize components
    face = FaceDisplay()
    tts = NaturalChildVoice()
    
    # Connect components
    tts.callback = face.set_mouth
    
    # Test phrases
    test_phrases = [
        ("Hello friend, how are you today?", "happy"),
        ("I'm feeling a little sad right now.", "sad"), 
        ("That really makes me angry!", "angry"),
        ("Oh my goodness, what a surprise!", "surprise"),
        ("Let's talk about something fun.", "neutral")
    ]
    
    try:
        for text, emotion in test_phrases:
            print(f"\n💬 {emotion.upper()}: '{text}'")
            face.set_emotion(emotion)  # This will now work correctly
            tts.speak(text, emotion)
            
    finally:
        face.stop()
        print("\nDemo complete!")

if __name__ == "__main__":
    main()