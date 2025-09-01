import React, { useState, useRef, useEffect } from 'react';
import { constrainCropArea } from '../utils/cropUtils';

const CropOverlay = ({ 
  cropArea, 
  onCropAreaChange, 
  aspectRatio, 
  previewDimensions,
  imageDimensions,
  scale 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [initialState, setInitialState] = useState({});
  const overlayRef = useRef(null);

  // Convert image coordinates to preview coordinates
  const imageToPreview = (coords) => ({
    x: coords.x * scale,
    y: coords.y * scale,
    width: coords.width * scale,
    height: coords.height * scale
  });

  // Convert preview coordinates to image coordinates
  const previewToImage = (coords) => ({
    x: coords.x / scale,
    y: coords.y / scale,
    width: coords.width / scale,
    height: coords.height / scale
  });

  const previewCropArea = imageToPreview(cropArea);

  const handleMouseDown = (e, handle = null) => {
    e.preventDefault();
    e.stopPropagation();
    
    const containerRect = overlayRef.current.parentElement.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;

    // Store initial state
    setInitialState({
      mouseX: startX,
      mouseY: startY,
      cropX: previewCropArea.x,
      cropY: previewCropArea.y,
      cropWidth: previewCropArea.width,
      cropHeight: previewCropArea.height,
      containerLeft: containerRect.left,
      containerTop: containerRect.top
    });

    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
    } else {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging && !isResizing) return;
    if (!initialState.mouseX) return;

    const deltaX = e.clientX - initialState.mouseX;
    const deltaY = e.clientY - initialState.mouseY;

    let newPreviewArea = { ...previewCropArea };

    if (isDragging) {
      // Simple drag - move the entire rectangle
      newPreviewArea.x = Math.max(0, Math.min(
        previewDimensions.width - previewCropArea.width,
        initialState.cropX + deltaX
      ));
      newPreviewArea.y = Math.max(0, Math.min(
        previewDimensions.height - previewCropArea.height,
        initialState.cropY + deltaY
      ));
    } else if (isResizing) {
      // Handle resizing based on which corner is being dragged
      const minSize = 20;
      
      switch (resizeHandle) {
        case 'nw': // Top-left corner
          newPreviewArea.width = Math.max(minSize, initialState.cropWidth - deltaX);
          newPreviewArea.height = aspectRatio 
            ? newPreviewArea.width / (aspectRatio.width / aspectRatio.height)
            : Math.max(minSize, initialState.cropHeight - deltaY);
          newPreviewArea.x = initialState.cropX + initialState.cropWidth - newPreviewArea.width;
          newPreviewArea.y = initialState.cropY + initialState.cropHeight - newPreviewArea.height;
          break;
          
        case 'ne': // Top-right corner
          newPreviewArea.width = Math.max(minSize, initialState.cropWidth + deltaX);
          newPreviewArea.height = aspectRatio
            ? newPreviewArea.width / (aspectRatio.width / aspectRatio.height)
            : Math.max(minSize, initialState.cropHeight - deltaY);
          newPreviewArea.x = initialState.cropX;
          newPreviewArea.y = initialState.cropY + initialState.cropHeight - newPreviewArea.height;
          break;
          
        case 'sw': // Bottom-left corner
          newPreviewArea.width = Math.max(minSize, initialState.cropWidth - deltaX);
          newPreviewArea.height = aspectRatio
            ? newPreviewArea.width / (aspectRatio.width / aspectRatio.height)
            : Math.max(minSize, initialState.cropHeight + deltaY);
          newPreviewArea.x = initialState.cropX + initialState.cropWidth - newPreviewArea.width;
          newPreviewArea.y = initialState.cropY;
          break;
          
        case 'se': // Bottom-right corner
          newPreviewArea.width = Math.max(minSize, initialState.cropWidth + deltaX);
          newPreviewArea.height = aspectRatio
            ? newPreviewArea.width / (aspectRatio.width / aspectRatio.height)
            : Math.max(minSize, initialState.cropHeight + deltaY);
          newPreviewArea.x = initialState.cropX;
          newPreviewArea.y = initialState.cropY;
          break;
      }

      // Constrain to bounds after resizing
      if (newPreviewArea.x < 0) {
        newPreviewArea.width += newPreviewArea.x;
        newPreviewArea.x = 0;
        if (aspectRatio) {
          newPreviewArea.height = newPreviewArea.width / (aspectRatio.width / aspectRatio.height);
        }
      }
      if (newPreviewArea.y < 0) {
        newPreviewArea.height += newPreviewArea.y;
        newPreviewArea.y = 0;
        if (aspectRatio) {
          newPreviewArea.width = newPreviewArea.height * (aspectRatio.width / aspectRatio.height);
        }
      }
      if (newPreviewArea.x + newPreviewArea.width > previewDimensions.width) {
        newPreviewArea.width = previewDimensions.width - newPreviewArea.x;
        if (aspectRatio) {
          newPreviewArea.height = newPreviewArea.width / (aspectRatio.width / aspectRatio.height);
        }
      }
      if (newPreviewArea.y + newPreviewArea.height > previewDimensions.height) {
        newPreviewArea.height = previewDimensions.height - newPreviewArea.y;
        if (aspectRatio) {
          newPreviewArea.width = newPreviewArea.height * (aspectRatio.width / aspectRatio.height);
        }
      }
      
      // Ensure minimum size after constraints
      if (newPreviewArea.width < minSize || newPreviewArea.height < minSize) {
        return;
      }
    }

    // Convert back to image coordinates
    const newImageArea = previewToImage(newPreviewArea);
    const constrainedImageArea = aspectRatio 
      ? constrainCropArea(newImageArea, imageDimensions.width, imageDimensions.height, aspectRatio)
      : newImageArea;

    onCropAreaChange(constrainedImageArea);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setInitialState({});
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, initialState]);

  return (
    <div
      ref={overlayRef}
      className="crop-overlay"
      style={{
        left: previewCropArea.x,
        top: previewCropArea.y,
        width: previewCropArea.width,
        height: previewCropArea.height
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="crop-overlay-inner" />
      
      {/* Resize handles */}
      <div
        className="resize-handle nw"
        onMouseDown={(e) => handleMouseDown(e, 'nw')}
      />
      <div
        className="resize-handle ne"
        onMouseDown={(e) => handleMouseDown(e, 'ne')}
      />
      <div
        className="resize-handle sw"
        onMouseDown={(e) => handleMouseDown(e, 'sw')}
      />
      <div
        className="resize-handle se"
        onMouseDown={(e) => handleMouseDown(e, 'se')}
      />
    </div>
  );
};

export default CropOverlay;