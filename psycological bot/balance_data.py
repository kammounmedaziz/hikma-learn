import shutil
from pathlib import Path
import random

BASE_DIR = Path("C:/Users/MOHAMED AMINE/Desktop/Friendly_IA")
TARGET_TRAIN = 16000  # 80% of 20,000
TARGET_TEST = 4000    # 20% of 20,000

def balance_class(emotion, current_train, current_test):
    train_dir = BASE_DIR / f"data/processed/FER_augmented/train/{emotion}"
    test_dir = BASE_DIR / f"data/processed/FER_augmented/test/{emotion}"
    
    print(f"\nBalancing {emotion}: Current={current_train} train, {current_test} test")
    
    # Train set adjustment
    if current_train > TARGET_TRAIN:
        # Remove excess (keeping original files)
        files = [f for f in train_dir.glob('*') if not f.name.startswith('copy_')]
        to_remove = current_train - TARGET_TRAIN
        for f in random.sample(files, min(to_remove, len(files))):
            f.unlink()
        print(f"  - Removed {min(to_remove, len(files))} original train samples")
    else:
        # Add copies from original files
        orig_files = [f for f in train_dir.glob('*') if not f.name.startswith('copy_')]
        copies_needed = TARGET_TRAIN - current_train
        for i in range(copies_needed):
            src = random.choice(orig_files)
            dst = train_dir / f"copy_{i}_{src.name}"
            shutil.copy(src, dst)
        print(f"  - Added {copies_needed} train copies")

    # Test set adjustment (same logic)
    if current_test > TARGET_TEST:
        files = [f for f in test_dir.glob('*') if not f.name.startswith('copy_')]
        to_remove = current_test - TARGET_TEST
        for f in random.sample(files, min(to_remove, len(files))):
            f.unlink()
        print(f"  - Removed {min(to_remove, len(files))} original test samples")
    else:
        orig_files = [f for f in test_dir.glob('*') if not f.name.startswith('copy_')]
        copies_needed = TARGET_TEST - current_test
        for i in range(copies_needed):
            src = random.choice(orig_files)
            dst = test_dir / f"copy_{i}_{src.name}"
            shutil.copy(src, dst)
        print(f"  - Added {copies_needed} test copies")

def main():
    # Get current counts
    df = pd.read_csv(BASE_DIR / "data/processed/fer_emotions.csv")
    counts = df.groupby(['emotion', 'split']).size().unstack()
    
    for emotion in counts.index:
        balance_class(
            emotion,
            counts.loc[emotion, 'train'],
            counts.loc[emotion, 'test']
        )
    
    print("\n✅ Re-run verify_data.py to check new balance")

if __name__ == "__main__":
    import pandas as pd
    main()