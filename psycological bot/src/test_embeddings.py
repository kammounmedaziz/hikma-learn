import numpy as np
import torch
from sentence_transformers import SentenceTransformer

print(f"NumPy: {np.__version__}")
print(f"PyTorch CUDA: {torch.cuda.is_available()}")

model = SentenceTransformer("all-MiniLM-L6-v2", device="cuda" if torch.cuda.is_available() else "cpu")

# Test numpy output (for FAISS)
emb_numpy = model.encode(["test"], convert_to_numpy=True)
print(f"Numpy embedding shape: {emb_numpy.shape}")  # (1, 384)

# Handle all possible output types
emb_output = model.encode(["test"], convert_to_numpy=False)

if isinstance(emb_output, torch.Tensor):
    print("Received PyTorch tensor")
    emb_tensor = emb_output
elif isinstance(emb_output, list):
    print("Converting list output")
    if len(emb_output) > 0 and isinstance(emb_output[0], torch.Tensor):
        emb_tensor = torch.stack(emb_output)
    else:
        emb_tensor = torch.tensor(np.array(emb_output))
else:
    raise ValueError(f"Unexpected output type: {type(emb_output)}")

# Ensure tensor is on CPU for numpy conversion
if emb_tensor.is_cuda:
    emb_tensor = emb_tensor.cpu()

print(f"Final tensor shape: {emb_tensor.shape}")
print("Numpy conversion successful:", isinstance(emb_tensor.numpy(), np.ndarray))
print("All tests passed!")