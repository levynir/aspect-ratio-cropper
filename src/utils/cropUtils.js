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

// Constrain crop area to image bounds while maintaining exact aspect ratio
export const constrainCropArea = (cropArea, imageWidth, imageHeight, aspectRatio) => {
  const targetAspect = aspectRatio.width / aspectRatio.height;
  
  let { x, y, width, height } = cropArea;
  
  // Ensure minimum size based on aspect ratio
  const minSize = 50;
  const minWidth = minSize;
  const minHeight = minSize / targetAspect;
  
  // Always maintain exact aspect ratio - never allow deviation
  // Choose the dimension that gives us the larger area while maintaining ratio
  const widthBasedHeight = width / targetAspect;
  const heightBasedWidth = height * targetAspect;
  
  if (widthBasedHeight <= height) {
    // Use width as the controlling dimension
    height = widthBasedHeight;
  } else {
    // Use height as the controlling dimension
    width = heightBasedWidth;
  }
  
  // Apply minimum size constraints while maintaining exact ratio
  if (width < minWidth) {
    width = minWidth;
    height = width / targetAspect;
  }
  if (height < minHeight) {
    height = minHeight;
    width = height * targetAspect;
  }
  
  // Constrain to image bounds - adjust both dimensions proportionally if needed
  let scale = 1;
  
  // Check if we exceed bounds and calculate the required scale factor
  if (x + width > imageWidth) {
    const maxWidth = imageWidth - x;
    scale = Math.min(scale, maxWidth / width);
  }
  if (y + height > imageHeight) {
    const maxHeight = imageHeight - y;
    scale = Math.min(scale, maxHeight / height);
  }
  
  // Apply scaling to maintain exact ratio
  if (scale < 1) {
    width *= scale;
    height *= scale;
  }
  
  // Handle negative positions by adjusting position and size
  if (x < 0) {
    const availableWidth = Math.min(imageWidth, width + x);
    x = 0;
    width = availableWidth;
    height = width / targetAspect;
    
    // Ensure we don't exceed image height
    if (y + height > imageHeight) {
      height = imageHeight - y;
      width = height * targetAspect;
    }
  }
  
  if (y < 0) {
    const availableHeight = Math.min(imageHeight, height + y);
    y = 0;
    height = availableHeight;
    width = height * targetAspect;
    
    // Ensure we don't exceed image width
    if (x + width > imageWidth) {
      width = imageWidth - x;
      height = width / targetAspect;
    }
  }
  
  // Final bounds check - if we still exceed, scale down proportionally
  if (x + width > imageWidth || y + height > imageHeight) {
    const widthScale = imageWidth / (x + width);
    const heightScale = imageHeight / (y + height);
    const finalScale = Math.min(widthScale, heightScale);
    
    if (finalScale < 1) {
      width *= finalScale;
      height *= finalScale;
    }
  }
  
  return { 
    x: Math.max(0, x), 
    y: Math.max(0, y), 
    width: Math.round(width), 
    height: Math.round(height) 
  };
};

// Calculate exact resize maintaining perfect aspect ratio
export const calculateExactResize = (handle, initialCrop, deltaX, deltaY, aspectRatio) => {
  const targetAspect = aspectRatio.width / aspectRatio.height;
  let newCrop = { ...initialCrop };
  
  // Calculate the combined movement magnitude and use it as the controlling factor
  // Use larger step size for more predictable behavior
  const stepMultiplier = 2; // Make resize more responsive
  const totalDelta = Math.sqrt(deltaX * deltaX + deltaY * deltaY) * stepMultiplier;
  
  // Determine if we're making the crop larger or smaller based on handle direction
  let scaleFactor = 1;
  
  switch (handle) {
    case 'se': // Bottom-right: positive movement = larger
      scaleFactor = deltaX > 0 || deltaY > 0 ? 1 : -1;
      break;
    case 'sw': // Bottom-left: left/down movement = larger  
      scaleFactor = deltaX < 0 || deltaY > 0 ? 1 : -1;
      break;
    case 'ne': // Top-right: right/up movement = larger
      scaleFactor = deltaX > 0 || deltaY < 0 ? 1 : -1;
      break;
    case 'nw': // Top-left: left/up movement = larger
      scaleFactor = deltaX < 0 || deltaY < 0 ? 1 : -1;
      break;
  }
  
  // Apply the size change
  const sizeChange = totalDelta * scaleFactor;
  newCrop.width = Math.max(50, initialCrop.width + sizeChange); // Larger minimum size
  newCrop.height = newCrop.width / targetAspect; // Always maintain exact ratio
  
  // Adjust position based on handle
  switch (handle) {
    case 'se': // Bottom-right: no position change
      break;
    case 'sw': // Bottom-left: adjust X to keep right edge fixed
      newCrop.x = initialCrop.x + initialCrop.width - newCrop.width;
      break;
    case 'ne': // Top-right: adjust Y to keep bottom edge fixed
      newCrop.y = initialCrop.y + initialCrop.height - newCrop.height;
      break;
    case 'nw': // Top-left: adjust both to keep bottom-right fixed
      newCrop.x = initialCrop.x + initialCrop.width - newCrop.width;
      newCrop.y = initialCrop.y + initialCrop.height - newCrop.height;
      break;
  }
  
  return newCrop;
};