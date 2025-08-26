import os
from pathlib import Path
import pandas as pd
import cv2
import numpy as np
from datasets import load_from_disk
from langchain.text_splitter import RecursiveCharacterTextSplitter

def augment_fer_images(input_dir, output_dir):
    """Augment FER-2013 images with rotations and flips"""
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    for emotion in os.listdir(input_dir):
        emotion_dir = os.path.join(input_dir, emotion)
        if not os.path.isdir(emotion_dir):
            continue
            
        output_emotion_dir = os.path.join(output_dir, emotion)
        os.makedirs(output_emotion_dir, exist_ok=True)
        
        for img_name in os.listdir(emotion_dir):
            img_path = os.path.join(emotion_dir, img_name)
            try:
                img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
                if img is None:
                    continue
                
                # Original
                cv2.imwrite(os.path.join(output_emotion_dir, f"orig_{img_name}"), img)
                
                # Flip
                flipped = cv2.flip(img, 1)
                cv2.imwrite(os.path.join(output_emotion_dir, f"flip_{img_name}"), flipped)
                
                # Rotations
                for angle in [10, -10]:
                    M = cv2.getRotationMatrix2D((img.shape[1]//2, img.shape[0]//2), angle, 1)
                    rotated = cv2.warpAffine(img, M, (img.shape[1], img.shape[0]))
                    cv2.imwrite(os.path.join(output_emotion_dir, f"rot{angle}_{img_name}"), rotated)
                    
            except Exception as e:
                print(f"⚠️ Error processing {img_path}: {str(e)}")

def process_empathetic_dialogues(input_path, output_dir):
    """Process empathetic dialogues dataset"""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=256,
        chunk_overlap=20,
        separators=["\n", ".", "!", "?"]
    )
    
    dataset = load_from_disk(str(input_path))
    processed_chunks = []
    
    for item in dataset["train"]:
        assistant_responses = [
            conv["content"] for conv in item["conversations"] 
            if conv["role"] == "assistant"
        ]
        
        for text in assistant_responses:
            chunks = text_splitter.split_text(text)
            for chunk in chunks:
                processed_chunks.append({
                    "text": chunk.strip(),
                    "emotion": item["emotion"],
                    "situation": item["situation"],
                    "source": "empathetic_dialogues"
                })
    
    return processed_chunks

def create_fer_metadata(fer_dir, output_path):
    """Create CSV metadata for FER-2013 images"""
    rows = []
    
    for split in ["train", "test"]:
        split_dir = os.path.join(fer_dir, split)
        if not os.path.exists(split_dir):
            continue
            
        for emotion in os.listdir(split_dir):
            emotion_dir = os.path.join(split_dir, emotion)
            for img in os.listdir(emotion_dir):
                rows.append({
                    "image_path": os.path.join(emotion_dir, img),
                    "emotion": emotion,
                    "split": split,
                    "source": "FER-2013"
                })
    
    pd.DataFrame(rows).to_csv(output_path, index=False)
    return len(rows)

def preprocess_all_data():
    BASE_DIR = Path("C:/Users/MOHAMED AMINE/Desktop/Friendly_IA")
    
    # Path configuration
    paths = {
        "raw": {
            "dialogues": BASE_DIR / "data" / "raw" / "empathetic_dialogues_llm",
            "fer": BASE_DIR / "data" / "raw" / "FER-2013"
        },
        "processed": {
            "dir": BASE_DIR / "data" / "processed",
            "dialogues": BASE_DIR / "data" / "processed" / "chunks_with_emotion.csv",
            "fer_augmented": BASE_DIR / "data" / "processed" / "FER_augmented",
            "fer_metadata": BASE_DIR / "data" / "processed" / "fer_emotions.csv"
        }
    }

    # Create processed directories
    paths["processed"]["dir"].mkdir(parents=True, exist_ok=True)
    
    try:
        # 1. Process FER-2013 images
        print("🔄 Processing FER-2013 images...")
        augment_fer_images(
            paths["raw"]["fer"] / "train",
            paths["processed"]["fer_augmented"] / "train"
        )
        augment_fer_images(
            paths["raw"]["fer"] / "test",
            paths["processed"]["fer_augmented"] / "test"
        )
        
        fer_count = create_fer_metadata(
            paths["processed"]["fer_augmented"],
            paths["processed"]["fer_metadata"]
        )
        print(f"✅ Augmented {fer_count} FER-2013 images")
        
        # 2. Process empathetic dialogues
        print("\n📝 Processing empathetic dialogues...")
        dialogue_chunks = process_empathetic_dialogues(
            paths["raw"]["dialogues"],
            paths["processed"]["dir"]
        )
        
        pd.DataFrame(dialogue_chunks).to_csv(
            paths["processed"]["dialogues"], 
            index=False
        )
        print(f"✅ Processed {len(dialogue_chunks)} dialogue chunks")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Critical error: {str(e)}")
        return False

if __name__ == "__main__":
    print("\n===== DATA PROCESSING PIPELINE =====")
    print("Starting full preprocessing...\n")
    
    if preprocess_all_data():
        print("\n🎉 All data processed successfully!")
    else:
        print("\n⚠️  Processing failed. Check error messages above.")