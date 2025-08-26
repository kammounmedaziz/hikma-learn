# src/combine_datasets.py
import yaml
import pandas as pd
from pathlib import Path
from sklearn.utils import resample

BASE_DIR = Path("C:/Users/MOHAMED AMINE/Desktop/Friendly_IA")
CONFIG = yaml.safe_load(open(BASE_DIR / "configs/dataset_config.yaml"))

def load_and_map_ck():
    df = pd.read_csv(BASE_DIR / "data/raw/CK+/ckextended.csv")
    df['emotion'] = df['emotion'].map(CONFIG['emotion_mapping'])
    df['image_path'] = f"data/processed/CK_images/ck_" + df.index.astype(str) + ".png"
    return df

if __name__ == "__main__":
    # Load both datasets
    fer_df = pd.read_csv(BASE_DIR / "data/processed/fer_emotions.csv")
    ck_df = load_and_map_ck()
    
    # Merge and save
    combined = pd.concat([fer_df, ck_df])
    combined.to_csv(BASE_DIR / "data/processed/combined_dataset.csv", index=False)