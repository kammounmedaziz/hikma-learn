import cv2
import torch
import numpy as np
from torchvision import transforms
from pathlib import Path
from train_emotion_model import EmotionCNN

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = EmotionCNN().to(device)
model.load_state_dict(torch.load("models/emotion_cnn_best.pt"))
model.eval()

emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

def predict_emotion(image_path):
    img = cv2.imread(str(image_path), cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise FileNotFoundError(f"Image not found at {image_path}")
    
    # Show the processed image
    cv2.imshow("Processed Image", cv2.resize(img, (200, 200)))
    cv2.waitKey(500)  # Show for 500ms
    
    img = cv2.resize(img, (48, 48))
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5], std=[0.5])
    ])
    img_tensor = transform(img).unsqueeze(0).to(device)
    
    with torch.no_grad():
        outputs = model(img_tensor)
        probs = torch.nn.functional.softmax(outputs, dim=1)[0]
        top3 = torch.topk(probs, 3)
        
    print("\n--- Prediction Results ---")
    for i in range(3):
        print(f"{emotion_labels[top3.indices[i]]}: {top3.values[i].item():.1%}")
    
    return emotion_labels[top3.indices[0]]

# Test
image_path = Path(r"C:\Users\MOHAMED AMINE\Desktop\Friendly_IA\test_images\test_emotion.jpg")
try:
    emotion = predict_emotion(image_path)
    print(f"\nFinal Prediction: {emotion}")
except Exception as e:
    print(f"❌ Error: {str(e)}")
finally:
    cv2.destroyAllWindows()