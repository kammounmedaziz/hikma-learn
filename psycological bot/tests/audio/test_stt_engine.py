import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

from src.speech.stt_engine import SpeechToTextEngine
import time
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def main():
    print("Initializing STT Engine Test...")
    stt = SpeechToTextEngine()
    
    try:
        stt.start()
        print("\nSpeak now (say 'exit' to quit)...")
        print("Waiting for input", end="", flush=True)
        
        while True:
            if text := stt.get_transcription(timeout=0.5):
                print(f"\nYou said: {text}")
                if "exit" in text.lower():
                    break
            print(".", end="", flush=True)
                
    except KeyboardInterrupt:
        print("\nUser interrupted")
    finally:
        stt.stop()
        print("Test completed")

if __name__ == "__main__":
    main()