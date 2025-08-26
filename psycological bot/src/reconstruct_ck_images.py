# src/reconstruct_ck_images.py
import pandas as pd
import numpy as np
import cv2
from pathlib import Path

BASE_DIR = Path("C:/Users/MOHAMED AMINE/Desktop/Friendly_IA")
CK_CSV = BASE_DIR / "data/raw/CK+/ckextended.csv"
OUTPUT_DIR = BASE_DIR / "data/processed/CK_images"

def main():
    OUTPUT_DIR.mkdir(exist_ok=True)
    df = pd.read_csv(CK_CSV)
    
    for idx, row in df.iterrows():
        pixels = np.array(row['pixels'].split(), dtype='uint8')
        img = pixels.reshape(48, 48)
        cv2.imwrite(str(OUTPUT_DIR / f"ck_{idx}.png"), img)
    
    print(f"✅ Reconstructed {len(df)} images in {OUTPUT_DIR}")

if __name__ == "__main__":
    main()