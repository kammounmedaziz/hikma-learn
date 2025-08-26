import os
import sys
import torch
import yaml
from pathlib import Path
from datasets import load_dataset, Audio, Dataset
from transformers import (
    WhisperForConditionalGeneration,
    WhisperProcessor,
    Seq2SeqTrainingArguments,
    Seq2SeqTrainer,
    EarlyStoppingCallback,
    GenerationConfig
)
import numpy as np
from dataclasses import dataclass
from typing import Any, Dict, List, Union
import logging
import evaluate
import warnings
from jiwer import wer as compute_wer  # Direct import for WER calculation

# Suppress warnings
warnings.filterwarnings("ignore")
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/stt_training.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Device configuration
device = "cuda" if torch.cuda.is_available() else "cpu"
logger.info(f"Using device: {device}")

# Load configuration
with open('configs/paths.yaml') as f:
    config = yaml.safe_load(f)

BASE_DIR = Path(config['paths']['base_dir'])
STT_CONFIG = config['stt']

# Constants
MODEL_NAME = "openai/whisper-small"
CACHE_DIR = BASE_DIR / "models" / ".cache"
os.environ['HF_HOME'] = str(CACHE_DIR)

@dataclass
class DataCollatorSpeechSeq2SeqWithPadding:
    processor: Any
    device: str

    def __call__(self, features: List[Dict[str, Union[List[int], torch.Tensor]]]) -> Dict[str, torch.Tensor]:
        input_features = [{"input_features": feature["input_features"]} for feature in features]
        label_features = [{"input_ids": feature["labels"]} for feature in features]

        batch = self.processor.feature_extractor.pad(input_features, return_tensors="pt")
        labels_batch = self.processor.tokenizer.pad(label_features, return_tensors="pt")

        # Convert to device without pinning memory
        batch = {k: v.to(self.device) for k, v in batch.items()}
        labels = labels_batch["input_ids"].masked_fill(labels_batch.attention_mask.ne(1), -100)
        batch["labels"] = labels.to(self.device)
        
        return batch

def process_dataset_item(item, processor, base_dir):
    try:
        audio_path = item["path"].replace("wavs/", "").replace("wavs\\", "")
        full_path = base_dir / "data" / "processed" / "stt" / "librispeech" / "wavs" / audio_path
        
        if not full_path.exists():
            logger.warning(f"Missing audio file: {full_path}")
            return None
            
        audio = Audio(sampling_rate=STT_CONFIG["sample_rate"]).decode_example({
            "path": str(full_path),
            "bytes": None
        })
        
        input_features = processor.feature_extractor(
            audio["array"],
            sampling_rate=audio["sampling_rate"],
            return_attention_mask=False
        ).input_features[0]
        
        labels = processor.tokenizer(item["text"]).input_ids
        
        return {
            "input_features": input_features,
            "labels": labels
        }
    except Exception as e:
        logger.error(f"Error processing {item.get('path')}: {str(e)}")
        return None

def prepare_dataset(dataset, processor, base_dir):
    processed_data = []
    for idx, item in enumerate(dataset):
        if idx % 500 == 0:
            logger.info(f"Processing sample {idx}/{len(dataset)}")
        processed_item = process_dataset_item(item, processor, base_dir)
        if processed_item is not None:
            processed_data.append(processed_item)
    
    if not processed_data:
        raise ValueError("No valid samples found in dataset!")
    
    return Dataset.from_dict({
        "input_features": [x["input_features"] for x in processed_data],
        "labels": [x["labels"] for x in processed_data]
    })

def compute_metrics(pred, processor):
    pred_ids = pred.predictions
    label_ids = pred.label_ids

    label_ids[label_ids == -100] = processor.tokenizer.pad_token_id
    pred_str = processor.tokenizer.batch_decode(pred_ids, skip_special_tokens=True)
    label_str = processor.tokenizer.batch_decode(label_ids, skip_special_tokens=True)

    # Robust WER calculation with type safety
    wer_value = 100.0  # Default high value if calculation fails
    try:
        if isinstance(compute_wer, float):  # If already computed as float
            wer_value = compute_wer * 100
        else:
            wer_value = float(compute_wer(label_str, pred_str)) * 100
    except Exception as e:
        logger.warning(f"WER calculation failed, using default: {str(e)}")
    
    return {"wer": wer_value}


def simple_wer_approximation(references, predictions):
    """Fallback WER calculation when jiwer fails"""
    total_errors = 0
    total_words = 0
    
    for ref, pred in zip(references, predictions):
        ref_words = ref.split()
        pred_words = pred.split()
        total_words += len(ref_words)
        
        # Count differences
        errors = abs(len(ref_words) - len(pred_words))
        for rw, pw in zip(ref_words, pred_words):
            if rw != pw:
                errors += 1
        total_errors += errors
    
    return total_errors / max(1, total_words)

