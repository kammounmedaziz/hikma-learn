from datasets import load_from_disk

# Load your dataset
dataset = load_from_disk("C:/Users/MOHAMED AMINE/Desktop/Friendly_IA/data/raw/empathetic_dialogues_llm")

# Inspect the first row of the 'train' split
print("Columns in dataset:", dataset["train"].column_names)
print("First row example:", dataset["train"][0])