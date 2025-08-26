import tensorflow as tf
from tensorflow.keras import layers, models, regularizers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint, TensorBoard
import pandas as pd
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt
from sklearn.utils.class_weight import compute_class_weight
import os
from datetime import datetime

# Enable GPU acceleration
gpus = tf.config.experimental.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
        logical_gpus = tf.config.experimental.list_logical_devices('GPU')
        print(f"{len(gpus)} Physical GPUs, {len(logical_gpus)} Logical GPUs")
    except RuntimeError as e:
        print(e)

# Config
BASE_DIR = Path("C:/Users/MOHAMED AMINE/Desktop/Friendly_IA")
FER_CSV = BASE_DIR / "data" / "processed" / "fer_emotions.csv"
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)

# Create logs directory for TensorBoard
log_dir = BASE_DIR / "logs" / datetime.now().strftime("%Y%m%d-%H%M%S")
log_dir.mkdir(parents=True, exist_ok=True)

# 1. Prepare Data
print("📊 Loading and preparing data...")
df = pd.read_csv(FER_CSV)
train_df = df[df['split'] == 'train']
val_df = df[df['split'] == 'test']

# Calculate class weights
class_weights = compute_class_weight('balanced',
                                   classes=np.unique(train_df['emotion']),
                                   y=train_df['emotion'])
class_weight_dict = dict(enumerate(class_weights))

# 2. GPU-optimized Data Pipeline
print("🔄 Creating GPU-optimized data pipelines...")
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    shear_range=0.1,
    zoom_range=0.1,
    horizontal_flip=True,
    fill_mode='nearest'
)

val_datagen = ImageDataGenerator(rescale=1./255)

# Increased batch size for GPU
batch_size = 256 if gpus else 64  

train_generator = train_datagen.flow_from_dataframe(
    dataframe=train_df,
    x_col="image_path",
    y_col="emotion",
    target_size=(48, 48),
    color_mode="grayscale",
    class_mode="categorical",
    batch_size=batch_size,
    shuffle=True
)

val_generator = val_datagen.flow_from_dataframe(
    dataframe=val_df,
    x_col="image_path",
    y_col="emotion",
    target_size=(48, 48),
    color_mode="grayscale",
    class_mode="categorical",
    batch_size=batch_size,
    shuffle=False
)

# 3. GPU-optimized Model
print("🧠 Building GPU-optimized CNN model...")
with tf.device('/GPU:0' if gpus else '/CPU:0'):
    model = models.Sequential([
        layers.Conv2D(64, (3,3), activation='relu', 
                     input_shape=(48,48,1)),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2,2)),
        layers.Dropout(0.25),
        
        layers.Conv2D(128, (3,3), activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2,2)),
        layers.Dropout(0.35),
        
        layers.Conv2D(256, (3,3), activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2,2)),
        layers.Dropout(0.4),
        
        layers.Flatten(),
        layers.Dense(256, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(7, activation='softmax')
    ])

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

# 4. Enhanced Callbacks for GPU
callbacks = [
    EarlyStopping(monitor='val_accuracy', patience=15, verbose=1, restore_best_weights=True),
    ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=5, min_lr=1e-6, verbose=1),
    ModelCheckpoint(
        filepath=MODEL_DIR / "emotion_cnn_best.h5",
        monitor='val_accuracy',
        save_best_only=True,
        mode='max',
        verbose=1
    ),
    TensorBoard(log_dir=log_dir, histogram_freq=1)
]

# 5. Train with GPU acceleration
print("🚀 Starting GPU-accelerated training...")
history = model.fit(
    train_generator,
    steps_per_epoch=len(train_generator),
    validation_data=val_generator,
    validation_steps=len(val_generator),
    epochs=100,
    callbacks=callbacks,
    class_weight=class_weight_dict,
    verbose=1
)

# 6. Save and visualize
model.save(MODEL_DIR / "emotion_cnn_final.h5")
print(f"\n✅ Best model saved to: {MODEL_DIR/'emotion_cnn_best.h5'}")
print(f"✅ Final model saved to: {MODEL_DIR/'emotion_cnn_final.h5'}")

# Plot training history
plt.figure(figsize=(12, 5))
plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'], label='Train')
plt.plot(history.history['val_accuracy'], label='Validation')
plt.title('Model Accuracy')
plt.ylabel('Accuracy')
plt.xlabel('Epoch')
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='Train')
plt.plot(history.history['val_loss'], label='Validation')
plt.title('Model Loss')
plt.ylabel('Loss')
plt.xlabel('Epoch')
plt.legend()

plt.savefig(MODEL_DIR / 'training_metrics.png')
plt.close()
print(f"✅ Training metrics saved to: {MODEL_DIR/'training_metrics.png'}")
print(f"✅ TensorBoard logs: tensorboard --logdir={log_dir}")