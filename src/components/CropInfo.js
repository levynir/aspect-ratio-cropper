import React from 'react';
import { calculateAspectRatio, formatAspectRatio } from '../utils/imageUtils';

const CropInfo = ({ cropArea, selectedRatio }) => {
  if (!cropArea) return null;

  const cropWidth = Math.round(cropArea.width);
  const cropHeight = Math.round(cropArea.height);
  const cropAspectRatio = calculateAspectRatio(cropWidth, cropHeight);

  return (
    <div className="crop-info">
      <h4>Crop Preview</h4>
      <div className="crop-info-content">
        <div className="crop-info-item">
          <span className="crop-info-label">Size:</span>
          <span className="crop-info-value">{cropWidth} × {cropHeight} pixels</span>
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
            <span className="crop-info-value">{formatAspectRatio(cropWidth, cropHeight)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropInfo;