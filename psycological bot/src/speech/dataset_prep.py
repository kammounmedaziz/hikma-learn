import pandas as pd
from pathlib import Path
import os
import subprocess
import sys

def convert_flac_to_wav(flac_path: Path, wav_path: Path) -> bool:
    """Convert FLAC to WAV using ffmpeg with error handling"""
    try:
        subprocess.run(
            [
                "ffmpeg",
                "-i", str(flac_path),
                "-ar", "16000",
                "-ac", "1",
                "-y",  # Overwrite if exists
                str(wav_path)
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        return True
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"⚠️ Failed to convert {flac_path}: {str(e)}")
        return False

def prepare_librispeech(input_dir: str, output_dir: str):
    """Converts LibriSpeech FLACs to WAV + generates metadata"""
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    metadata = []
    wav_dir = output_dir / "wavs"
    wav_dir.mkdir(exist_ok=True)
    
    processed_files = 0
    failed_files = 0
    
    # Convert FLAC to WAV and build metadata
    for trans_file in Path(input_dir).rglob("*.trans.txt"):
        with open(trans_file, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    file_id, text = line.strip().split(" ", 1)
                    flac_path = trans_file.parent / f"{file_id}.flac"
                    wav_path = wav_dir / f"{file_id}.wav"
                    
                    if convert_flac_to_wav(flac_path, wav_path):
                        metadata.append({
                            "path": str(wav_path.relative_to(output_dir)),
                            "text": text.lower()
                        })
                        processed_files += 1
                    else:
                        failed_files += 1
                        
                    # Progress feedback
                    if processed_files % 100 == 0:
                        print(f"Processed {processed_files} files...")
                        
                except Exception as e:
                    print(f"⚠️ Error processing {trans_file}: {str(e)}")
                    failed_files += 1
    
    # Save metadata
    if metadata:
        pd.DataFrame(metadata).to_csv(output_dir / "metadata.csv", index=False)
    
    print(f"\n✅ Preparation complete!")
    print(f"- Successful: {processed_files}")
    print(f"- Failed: {failed_files}")
    print(f"Output directory: {output_dir}")

if __name__ == "__main__":
    # Verify ffmpeg is installed
    try:
        subprocess.run(["ffmpeg", "-version"], 
                      check=True, 
                      stdout=subprocess.DEVNULL,
                      stderr=subprocess.DEVNULL)
    except FileNotFoundError:
        print("❌ FFmpeg not found. Please install it first:")
        print("Windows: winget install -e --id Gyan.FFmpeg")
        print("Linux/Mac: sudo apt install ffmpeg")
        sys.exit(1)
        
    prepare_librispeech(
        input_dir="data/raw/speech/librispeech/dev-other",
        output_dir="data/processed/stt/librispeech"
    )