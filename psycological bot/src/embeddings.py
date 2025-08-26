from sentence_transformers import SentenceTransformer
import pandas as pd
import faiss
import torch
from pathlib import Path
from tqdm import tqdm
import warnings

def generate_embeddings():
    # Suppress warnings
    warnings.filterwarnings("ignore")
    
    # Configure paths
    BASE_DIR = Path("C:/Users/MOHAMED AMINE/Desktop/Friendly_IA")
    CHUNKS_PATH = BASE_DIR / "data" / "processed" / "chunks_with_emotion.csv"
    EMBEDDINGS_DIR = BASE_DIR / "data" / "embeddings"
    EMBEDDINGS_DIR.mkdir(parents=True, exist_ok=True)
    INDEX_PATH = EMBEDDINGS_DIR / "emotional_support.index"

    try:
        # 1. Device setup
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"⚡ Running embeddings on: {device.upper()}")
        if torch.cuda.is_available():
            print(f"GPU: {torch.cuda.get_device_name(0)}")
        
        # 2. Load data
        print(f"\n🔍 Loading data from: {CHUNKS_PATH}")
        df = pd.read_csv(CHUNKS_PATH)
        texts = df["text"].tolist()
        print(f"📊 Loaded {len(texts)} chunks with {len(df['emotion'].unique())} emotion categories")

        # 3. Initialize model (uses GPU for embeddings if available)
        print("\n🚀 Loading embedding model...")
        model = SentenceTransformer("all-MiniLM-L6-v2", device=device)

        # 4. Generate embeddings with smaller batches
        print("\n🔧 Generating embeddings...")
        embeddings = model.encode(
            texts,
            batch_size=64,  # Conservative for 6GB GPU
            show_progress_bar=True,
            convert_to_numpy=True
        ).astype('float32')

        # 5. FAISS CPU index (works cross-platform)
        print("\n💾 Creating FAISS index (CPU)...")
        index = faiss.IndexFlatL2(embeddings.shape[1])
        index.add(embeddings)
        faiss.write_index(index, str(INDEX_PATH))

        # 6. Save metadata
        df[['emotion']].to_csv(EMBEDDINGS_DIR / "embedding_metadata.csv", index=False)
        
        print(f"\n✅ Success! Index saved to: {INDEX_PATH}")
        print(f"✨ Embedding dimensions: {embeddings.shape[1]}")
        print(f"✨ Total vectors stored: {index.ntotal}")

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("\n💡 Troubleshooting:")
        print("- Reduce batch_size if out of memory")
        print("- Check CSV file integrity")

if __name__ == "__main__":
    print("===== Embedding Generation =====")
    generate_embeddings()