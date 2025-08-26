# src/train_combined_model.py
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.regularizers import l2
import pandas as pd
from pathlib import Path
import matplotlib.pyplot as plt
import numpy as np
import os
import sys
import traceback

BASE_DIR = Path("C:/Users/MOHAMED AMINE/Desktop/Friendly_IA")
COMBINED_CSV = BASE_DIR / "data/processed/combined_dataset.csv"

def setup_gpu():
    """Configure GPU settings with error handling"""
    try:
        gpus = tf.config.list_physical_devices('GPU')
        if gpus:
            tf.config.set_visible_devices(gpus[0], 'GPU')
            tf.config.experimental.set_memory_growth(gpus[0], True)
            print(f"✅ GPU configured: {gpus[0]}")
    except Exception as e:
        print(f"⚠️ GPU configuration error: {e}")

def load_data():
    """Load and augment data with error handling"""
    try:
        df = pd.read_csv(COMBINED_CSV)
        train_df = df[df['split'] == 'train']
        val_df = df[df['split'] == 'test']
        
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            rotation_range=20,
            width_shift_range=0.15,
            height_shift_range=0.15,
            shear_range=0.15,
            zoom_range=0.15,
            horizontal_flip=True,
            fill_mode='nearest'
        )
        
        val_datagen = ImageDataGenerator(rescale=1./255)
        
        train_generator = train_datagen.flow_from_dataframe(
            dataframe=train_df,
            x_col="image_path",
            y_col="emotion",
            target_size=(48, 48),
            color_mode="grayscale",
            class_mode="categorical",
            batch_size=128,
            shuffle=True
        )
        
        val_generator = val_datagen.flow_from_dataframe(
            dataframe=val_df,
            x_col="image_path",
            y_col="emotion",
            target_size=(48, 48),
            color_mode="grayscale",
            class_mode="categorical",
            batch_size=128
        )
        
        return train_generator, val_generator
        
    except Exception as e:
        print(f"🔥 Data loading error: {e}")
        traceback.print_exc()
        sys.exit(1)

def build_dynamic_model():
    """Model with dynamic learning rate and proper initialization"""
    try:
        model = models.Sequential([
            layers.Conv2D(64, (3,3), activation='relu', padding='same', 
                         input_shape=(48,48,1), kernel_initializer='he_normal',
                         kernel_regularizer=l2(0.001)),
            layers.BatchNormalization(),
            layers.Conv2D(64, (3,3), activation='relu', padding='same',
                         kernel_initializer='he_normal'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2,2)),
            layers.Dropout(0.25),
            
            layers.Conv2D(128, (3,3), activation='relu', padding='same',
                         kernel_initializer='he_normal'),
            layers.BatchNormalization(),
            layers.Conv2D(128, (3,3), activation='relu', padding='same',
                         kernel_initializer='he_normal'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2,2)),
            layers.Dropout(0.35),
            
            layers.Conv2D(256, (3,3), activation='relu', padding='same',
                         kernel_initializer='he_normal'),
            layers.BatchNormalization(),
            layers.Conv2D(256, (3,3), activation='relu', padding='same',
                         kernel_initializer='he_normal'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2,2)),
            layers.Dropout(0.4),
            
            layers.Flatten(),
            layers.Dense(512, activation='relu', kernel_initializer='he_normal',
                        kernel_regularizer=l2(0.001)),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            layers.Dense(7, activation='softmax')
        ])
        
        # Dynamic learning rate with warmup
        lr_schedule = tf.keras.optimizers.schedules.CosineDecayRestarts(
            initial_learning_rate=1e-3,
            first_decay_steps=1000,
            t_mul=2.0,
            m_mul=0.9,
            alpha=1e-6
        )
        
        optimizer = Adam(learning_rate=lr_schedule)
        
        model.compile(
            optimizer=optimizer,
            loss='categorical_crossentropy',
            metrics=['accuracy', 
                   tf.keras.metrics.Precision(name='precision'),
                   tf.keras.metrics.Recall(name='recall')]
        )
        return model
        
    except Exception as e:
        print(f"🔥 Model building error: {e}")
        traceback.print_exc()
        sys.exit(1)

def train_model():
    """Main training function with robust error handling"""
    try:
        setup_gpu()
        
        # Create directories
        os.makedirs(BASE_DIR / "models", exist_ok=True)
        os.makedirs(BASE_DIR / "logs/combined_model", exist_ok=True)
        
        train_gen, val_gen = load_data()
        model = build_dynamic_model()
        
        # Enhanced callbacks
        callbacks_list = [
            callbacks.ModelCheckpoint(
                str(BASE_DIR / "models/emotion_cnn_combined.keras"),
                monitor='val_accuracy',
                save_best_only=True,
                mode='max',
                save_weights_only=False
            ),
            callbacks.EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True,
                verbose=1
            ),
            callbacks.TensorBoard(
                log_dir=str(BASE_DIR / "logs/combined_model"),
                histogram_freq=1,
                update_freq='epoch'
            ),
            callbacks.TerminateOnNaN(),
            callbacks.BackupAndRestore(BASE_DIR / "models/backup")
        ]
        
        # Class weights for imbalanced data
        class_counts = np.bincount(train_gen.classes)
        total_samples = np.sum(class_counts)
        class_weights = {i: total_samples/(len(class_counts)*count) 
                        for i, count in enumerate(class_counts)}
        
        print("\n⚡ Starting training with dynamic learning rate...")
        print(f"  - Training samples: {train_gen.samples}")
        print(f"  - Validation samples: {val_gen.samples}")
        print(f"  - Class weights: {class_weights}")
        
        history = model.fit(
            train_gen,
            steps_per_epoch=len(train_gen),
            validation_data=val_gen,
            validation_steps=len(val_gen),
            epochs=30,
            callbacks=callbacks_list,
            class_weight=class_weights,
            verbose=1
        )
        
        # Save training metrics
        save_training_plots(history)
        print("\n✅ Training completed successfully!")
        
    except KeyboardInterrupt:
        print("\n🛑 Training interrupted by user!")
    except Exception as e:
        print(f"\n🔥 Critical training error: {e}")
        traceback.print_exc()
        sys.exit(1)

def save_training_plots(history):
    """Save training metrics visualization"""
    plt.figure(figsize=(18, 6))
    
    # Accuracy plot
    plt.subplot(1, 3, 1)
    plt.plot(history.history['accuracy'], label='Train')
    plt.plot(history.history['val_accuracy'], label='Validation')
    plt.title('Model Accuracy')
    plt.ylabel('Accuracy')
    plt.xlabel('Epoch')
    plt.legend()
    
    # Loss plot
    plt.subplot(1, 3, 2)
    plt.plot(history.history['loss'], label='Train')
    plt.plot(history.history['val_loss'], label='Validation')
    plt.title('Model Loss')
    plt.ylabel('Loss')
    plt.xlabel('Epoch')
    plt.legend()
    
    # Precision-Recall plot
    plt.subplot(1, 3, 3)
    plt.plot(history.history['precision'], label='Precision')
    plt.plot(history.history['recall'], label='Recall')
    plt.title('Precision & Recall')
    plt.ylabel('Score')
    plt.xlabel('Epoch')
    plt.legend()
    
    plt.savefig(
        str(BASE_DIR / "models/training_metrics_combined.png"),
        dpi=300,
        bbox_inches='tight'
    )
    plt.close()

if __name__ == "__main__":
    train_model()