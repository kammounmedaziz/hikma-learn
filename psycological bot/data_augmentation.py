import cv2
import numpy as np
import os
from pathlib import Path
from tqdm import tqdm  # For progress bars

def augment_images(input_dir, output_dir, augment_factor=5):
    """
    Enhanced image augmentation with:
    - Grayscale conversion
    - More transformations
    - Better error handling
    - Progress tracking
    """
    # Create output directory
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # Emotion classes to process
    emotions = [e for e in os.listdir(input_dir) 
               if os.path.isdir(os.path.join(input_dir, e))]
    
    print(f"🔄 Augmenting {len(emotions)} emotion classes...")
    
    for emotion in tqdm(emotions, desc="Processing Emotions"):
        emotion_dir = os.path.join(input_dir, emotion)
        output_emotion_dir = os.path.join(output_dir, emotion)
        os.makedirs(output_emotion_dir, exist_ok=True)
        
        # Get all images for current emotion
        images = [img for img in os.listdir(emotion_dir) 
                 if img.lower().endswith(('.png', '.jpg', '.jpeg'))]
        
        for img_name in tqdm(images, desc=f"Augmenting {emotion}", leave=False):
            img_path = os.path.join(emotion_dir, img_name)
            
            try:
                # Read as grayscale (better for emotion recognition)
                img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
                if img is None:
                    continue
                
                # Base augmentations
                augmentations = [
                    ('orig', img),  # Always keep original
                    ('flip', cv2.flip(img, 1)),  # Horizontal flip
                ]
                
                # Add rotations if needed
                if augment_factor >= 4:
                    for angle in [10, -10, 15]:  # Multiple rotation angles
                        M = cv2.getRotationMatrix2D(
                            (img.shape[1]//2, img.shape[0]//2), 
                            angle, 1.0)
                        rotated = cv2.warpAffine(img, M, img.shape[::-1])
                        augmentations.append((f'rot{angle}', rotated))
                
                # Add advanced transforms if needed
                if augment_factor >= 6:
                    # Gaussian blur
                    augmentations.append(('blur', cv2.GaussianBlur(img, (5,5), 0)))
                    
                    # Perspective transform
                    pts1 = np.float32([[10,10], [40,10], [10,40]])
                    pts2 = np.float32([[5,5], [45,5], [15,45]])
                    M = cv2.getAffineTransform(pts1, pts2)
                    warped = cv2.warpAffine(img, M, img.shape[::-1])
                    augmentations.append(('warp', warped))
                
                # Save all variants
                for suffix, aug_img in augmentations[:augment_factor]:
                    output_path = os.path.join(
                        output_emotion_dir, 
                        f"{suffix}_{img_name}")
                    cv2.imwrite(output_path, aug_img)
                    
            except Exception as e:
                print(f"\n⚠️ Error processing {img_path}: {str(e)}")
                continue

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=str, required=True,
                       help="Path to raw FER-2013 train/test folder")
    parser.add_argument("--output", type=str, required=True,
                       help="Output directory for augmented images")
    parser.add_argument("--factor", type=int, default=5,
                       help="Number of augmentations per image (3-6)")
    
    args = parser.parse_args()
    
    print(f"\n=== Starting Augmentation (Factor: {args.factor}) ===")
    augment_images(args.input, args.output, args.factor)
    print("\n✅ Augmentation complete!")    