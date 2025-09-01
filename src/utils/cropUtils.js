// Crop image using canvas at full resolution
export const cropImage = (image, cropArea, originalDimensions, format = 'image/jpeg', quality = 0.9) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to crop dimensions
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;
    
    // Draw the cropped portion of the image
    ctx.drawImage(
      image,
      cropArea.x, // source x
      cropArea.y, // source y
      cropArea.width, // source width
      cropArea.height, // source height
      0, // destination x
      0, // destination y
      cropArea.width, // destination width
      cropArea.height // destination height
    );
    
    // Convert canvas to blob with specified format
    canvas.toBlob((blob) => {
      resolve(blob);
    }, format, quality);
  });
};

// Convert preview coordinates to actual image coordinates
export const previewToImageCoordinates = (previewCoords, scale) => {
  return {
    x: Math.round(previewCoords.x / scale),
    y: Math.round(previewCoords.y / scale),
    width: Math.round(previewCoords.width / scale),
    height: Math.round(previewCoords.height / scale)
  };
};

// Calculate initial crop area for selected aspect ratio
export const calculateInitialCropArea = (imageWidth, imageHeight, aspectRatio) => {
  const imageAspect = imageWidth / imageHeight;
  const targetAspect = aspectRatio.width / aspectRatio.height;
  
  let cropWidth, cropHeight;
  
  if (imageAspect > targetAspect) {
    // Image is wider than target ratio
    cropHeight = imageHeight;
    cropWidth = cropHeight * targetAspect;
  } else {
    // Image is taller than target ratio
    cropWidth = imageWidth;
    cropHeight = cropWidth / targetAspect;
  }
  
  // Center the crop area
  const x = (imageWidth - cropWidth) / 2;
  const y = (imageHeight - cropHeight) / 2;
  
  return {
    x: Math.max(0, x),
    y: Math.max(0, y),
    width: cropWidth,
    height: cropHeight
  };
};

// Constrain crop area to image bounds while maintaining aspect ratio
export const constrainCropArea = (cropArea, imageWidth, imageHeight, aspectRatio) => {
  const targetAspect = aspectRatio.width / aspectRatio.height;
  
  let { x, y, width, height } = cropArea;
  
  // Ensure minimum size
  const minSize = 50;
  width = Math.max(width, minSize);
  height = Math.max(height, minSize);
  
  // Maintain aspect ratio
  const currentAspect = width / height;
  if (Math.abs(currentAspect - targetAspect) > 0.01) {
    if (currentAspect > targetAspect) {
      width = height * targetAspect;
    } else {
      height = width / targetAspect;
    }
  }
  
  // Constrain to image bounds
  if (x + width > imageWidth) {
    x = imageWidth - width;
  }
  if (y + height > imageHeight) {
    y = imageHeight - height;
  }
  if (x < 0) {
    x = 0;
    width = Math.min(width, imageWidth);
    height = width / targetAspect;
  }
  if (y < 0) {
    y = 0;
    height = Math.min(height, imageHeight);
    width = height * targetAspect;
  }
  
  return { x, y, width, height };
};