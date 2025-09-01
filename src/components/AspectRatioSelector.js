import React from 'react';
import { formatAspectRatio } from '../utils/imageUtils';

const AspectRatioSelector = ({ currentImageRatio, selectedRatio, onRatioChange }) => {
  const predefinedRatios = [
    { width: 1, height: 1, name: 'Square' },
    { width: 4, height: 3, name: 'Standard' },
    { width: 3, height: 4, name: 'Portrait' },
    { width: 16, height: 9, name: 'Widescreen' },
    { width: 9, height: 16, name: 'Vertical Video' },
    { width: 4, height: 5, name: 'Instagram Post' },
    { width: 5, height: 4, name: 'Medium Format' },
    { width: 3, height: 2, name: 'Photo' },
    { width: 2, height: 3, name: 'Portrait Photo' },
    { width: 16, height: 10, name: '16:10 Monitor' },
    { width: 21, height: 9, name: 'Ultrawide' },
    { width: 32, height: 9, name: 'Super Ultrawide' },
    { width: 8, height: 10, name: 'Print 8x10' },
    { width: 11, height: 14, name: 'Print 11x14' },
    { width: 8, height: 11, name: 'Letter' },
    { width: 297, height: 210, name: 'A4 Landscape' },
    { width: 210, height: 297, name: 'A4 Portrait' }
  ];

  const handleRatioSelect = (ratio) => {
    onRatioChange(ratio);
  };

  return (
    <div className="aspect-ratio-selector">
      <h3>Select Aspect Ratio</h3>
      
      {currentImageRatio && (
        <div className="current-ratio">
          <button
            className={`ratio-button ${!selectedRatio ? 'active' : ''}`}
            onClick={() => onRatioChange(null)}
          >
            Original ({formatAspectRatio(currentImageRatio.width, currentImageRatio.height)})
          </button>
        </div>
      )}
      
      <div className="predefined-ratios">
        {predefinedRatios.map((ratio, index) => (
          <button
            key={index}
            className={`ratio-button ${
              selectedRatio && 
              selectedRatio.width === ratio.width && 
              selectedRatio.height === ratio.height ? 'active' : ''
            }`}
            onClick={() => handleRatioSelect(ratio)}
          >
            {ratio.name} ({ratio.width}:{ratio.height})
          </button>
        ))}
      </div>
    </div>
  );
};

export default AspectRatioSelector;