import torch
import numpy as np
import sounddevice as sd
from queue import Queue
from threading import Thread, Event
import time
import logging
from pathlib import Path
import yaml
import os
from transformers import WhisperForConditionalGeneration, WhisperProcessor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Suppress warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# Load configuration
with open(Path(__file__).parent.parent.parent / 'configs/paths.yaml') as f:
    config = yaml.safe_load(f)

BASE_DIR = Path(config['paths']['base_dir'])

class SpeechToTextEngine:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_path = BASE_DIR / config['stt']['fine_tuned_dir'] / "final"
        
        # Audio settings
        self.sample_rate = 16000
        self.chunk_size = 512  # Reduced for lower latency
        self.silence_threshold = 0.03
        self.min_audio_length = 1.2  # seconds
        self.max_audio_length = 4.0  # seconds
        self.voice_timeout = 0.8  # seconds
        
        # State management
        self.audio_buffer = np.array([], dtype=np.float32)
        self.text_queue = Queue()
        self.is_running = False
        self.stop_event = Event()
        self.last_voice_time = 0
        self.is_speaking = False
        self.silence_counter = 0
        
        # Load model
        self._load_model()

    def _load_model(self):
        """Load model with proper dtype handling"""
        try:
            # Force float32 for stability
            torch_dtype = torch.float32
            self.model = WhisperForConditionalGeneration.from_pretrained(
                self.model_path,
                torch_dtype=torch_dtype
            ).to(self.device)
            
            # Configure model
            self.model.config.update({
                "max_new_tokens": 200,
                "forced_decoder_ids": None,
                "suppress_tokens": []
            })
            
            # Set to evaluation mode
            self.model.eval()
            
            self.processor = WhisperProcessor.from_pretrained(self.model_path)
            logging.info(f"Model loaded on {self.device} (float32)")
            
            # Warm up the model
            with torch.inference_mode():
                dummy_input = torch.zeros((1, 80, 3000), dtype=torch.float32).to(self.device)
                self.model.generate(dummy_input, max_length=20)
                
        except Exception as e:
            logging.error(f"Model load error: {str(e)}")
            raise

    def _audio_callback(self, indata, frames, time_info, status):
        """Process audio chunks with proper type conversion"""
        if status:
            logging.warning(f"Audio status: {status}")
        
        # Convert to float32 explicitly
        audio_chunk = indata[:, 0].astype(np.float32)
        self.audio_buffer = np.concatenate([self.audio_buffer, audio_chunk])
        
        # Voice activity detection
        current_rms = np.sqrt(np.mean(audio_chunk**2))
        if current_rms > self.silence_threshold:
            self.last_voice_time = time.time()
            self.is_speaking = True
            self.silence_counter = 0
        elif self.is_speaking:
            self.silence_counter += 1

    def _process_audio(self):
        """Optimized processing loop"""
        while not self.stop_event.is_set():
            now = time.time()
            
            # Check if voice detected and silence period elapsed
            if self.is_speaking and (now - self.last_voice_time > self.voice_timeout):
                buffer_duration = len(self.audio_buffer) / self.sample_rate
                
                if buffer_duration >= self.min_audio_length:
                    self._transcribe_audio()
                
                self.is_speaking = False
                self.audio_buffer = np.array([], dtype=np.float32)
                
            # Prevent buffer from growing too large
            if len(self.audio_buffer) > self.max_audio_length * self.sample_rate:
                self.audio_buffer = self.audio_buffer[-int(self.max_audio_length * self.sample_rate):]
                
            time.sleep(0.01)

    def _transcribe_audio(self):
        """Handle audio transcription with proper type conversion"""
        try:
            # Get the most recent audio segment
            audio_np = self.audio_buffer[-int(self.max_audio_length * self.sample_rate):]
            
            # Ensure audio is float32
            if audio_np.dtype != np.float32:
                audio_np = audio_np.astype(np.float32)
            
            logging.debug(f"Processing {len(audio_np)/self.sample_rate:.2f}s audio")
            
            # Process with Whisper
            inputs = self.processor(
                audio_np,
                sampling_rate=self.sample_rate,
                return_tensors="pt"
            ).input_features.to(self.device)
            
            # Ensure input is float32
            if inputs.dtype != torch.float32:
                inputs = inputs.float()
            
            with torch.inference_mode():
                predicted_ids = self.model.generate(
                    inputs,
                    max_length=200,
                    num_beams=1,
                    do_sample=False
                )
                text = self.processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
                
                if text.strip():
                    logging.info(f"Transcribed: {text}")
                    self.text_queue.put(text.strip())
                    
        except Exception as e:
            logging.error(f"Transcription error: {str(e)}")
        finally:
            self.audio_buffer = np.array([], dtype=np.float32)

    def start(self):
        """Start listening to microphone with proper settings"""
        if self.is_running:
            return
            
        self.is_running = True
        self.stop_event.clear()
        
        # Clear buffer
        self.audio_buffer = np.array([], dtype=np.float32)
        
        # Start processing thread
        self.processing_thread = Thread(target=self._process_audio, daemon=True)
        self.processing_thread.start()
        
        # Start audio stream
        self.stream = sd.InputStream(
            samplerate=self.sample_rate,
            channels=1,
            dtype='float32',
            blocksize=self.chunk_size,
            callback=self._audio_callback,
            latency='low'
        )
        self.stream.start()
        logging.info("STT Engine started")

    def stop(self):
        """Clean shutdown"""
        if not self.is_running:
            return
            
        self.is_running = False
        self.stop_event.set()
        
        if hasattr(self, 'stream'):
            self.stream.stop()
            self.stream.close()
        
        if hasattr(self, 'processing_thread'):
            self.processing_thread.join(timeout=0.5)
        
        logging.info("STT Engine stopped")

    def get_transcription(self, timeout=0.3):
        """Get latest transcription"""
        try:
            return self.text_queue.get(timeout=timeout)
        except:
            return None