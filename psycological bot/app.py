import gradio as gr
import yaml
from pathlib import Path
import torch
import pandas as pd
import faiss
from transformers import pipeline
from sentence_transformers import SentenceTransformer
from langchain_community.llms import Ollama

# Load config
with open("configs/paths.yaml") as f:
    config = yaml.safe_load(f)
BASE_DIR = Path(config["paths"]["base_dir"])

class EmotionalSupportAI:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Running on: {self.device.upper()}")

        # Paths
        self.data_path = BASE_DIR / config["paths"]["processed_dir"] / "chunks.csv"
        self.embeddings_path = BASE_DIR / config["paths"]["embeddings_dir"] / "emotional_support.index"

        # Models
        self.emotion_classifier = pipeline(
            "text-classification",
            model="SamLowe/roberta-base-go_emotions",
            device=0 if self.device == "cuda" else -1
        )
        self.embedder = SentenceTransformer("all-MiniLM-L6-v2", device=self.device)
        self.index = faiss.read_index(str(self.embeddings_path))
        self.chunks = pd.read_csv(self.data_path)["text"].tolist()
        self.llm = Ollama(model="mistral")

    def detect_emotion(self, text):
        result = self.emotion_classifier(text)[0]
        return f"{result['label']} (confidence: {result['score']:.2f})"

    def generate_response(self, message, history):
        try:
            emotion = self.detect_emotion(message)
            print(f"Detected: {emotion}")

            # Get safe embeddings
            query_embedding = self.embedder.encode(
                [message],
                convert_to_numpy=True,
                device="cpu"
            )
            
            # Retrieve context
            _, indices = self.index.search(query_embedding, 3)
            context = "\n".join([self.chunks[i] for i in indices[0]])

            prompt = f"""Respond as a supportive friend:
            User Emotion: {emotion}
            Context: {context}
            User: {message}
            Friend:"""
            
            return self.llm(prompt)
        
        except Exception as e:
            return f"Error generating response: {str(e)}"

# GUI Setup
with gr.Blocks(title="Emotional Support AI", theme=gr.themes.Soft()) as app:
    gr.Markdown("# 🤗 Emotional Support Companion")
    with gr.Row():
        chatbot = gr.Chatbot(height=400)
    with gr.Row():
        msg = gr.Textbox(label="Your message", placeholder="How are you feeling?")
        clear = gr.ClearButton([msg, chatbot])

    ai = EmotionalSupportAI()

    def respond(message, chat_history):
        response = ai.generate_response(message, chat_history)
        chat_history.append((message, response))
        return "", chat_history

    msg.submit(respond, [msg, chatbot], [msg, chatbot])

if __name__ == "__main__":
    app.launch(server_port=7860, share=False)