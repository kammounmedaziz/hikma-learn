# scripts/capture_user_faces.py
import cv2
import time
from pathlib import Path
import tkinter as tk
from tkinter import simpledialog

def capture_user_faces():
    # Get user ID through a dialog
    root = tk.Tk()
    root.withdraw()  # Hide the main window
    user_id = simpledialog.askstring("User Registration", "Enter your name:")
    
    if not user_id:
        print("❌ No name entered. Exiting...")
        return

    # Clean and format user ID
    user_id = user_id.strip().lower().replace(" ", "_")
    num_images = 30
    
    # Create user directory structure
    user_dir = Path(f"data/users_profiles/{user_id}")
    raw_dir = user_dir / "raw"
    embeddings_dir = user_dir / "embeddings"
    
    raw_dir.mkdir(parents=True, exist_ok=True)
    embeddings_dir.mkdir(exist_ok=True)

    # Check existing images
    existing_images = list(raw_dir.glob("face_*.jpg"))
    start_number = len(existing_images)
    
    # Initialize face detection
    detector = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    )
    
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Error: Could not open camera")
        return

    count = start_number
    captured = 0
    last_face_time = time.time()
    
    try:
        while captured < num_images:
            ret, frame = cap.read()
            if not ret:
                print("⚠️ Failed to capture frame")
                continue

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = detector.detectMultiScale(gray, 1.3, 5)
            
            if len(faces) == 1:
                x, y, w, h = faces[0]
                face_img = frame[y:y+h, x:x+w]
                
                if time.time() - last_face_time > 0.3:
                    cv2.imwrite(str(raw_dir / f"face_{count:04d}.jpg"), face_img)
                    count += 1
                    captured += 1
                    print(f"📸 Captured image {captured}/{num_images} for {user_id}")
                    last_face_time = time.time()
                
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            else:
                last_face_time = time.time()

            # Display info
            cv2.putText(frame, f"User: {user_id}", (10, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(frame, f"Captured: {captured}/{num_images}", (10, 60),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            cv2.putText(frame, "Press Q to quit", (10, frame.shape[0]-10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            cv2.imshow('Face Capture - User Registration', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    finally:
        cap.release()
        cv2.destroyAllWindows()
        print(f"\n✅ Successfully captured {captured} images for {user_id}")
        print(f"💾 Images saved to: {raw_dir}")
        print(f"➡️ Run 'generate_face_embeddings.py' to create embeddings")

if __name__ == "__main__":
    capture_user_faces()