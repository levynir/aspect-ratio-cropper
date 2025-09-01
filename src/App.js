import React, { useState, useEffect } from 'react';
import ImageUpload from './components/ImageUpload';
import ImagePreview from './components/ImagePreview';
import AspectRatioSelector from './components/AspectRatioSelector';
import DownloadButton from './components/DownloadButton';
import { loadImageFromFile } from './utils/imageUtils';
import { calculateInitialCropArea } from './utils/cropUtils';

function App() {
  const [imageData, setImageData] = useState(null);
  const [selectedRatio, setSelectedRatio] = useState(null);
  const [cropArea, setCropArea] = useState(null);
  const [originalFileName, setOriginalFileName] = useState('');

  // Handle image selection
  const handleImageSelect = async (file) => {
    try {
      const data = await loadImageFromFile(file);
      setImageData(data);
      setOriginalFileName(file.name);
      setSelectedRatio(null);
      setCropArea(null);
    } catch (error) {
      console.error('Error loading image:', error);
      alert('Error loading image. Please try a different file.');
    }
  };

  // Handle aspect ratio change
  const handleRatioChange = (ratio) => {
    setSelectedRatio(ratio);
    
    if (ratio && imageData) {
      // Calculate initial crop area for the new ratio
      const initialCropArea = calculateInitialCropArea(
        imageData.dimensions.width,
        imageData.dimensions.height,
        ratio
      );
      setCropArea(initialCropArea);
    } else {
      setCropArea(null);
    }
  };

  // Handle crop area change
  const handleCropAreaChange = (newCropArea) => {
    setCropArea(newCropArea);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Image Cropper</h1>
        <p>Upload an image, select an aspect ratio, and crop it to your desired size.</p>
      </header>

      <main className="app-main">
        <div className="upload-section">
          <ImageUpload onImageSelect={handleImageSelect} />
        </div>

        {imageData && (
          <>
            <ImagePreview
              imageData={imageData}
              cropArea={cropArea}
              onCropAreaChange={handleCropAreaChange}
              selectedRatio={selectedRatio}
            />

            <div className="controls-section">
              <AspectRatioSelector
                currentImageRatio={imageData.dimensions}
                selectedRatio={selectedRatio}
                onRatioChange={handleRatioChange}
              />

              <DownloadButton
                imageData={imageData}
                cropArea={cropArea}
                originalFileName={originalFileName}
                selectedRatio={selectedRatio}
                disabled={!cropArea}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;