import torch

print("Is CUDA available?", torch.cuda.is_available())
print("Current CUDA version:", torch.version.cuda)
print("GPU device name:", torch.cuda.get_device_name(0))