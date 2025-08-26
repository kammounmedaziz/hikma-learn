import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

BASE_DIR = Path("C:/Users/MOHAMED AMINE/Desktop/Friendly_IA")
FER_CSV = BASE_DIR / "data" / "processed" / "fer_emotions.csv"

def verify_balance():
    df = pd.read_csv(FER_CSV)
    
    # 1. Calculate statistics
    total_counts = df['emotion'].value_counts()
    train_counts = df[df['split']=='train']['emotion'].value_counts()
    test_counts = df[df['split']=='test']['emotion'].value_counts()
    
    stats = pd.DataFrame({
        'Train': train_counts,
        'Test': test_counts,
        'Total': total_counts
    }).sort_index()
    
    # 2. Print report
    print("=== Dataset Balance Report ===")
    print(f"Total samples: {len(df):,}")
    print("\nClass distribution:")
    print(stats)
    
    # 3. Visualizations
    plt.figure(figsize=(15, 5))
    
    # Current distribution
    plt.subplot(1, 2, 1)
    stats[['Train', 'Test']].plot(kind='bar', stacked=True)
    plt.title("Class Distribution")
    plt.ylabel("Count")
    plt.xticks(rotation=45)
    
    # Target vs Actual
    plt.subplot(1, 2, 2)
    target = 20000
    (stats['Total'] - target).plot(kind='bar', color=['red' if x<0 else 'green' for x in (stats['Total'] - target)])
    plt.axhline(0, color='black')
    plt.title("Deviation from Target (20,000)")
    plt.ylabel("Samples Over(+) / Under(-)")
    plt.xticks(rotation=45)
    
    plt.tight_layout()
    plt.show()
    
    # 4. Verify samples
    print("\nSample filenames:")
    for emotion in stats.index:
        samples = df[df['emotion']==emotion]['image_path'].head(2)
        print(f"\n{emotion}:")
        for path in samples:
            print(f"  - {Path(path).name}")

if __name__ == "__main__":
    verify_balance()
    print("\n✅ Verification complete!")