# scripts/visualize_dataset_balance.py
import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

BASE_DIR = Path("C:/Users/MOHAMED AMINE/Desktop/Friendly_IA")

def plot_distribution(df, title):
    df['emotion'].value_counts().plot(kind='bar')
    plt.title(title)
    plt.show()

if __name__ == "__main__":
    # Load FER data
    fer_df = pd.read_csv(BASE_DIR / "data/processed/fer_emotions.csv")
    plot_distribution(fer_df, "FER-2013 Emotion Distribution")

    # Load CK+ data (after reconstruction)
    ck_df = pd.DataFrame({
        'emotion': pd.read_csv(BASE_DIR / "data/raw/CK+/ckextended.csv")['emotion']
    })
    plot_distribution(ck_df, "CK+ Emotion Distribution")