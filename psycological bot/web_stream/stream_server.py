from flask import Flask, render_template, send_from_directory
from flask_socketio import SocketIO
import sys
from pathlib import Path
import time
import os
import shutil

# Fix path configuration
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

app = Flask(__name__, template_folder='templates', static_folder='static')
app.config['SECRET_KEY'] = 'your_secret_key_here'
socketio = SocketIO(app, cors_allowed_origins="*")

try:
    from src.speech.tts.engine import NaturalChildVoice
    tts = NaturalChildVoice()
except ImportError as e:
    print(f"Warning: Could not import TTS engine - {e}")
    tts = None

# Configure audio folder
AUDIO_FOLDER = Path(__file__).parent / 'static' / 'audio'
os.makedirs(AUDIO_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('stream.html')

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory(app.static_folder, filename)

@socketio.on('speak')
def handle_speak(data):
    if not tts:
        socketio.emit('error', {'message': 'TTS engine not available'})
        return
    
    text = data.get('text', 'Hello')
    emotion = data.get('emotion', 'neutral')
    
    # Start speaking animation
    socketio.emit('mouth', {'state': 'open'})
    socketio.emit('emotion', {'emotion': emotion})
    
    try:
        # Generate speech
        audio_path = tts.text_to_speech(text, emotion)
        
        # Copy to static audio folder
        audio_filename = f"tts_{int(time.time())}.wav"
        target_path = AUDIO_FOLDER / audio_filename
        shutil.copy2(audio_path, target_path)
        
        # Send audio to client
        socketio.emit('audio', {
            'url': f'/static/audio/{audio_filename}'
        })
        
    except Exception as e:
        print(f"Error generating speech: {e}")
        socketio.emit('error', {'message': str(e)})
    finally:
        # End speaking animation after a delay
        time.sleep(0.5)
        socketio.emit('mouth', {'state': 'closed'})

if __name__ == '__main__':
    print(f"Starting server at http://0.0.0.0:5000")
    print(f"Templates folder: {app.template_folder}")
    print(f"Static folder: {app.static_folder}")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)