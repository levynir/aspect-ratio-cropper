import React, { useState } from 'react';
import { calculateAspectRatio, formatAspectRatio } from '../utils/imageUtils';

const CropInfo = ({ cropArea, selectedRatio, onCropAreaChange, imageDimensions }) => {
  const [editingField, setEditingField] = useState(null); // 'width', 'height', or null
  const [inputValue, setInputValue] = useState('');

  if (!cropArea) return null;

  const cropWidth = Math.round(cropArea.width);
  const cropHeight = Math.round(cropArea.height);
  const cropAspectRatio = calculateAspectRatio(cropWidth, cropHeight);

  const handleFieldClick = (field) => {
    setEditingField(field);
    setInputValue(field === 'width' ? cropWidth.toString() : cropHeight.toString());
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const newValue = parseInt(inputValue);
    if (isNaN(newValue) || newValue <= 0) {
      setEditingField(null);
      return;
    }

    // Calculate new crop area based on the edited dimension
    let newWidth, newHeight;
    
    if (editingField === 'width') {
      newWidth = newValue;
      newHeight = selectedRatio ? newValue / (selectedRatio.width / selectedRatio.height) : cropArea.height;
    } else {
      newHeight = newValue;
      newWidth = selectedRatio ? newValue * (selectedRatio.width / selectedRatio.height) : cropArea.width;
    }

    // Ensure the new crop area fits within image bounds
    const maxWidth = imageDimensions.width - cropArea.x;
    const maxHeight = imageDimensions.height - cropArea.y;
    
    if (newWidth > maxWidth || newHeight > maxHeight) {
      // Scale down proportionally to fit
      const scaleWidth = maxWidth / newWidth;
      const scaleHeight = maxHeight / newHeight;
      const scale = Math.min(scaleWidth, scaleHeight);
      
      newWidth *= scale;
      newHeight *= scale;
    }

    // Center the crop area if possible
    const centerX = Math.max(0, Math.min(
      imageDimensions.width - newWidth, 
      cropArea.x + (cropArea.width - newWidth) / 2
    ));
    const centerY = Math.max(0, Math.min(
      imageDimensions.height - newHeight, 
      cropArea.y + (cropArea.height - newHeight) / 2
    ));

    const newCropArea = {
      x: centerX,
      y: centerY,
      width: newWidth,
      height: newHeight
    };

    onCropAreaChange(newCropArea);
    setEditingField(null);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setEditingField(null);
    }
  };

  return (
    <div className="crop-info">
      <h4>Crop Preview</h4>
      <div className="crop-info-content">
        <div className="crop-info-item">
          <span className="crop-info-label">Size:</span>
          <span className="crop-info-value">
            {editingField === 'width' ? (
              <input
                type="number"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                className="crop-size-input"
                autoFocus
              />
            ) : (
              <span 
                className="crop-size-editable" 
                onClick={() => handleFieldClick('width')}
                title="Click to edit width"
              >
                {cropWidth}
              </span>
            )}
            {' × '}
            {editingField === 'height' ? (
              <input
                type="number"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                className="crop-size-input"
                autoFocus
              />
            ) : (
              <span 
                className="crop-size-editable" 
                onClick={() => handleFieldClick('height')}
                title="Click to edit height"
              >
                {cropHeight}
              </span>
            )}
            {' pixels'}
          </span>
        </div>
        <div className="crop-info-item">
          <span className="crop-info-label">Aspect Ratio:</span>
          <span className="crop-info-value">
            {selectedRatio ? (
              `${selectedRatio.name} (${selectedRatio.width}:${selectedRatio.height})`
            ) : (
              formatAspectRatio(cropWidth, cropHeight)
            )}
          </span>
        </div>
        {selectedRatio && (
          <div className="crop-info-item">
            <span className="crop-info-label">Calculated:</span>
            <span className="crop-info-value">
              {formatAspectRatio(cropWidth, cropHeight)}
              {/* Show precision indicator */}
              {cropAspectRatio.width === selectedRatio.width && 
               cropAspectRatio.height === selectedRatio.height && (
                <span className="crop-info-exact"> ✓</span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropInfo;