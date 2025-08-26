from src.speech.stt_engine import SpeechToTextEngine
import time

stt = SpeechToTextEngine()
stt.start()

try:
    print("Speak now (say 'exit' to quit)...")
    while True:
        if text := stt.get_transcription():
            print(f"Heard: {text}")
            if "exit" in text.lower():
                break
        time.sleep(0.1)
finally:
    stt.stop()