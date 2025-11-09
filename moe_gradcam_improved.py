import torch
import torch.nn.functional as F
import numpy as np
import matplotlib.pyplot as plt

class MoEGradCAM:
    def __init__(self, model):
        self.model = model
        self.gradients = None
        self.target_layer = None

    def save_gradients(self, grad):
        self.gradients = grad

    def get_gradient_flow(self):
        # Function to calculate the gradient flow
        return (self.gradients ** 2).mean().item()

    def forward(self, x):
        # Forward pass
        output = self.model(x)
        return output

    def backward(self, index):
        # Backward pass
        one_hot = torch.zeros(output.shape).to(device)
        one_hot[0][index] = 1
        self.model.zero_grad()
        output.backward(gradient=one_hot)

    def generate_cam(self, feature_map, class_idx):
        # Compute CAM with squared gradients and normalization
        weights = F.adaptive_avg_pool2d(self.gradients, 1)
        cam = F.relu(torch.sum(weights * feature_map, dim=1)).cpu().detach().numpy()
        
        # Normalization
        cam -= np.min(cam)
        cam /= np.max(cam)
        return cam

    def visualize(self, input_image):
        # Visualize the CAM with better contrast
        cam = self.generate_cam(feature_map, class_idx)
        heatmap = plt.imshow(cam, cmap='jet', alpha=0.5)  # Better color contrast
        
        plt.colorbar(heatmap)
        plt.axis('off')
        plt.show()

if __name__ == '__main__':
    # Example usage
    model = ...  # Your model here
    cam = MoEGradCAM(model)
    input_image = ...  # Your input image here
    class_idx = ...  # Target class index here
    feature_map = ...  # Extract the feature map from model
    
    cam.forward(input_image)
    cam.backward(class_idx)
    cam.visualize(input_image)