import cv2
import numpy as np
import torch
from pathlib import Path
from facenet_pytorch import InceptionResnetV1

class FaceRecognizer:
    def __init__(self, global_threshold=0.7):
        self.resnet = InceptionResnetV1(pretrained='vggface2').eval()
        self.known_users = {}
        self.global_threshold = global_threshold
        self._load_all_users()

    def _load_all_users(self):
        users_dir = Path("data/users_profiles")
        for user_dir in users_dir.iterdir():
            if user_dir.is_dir():
                emb_path = user_dir / "embeddings/embeddings.npy"
                if emb_path.exists():
                    embeddings = np.load(emb_path)
                    self.known_users[user_dir.name] = {
                        'embeddings': embeddings,
                        'threshold': self._calculate_user_threshold(embeddings)
                    }

    def _calculate_user_threshold(self, embeddings):
        if len(embeddings) < 2:
            return self.global_threshold
        distances = []
        for i in range(len(embeddings)):
            for j in range(i+1, len(embeddings)):
                distances.append(np.linalg.norm(embeddings[i] - embeddings[j]))
        return np.mean(distances) * 1.5

    def get_face_embedding(self, face_image):
        face = cv2.resize(face_image, (160, 160))
        face = (face - 127.5) / 128.0  # Normalization
        face_tensor = torch.tensor(face).permute(2, 0, 1).unsqueeze(0).float()
        with torch.no_grad():
            return self.resnet(face_tensor).numpy()

    def recognize_user(self, face_image):
        try:
            query_emb = self.get_face_embedding(face_image)
            best_match = None
            min_distance = float('inf')

            for user_id, data in self.known_users.items():
                distances = np.linalg.norm(data['embeddings'] - query_emb, axis=1)
                current_min = np.min(distances)
                
                if current_min < data['threshold'] and current_min < min_distance:
                    min_distance = current_min
                    best_match = user_id

            if best_match and min_distance < self.global_threshold:
                return best_match, min_distance
            return None, float('inf')
        
        except Exception as e:
            print(f"Recognition error: {str(e)}")
            return None, float('inf')