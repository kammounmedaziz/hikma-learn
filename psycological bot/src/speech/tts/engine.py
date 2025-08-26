# Location: Friendly_IA/src/speech/tts/engine.py
import torch
from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech, SpeechT5HifiGan
from datasets import load_dataset
import soundfile as sf
import sounddevice as sd
from pathlib import Path
import os
import time
import numpy as np
import librosa

class NaturalChildVoice:
    def __init__(self, device="auto"):
        """Initialize voice with complete sentence playback"""
        try:
            # Setup paths
            self.project_root = Path(__file__).parent.parent.parent.parent
            self.cache_dir = self.project_root / "data" / "tts_audio_cache"
            os.makedirs(self.cache_dir, exist_ok=True)
            
            self.device = torch.device(
                "cuda" if device == "auto" and torch.cuda.is_available() else "cpu"
            )
            
            # Load models
            print("🧒 Loading child voice...")
            self.processor = SpeechT5Processor.from_pretrained("microsoft/speecht5_tts")
            self.model = SpeechT5ForTextToSpeech.from_pretrained(
                "microsoft/speecht5_tts",
                attn_implementation="eager"
            ).to(self.device)
            self.vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan").to(self.device)
            
            # Voice settings
            self.speaker_id = 2  # SLT speaker
            self.speaker_embeddings = load_dataset("Matthijs/cmu-arctic-xvectors", split="validation")
            self.sample_rate = 22050
            
            # Emotion settings
            self.emotion_settings = {
                "happy": {"pitch_shift": 2, "speed": 1.05},
                "sad": {"pitch_shift": 0, "speed": 0.95},
                "angry": {"pitch_shift": 1, "speed": 1.1},
                "surprise": {"pitch_shift": 3, "speed": 1.15},
                "neutral": {"pitch_shift": 1, "speed": 1.0}
            }
            
            print("🎀 Voice ready with complete sentence playback!")
            
        except Exception as e:
            print(f"❌ Initialization failed: {str(e)}")
            raise

    def _process_audio(self, audio, emotion):
        """Apply voice effects while preserving naturalness"""
        params = self.emotion_settings.get(emotion.lower(), self.emotion_settings["neutral"])
        
        # Pitch adjustment
        audio = librosa.effects.pitch_shift(
            y=audio,
            sr=self.sample_rate,
            n_steps=params["pitch_shift"],
            bins_per_octave=36
        )
        
        # Speed adjustment
        audio = librosa.effects.time_stretch(audio, rate=params["speed"])
        
        return audio

    def text_to_speech(self, text, emotion="neutral"):
        """Generate speech that plays completely"""
        try:
            # Get speaker embedding
            spk_emb = torch.tensor(
                self.speaker_embeddings[self.speaker_id]["xvector"]
            ).unsqueeze(0).to(self.device)
            
            # Generate speech
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
            
            # Save with complete audio
            output_path = self.cache_dir / f"tts_{int(time.time())}.wav"
            sf.write(output_path, speech, self.sample_rate)
            return str(output_path)
        
        except Exception as e:
            print(f"❌ Generation failed: {str(e)}")
            raise

    def speak(self, text, emotion="neutral"):
        """Play speech completely with proper mouth sync"""
        try:
            # Notify mouth to open
            if hasattr(self, 'callback'):
                self.callback(True)
            
            # Generate and play audio
            audio_path = self.text_to_speech(text, emotion)
            data, fs = sf.read(audio_path)
            duration = len(data) / fs
            
            # Play audio and keep mouth open
            sd.play(data, fs)
            sd.wait()  # Block until playback finishes
            
            # Notify mouth to close
            if hasattr(self, 'callback'):
                self.callback(False)
            
            # Small pause after speech
            time.sleep(min(0.5, duration * 0.3))
            
        except Exception as e:
            print(f"❌ Playback failed: {str(e)}")
            if hasattr(self, 'callback'):
                self.callback(False)