def main():
    try:
        # 1. Initialize components
        processor = WhisperProcessor.from_pretrained(
            MODEL_NAME,
            language=STT_CONFIG["language"],
            task="transcribe"
        )
        
        model = WhisperForConditionalGeneration.from_pretrained(
            MODEL_NAME,
            ignore_mismatched_sizes=True
        ).to(device)
        
        model.config.update({
            "forced_decoder_ids": processor.get_decoder_prompt_ids(),
            "suppress_tokens": [],
            "use_cache": False
        })
        
        generation_config = GenerationConfig(
            max_length=225,
            pad_token_id=50257,
            eos_token_id=50257,
            suppress_tokens=[],
            begin_suppress_tokens=[220, 50257]
        )
        model.generation_config = generation_config

        # 2. Prepare dataset
        dataset_path = BASE_DIR / "data" / "processed" / "stt" / "librispeech" / "metadata.csv"
        logger.info(f"Loading dataset from: {dataset_path}")
        
        raw_dataset = load_dataset("csv", data_files=str(dataset_path), split="train")
        raw_dataset = raw_dataset.filter(lambda x: x["path"] is not None and x["text"] is not None)
        
        logger.info(f"Raw dataset samples: {len(raw_dataset)}")
        if len(raw_dataset) > 0:
            logger.info(f"Sample item: Path={raw_dataset[0]['path']}, Text={raw_dataset[0]['text'][:50]}...")
        
        dataset = prepare_dataset(raw_dataset, processor, BASE_DIR)
        dataset = dataset.train_test_split(test_size=0.2, seed=42)
        logger.info(f"Dataset prepared. Train: {len(dataset['train'])}, Test: {len(dataset['test'])}")

        # 3. Training setup with fixed data collator
        data_collator = DataCollatorSpeechSeq2SeqWithPadding(processor=processor, device=device)
        
        training_args = Seq2SeqTrainingArguments(
            output_dir=str(BASE_DIR / "models" / "speech" / "stt" / "fine-tuned"),
            per_device_train_batch_size=8 if device == "cuda" else 2,
            per_device_eval_batch_size=4 if device == "cuda" else 1,
            gradient_accumulation_steps=2 if device == "cuda" else 4,
            learning_rate=1e-5,
            warmup_steps=50,
            max_steps=300,
            evaluation_strategy="steps",
            eval_steps=50,
            save_steps=50,
            logging_steps=5,
            report_to=["tensorboard"],
            load_best_model_at_end=True,
            metric_for_best_model="wer",
            greater_is_better=False,
            predict_with_generate=True,
            generation_config=generation_config,
            save_total_limit=1,
            lr_scheduler_type="linear",
            optim="adamw_torch_fused" if device == "cuda" else "adamw_torch",
            fp16=device == "cuda",
            dataloader_pin_memory=False,
            dataloader_num_workers=0 if sys.platform == "win32" else 2,
            remove_unused_columns=False
        )
        
        trainer = Seq2SeqTrainer(
            args=training_args,
            model=model,
            train_dataset=dataset["train"],
            eval_dataset=dataset["test"],
            data_collator=data_collator,
            tokenizer=processor.feature_extractor,
            callbacks=[EarlyStoppingCallback(early_stopping_patience=3)],
            compute_metrics=lambda pred: compute_metrics(pred, processor)
        )

        # 4. Start training
        logger.info("Starting training...")
        train_result = trainer.train()
        
        # 5. Save results
        final_dir = BASE_DIR / "models" / "speech" / "stt" / "fine-tuned" / "final"
        final_dir.mkdir(parents=True, exist_ok=True)
        trainer.save_model(str(final_dir))
        processor.save_pretrained(str(final_dir))
        
        if hasattr(train_result, 'metrics'):
            metrics = train_result.metrics
            wer = metrics.get('eval_wer', metrics.get('wer', 100.0))
            try:
                wer_float = float(wer)  # Force conversion to float
                logger.info(f"Training completed. Final WER: {wer_float:.2f}%")
            except (ValueError, TypeError) as e:
                logger.info(f"Training completed. Final WER: {str(wer)} (raw value)")
        else:
            logger.info("Training completed. Metrics not available.")
        
        logger.info(f"Model saved to: {final_dir}")

    except Exception as e:
        logger.error(f"Training failed: {str(e)}", exc_info=True)
        raise

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Training interrupted by user")
    except Exception as e:
        logger.critical(f"Fatal error: {str(e)}", exc_info=True)
        sys.exit(1)