# scripts/generate_face_embeddings.py
import sys
import os
import cv2
import numpy as np
from pathlib import Path
from tqdm import tqdm

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from src.shared.face_recognition import FaceRecognizer

def generate_user_embeddings(user_id: str):
    """Generate embeddings for a specific user"""
    recognizer = FaceRecognizer()
    user_dir = project_root / "data" / "users_profiles" / user_id
    raw_dir = user_dir / "raw"
    embeddings_dir = user_dir / "embeddings"
    
    if not raw_dir.exists():
        print(f"❌ No raw images found for {user_id}")
        return

    # Create embeddings directory if needed
    embeddings_dir.mkdir(parents=True, exist_ok=True)
    
    embeddings = []
    image_paths = list(raw_dir.glob("*.jpg")) + list(raw_dir.glob("*.png"))
    
    if not image_paths:
        print(f"❌ No images found for {user_id} in {raw_dir}")
        return

    print(f"\n🔍 Processing {len(image_paths)} images for {user_id}...")
    
    for img_path in tqdm(image_paths, desc=f"Generating embeddings for {user_id}"):
        try:
            face_img = cv2.imread(str(img_path))
            if face_img is not None:
                emb = recognizer.get_face_embedding(face_img)
                embeddings.append(emb)
        except Exception as e:
            print(f"⚠️ Error processing {img_path.name}: {str(e)}")
            continue

    if embeddings:
        save_path = embeddings_dir / "embeddings.npy"
        np.save(str(save_path), np.array(embeddings))
        print(f"✅ Saved {len(embeddings)} embeddings for {user_id} to {save_path}")
    else:
        print(f"❌ Failed to generate embeddings for {user_id}")

def generate_all_embeddings():
    """Generate embeddings for all registered users"""
    users_dir = project_root / "data" / "users_profiles"
    
    if not users_dir.exists():
        print("❌ No users found in the system")
        return

    print("\n🔍 Scanning for registered users...")
    user_folders = [d.name for d in users_dir.iterdir() if d.is_dir()]
    
    if not user_folders:
        print("❌ No registered users found")
        return

    print(f"👥 Found {len(user_folders)} users: {', '.join(user_folders)}")
    
    for user_id in user_folders:
        generate_user_embeddings(user_id)

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate face embeddings')
    parser.add_argument('--user', type=str, help='Specific user ID to process')
    args = parser.parse_args()

    if args.user:
        generate_user_embeddings(args.user.lower().strip())
    else:
        generate_all_embeddings()