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

  const handleSelectChange = (event) => {
    const value = event.target.value;
    
    if (value === 'original') {
      onRatioChange(null);
    } else {
      const ratioIndex = parseInt(value);
      onRatioChange(predefinedRatios[ratioIndex]);
    }
  };

  const getSelectedValue = () => {
    if (!selectedRatio) return 'original';
    
    const index = predefinedRatios.findIndex(
      ratio => ratio.width === selectedRatio.width && ratio.height === selectedRatio.height
    );
    
    return index !== -1 ? index.toString() : 'original';
  };

  const getDisplayText = (ratio) => {
    return `${ratio.name} (${ratio.width}:${ratio.height})`;
  };

  return (
    <div className="aspect-ratio-selector">
      <h3>Select Aspect Ratio</h3>
      
      <div className="dropdown-container">
        <select 
          className="aspect-ratio-dropdown"
          value={getSelectedValue()}
          onChange={handleSelectChange}
        >
          {currentImageRatio && (
            <option value="original">
              Original ({formatAspectRatio(currentImageRatio.width, currentImageRatio.height)})
            </option>
          )}
          
          {predefinedRatios.map((ratio, index) => (
            <option key={index} value={index.toString()}>
              {getDisplayText(ratio)}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="dropdown-arrow">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default AspectRatioSelector;