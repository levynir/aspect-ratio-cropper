import React from 'react';
import { cropImage } from '../utils/cropUtils';
import { calculateAspectRatio } from '../utils/imageUtils';

const DownloadButton = ({ imageData, cropArea, originalFileName, selectedRatio, disabled }) => {
  const getOutputFormat = (originalFileName) => {
    if (!originalFileName) return { format: 'image/webp', extension: 'webp' };
    
    const extension = originalFileName.split('.').pop().toLowerCase();
    
    // Keep original format if it's PNG or WebP
    if (extension === 'png') {
      return { format: 'image/png', extension: 'png' };
    } else if (extension === 'webp') {
      return { format: 'image/webp', extension: 'webp' };
    }
    
    // Convert everything else to WebP
    return { format: 'image/webp', extension: 'webp' };
  };

  const generateFileName = (originalFileName, selectedRatio, cropArea) => {
    const baseName = originalFileName ? originalFileName.replace(/\.[^/.]+$/, '') : 'cropped-image';
    
    let aspectRatioSuffix = '';
    if (selectedRatio) {
      aspectRatioSuffix = `_${selectedRatio.width}x${selectedRatio.height}`;
    } else if (cropArea) {
      // Calculate aspect ratio from crop area
      const ratio = calculateAspectRatio(Math.round(cropArea.width), Math.round(cropArea.height));
      aspectRatioSuffix = `_${ratio.width}x${ratio.height}`;
    }
    
    const { extension } = getOutputFormat(originalFileName);
    return `${baseName}${aspectRatioSuffix}.${extension}`;
  };

  const handleCropAndDownload = async () => {
    if (!imageData || !cropArea) return;

    try {
      const { format } = getOutputFormat(originalFileName);
      const quality = format === 'image/png' ? undefined : 0.9;
      
      const croppedBlob = await cropImage(imageData.image, cropArea, imageData.dimensions, format, quality);
      
      // Create download link
      const url = URL.createObjectURL(croppedBlob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with aspect ratio
      link.download = generateFileName(originalFileName, selectedRatio, cropArea);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Error cropping image. Please try again.');
    }
  };

  const handleCrop = async () => {
    if (!imageData || !cropArea) return null;

    try {
      const croppedBlob = await cropImage(imageData.image, cropArea, imageData.dimensions);
      return croppedBlob;
    } catch (error) {
      console.error('Error cropping image:', error);
      return null;
    }
  };

  return (
    <div className="download-section">
      <h3>Export Image</h3>
      <button 
        className="crop-button"
        onClick={handleCropAndDownload}
        disabled={disabled}
      >
        {disabled ? 'Select Area to Crop' : 'Crop & Download'}
      </button>
    </div>
  );
};

export default DownloadButton;