import React, { useRef, useEffect } from 'react';
import CropOverlay from './CropOverlay';
import CropInfo from './CropInfo';
import { formatAspectRatio, calculatePreviewDimensions } from '../utils/imageUtils';

const ImagePreview = ({ 
  imageData, 
  cropArea, 
  onCropAreaChange, 
  selectedRatio 
}) => {
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  if (!imageData) return null;

  const containerRect = containerRef.current?.getBoundingClientRect();
  const maxWidth = Math.min(800, window.innerWidth * 0.8);
  const maxHeight = Math.min(600, window.innerHeight * 0.6);

  const previewDimensions = calculatePreviewDimensions(
    imageData.dimensions.width,
    imageData.dimensions.height,
    maxWidth,
    maxHeight
  );

  return (
    <div className="image-preview-section">
      <div className="image-info">
        <h3>Image Information</h3>
        <p>Dimensions: {imageData.dimensions.width} × {imageData.dimensions.height} pixels</p>
        <p>Aspect Ratio: {formatAspectRatio(imageData.dimensions.width, imageData.dimensions.height)}</p>
      </div>

      <div 
        ref={containerRef}
        className="image-preview-container"
        style={{
          width: previewDimensions.width,
          height: previewDimensions.height,
          position: 'relative'
        }}
      >
        <img
          ref={imageRef}
          src={imageData.url}
          alt="Preview"
          className="preview-image"
          style={{
            width: previewDimensions.width,
            height: previewDimensions.height,
            objectFit: 'contain'
          }}
        />
        
        {selectedRatio && cropArea && (
          <CropOverlay
            cropArea={cropArea}
            onCropAreaChange={onCropAreaChange}
            aspectRatio={selectedRatio}
            previewDimensions={previewDimensions}
            imageDimensions={imageData.dimensions}
            scale={previewDimensions.scale}
          />
        )}
      </div>

      {cropArea && (
        <CropInfo 
          cropArea={cropArea} 
          selectedRatio={selectedRatio}
          onCropAreaChange={onCropAreaChange}
          imageDimensions={imageData.dimensions}
        />
      )}
    </div>
  );
};

export default ImagePreview;