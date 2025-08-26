import os
os.environ["OMP_NUM_THREADS"] = "1"  # Critical for RPi memory
os.environ["OPENCV_VIDEOIO_PRIORITY_MSMF"] = "0"  # Better camera compatibility

from facial_emotion import FacialEmotionDetector
import cv2
import time

def main():
    # Initialize with performance optimizations
    detector = FacialEmotionDetector(model_path="models/emotion_model.onnx")
    
    # Camera setup with fallbacks
    cap = None
    for api in [cv2.CAP_V4L2, cv2.CAP_ANY]:  # Prefer V4L2 for Raspberry Pi
        cap = cv2.VideoCapture(0, api)
        if cap.isOpened():
            break
    
    if not cap or not cap.isOpened():
        print("❌ Error: Could not open camera")
        return
    
    # Raspberry Pi-optimized settings
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 320)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 240)
    cap.set(cv2.CAP_PROP_FPS, 10)  # Reduced FPS for thermal management
    
    # Performance tracking
    frame_count = 0
    start_time = time.time()
    
    try:
        while True:
            # Capture frame-by-frame
            ret, frame = cap.read()
            if not ret:
                print("⚠️ Frame capture failed")
                break
            
            # Process every 3rd frame to reduce CPU load
            if frame_count % 3 == 0:
                result = detector.detect_emotion(frame)
                print(
                    f"{time.strftime('%H:%M:%S')} - "
                    f"Emotion: {result['emotion']:8} "
                    f"Confidence: {result['confidence']:.0%} "
                    f"FPS: {frame_count / (time.time() - start_time):.1f}"
                )
            
            frame_count += 1
            
            # Display the resulting frame
            cv2.imshow('Emotion Detection', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
    finally:
        # Cleanup
        cap.release()
        cv2.destroyAllWindows()
        print("\n🛑 Camera released")

if __name__ == "__main__":
    print("🚀 Starting Raspberry Pi Optimized Emotion Detection")
    main()  