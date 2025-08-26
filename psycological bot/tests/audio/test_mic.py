import sounddevice as sd
import numpy as np

def list_devices():
    print("Available audio devices:")
    print(sd.query_devices())

def test_microphone():
    duration = 5  # seconds
    sample_rate = 16000
    
    print("\nTesting microphone... Speak now!")
    recording = sd.rec(int(duration * sample_rate), 
                      samplerate=sample_rate, 
                      channels=1,
                      dtype='float32')
    sd.wait()  # Wait until recording is finished
    
    # Calculate volume
    rms = np.sqrt(np.mean(recording**2))
    print(f"\nRecording finished. Volume level: {rms:.4f}")
    print("You should hear your playback...")
    sd.play(recording, sample_rate)
    sd.wait()

if __name__ == "__main__":
    list_devices()
    test_microphone()