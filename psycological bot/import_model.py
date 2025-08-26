from transformers import pipeline
emotion_pipeline = pipeline("text-classification", model="SamLowe/roberta-base-go_emotions")