// Calculate greatest common divisor
export const gcd = (a, b) => {
  return b === 0 ? a : gcd(b, a % b);
};

// Calculate aspect ratio from dimensions
export const calculateAspectRatio = (width, height) => {
  const divisor = gcd(width, height);
  return {
    width: width / divisor,
    height: height / divisor,
    decimal: width / height
  };
};

// Format aspect ratio for display
export const formatAspectRatio = (width, height) => {
  const ratio = calculateAspectRatio(width, height);
  return `${ratio.width}:${ratio.height}`;
};

// Load image from file and get dimensions
export const loadImageFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const dimensions = {
        width: img.naturalWidth,
        height: img.naturalHeight
      };
      resolve({
        image: img,
        dimensions,
        aspectRatio: calculateAspectRatio(dimensions.width, dimensions.height),
        url
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

// Calculate preview dimensions that fit within container
export const calculatePreviewDimensions = (imageWidth, imageHeight, maxWidth, maxHeight) => {
  const imageAspect = imageWidth / imageHeight;
  const containerAspect = maxWidth / maxHeight;
  
  let previewWidth, previewHeight;
  
  if (imageAspect > containerAspect) {
    // Image is wider than container
    previewWidth = maxWidth;
    previewHeight = maxWidth / imageAspect;
  } else {
    // Image is taller than container
    previewHeight = maxHeight;
    previewWidth = maxHeight * imageAspect;
  }
  
  return {
    width: previewWidth,
    height: previewHeight,
    scale: previewWidth / imageWidth
  };
};