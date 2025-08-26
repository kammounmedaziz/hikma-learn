# test_image.py
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model

def load_and_prepare_image(image_path):
    """Load and preprocess image for model prediction"""
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"Image not found at {image_path}")
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, (48, 48))
    normalized = resized / 255.0
    input_tensor = np.expand_dims(normalized, axis=(0, -1))  # Add batch and channel dim
    return input_tensor, img

def predict_emotion(model, image_tensor):
    """Make prediction and return emotion with confidence"""
    emotions = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
    predictions = model.predict(image_tensor)
    emotion_idx = np.argmax(predictions)
    return emotions[emotion_idx], float(predictions[0][emotion_idx])

def display_result(image, emotion, confidence):
    """Display image with prediction results"""
    font = cv2.FONT_HERSHEY_SIMPLEX
    color = (0, 255, 0) if emotion == 'Happy' else (0, 0, 255)
    
    cv2.putText(image, f"Emotion: {emotion}", (10, 30), font, 0.8, color, 2)
    cv2.putText(image, f"Confidence: {confidence:.2%}", (10, 70), font, 0.8, color, 2)
    
    cv2.imshow('Emotion Detection', image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

if __name__ == "__main__":
    # Paths configuration
    MODEL_PATH = "models/emotion_cnn_combined.keras"  # Prefer .keras over .h5
    TEST_IMAGE = "test_images/test_emotion.jpg"
    
    try:
        # Load model and image
        model = load_model(MODEL_PATH)
        input_tensor, original_img = load_and_prepare_image(TEST_IMAGE)
        
        # Make prediction
        emotion, confidence = predict_emotion(model, input_tensor)
        print(f"\n🎭 Detection Result: {emotion} ({confidence:.2%} confidence)")
        
        # Display results
        display_result(original_img, emotion, confidence)
        
    except Exception as e:
        print(f"\n❌ Error during testing: {str(e)}")