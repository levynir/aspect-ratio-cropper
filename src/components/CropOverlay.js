import React, { useState, useRef, useEffect } from 'react';
import { constrainCropArea, calculateExactResize } from '../utils/cropUtils';

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

  // Get coordinates from mouse or touch event
  const getEventCoordinates = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  };

  const handleStart = (e, handle = null) => {
    e.preventDefault();
    e.stopPropagation();
    
    const containerRect = overlayRef.current.parentElement.getBoundingClientRect();
    const coords = getEventCoordinates(e);
    const startX = coords.clientX;
    const startY = coords.clientY;

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

  // Keep old name for compatibility
  const handleMouseDown = handleStart;

  const handleMove = (e) => {
    if (!isDragging && !isResizing) return;
    if (!initialState.mouseX) return;

    const coords = getEventCoordinates(e);
    const deltaX = coords.clientX - initialState.mouseX;
    const deltaY = coords.clientY - initialState.mouseY;

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
    } else if (isResizing && aspectRatio) {
      // Use exact resize calculation for aspect ratio locked resizing
      const initialImageArea = previewToImage({
        x: initialState.cropX,
        y: initialState.cropY,
        width: initialState.cropWidth,
        height: initialState.cropHeight
      });
      
      // Convert deltas to image space
      const imageDeltaX = deltaX / scale;
      const imageDeltaY = deltaY / scale;
      
      // Calculate exact resize in image coordinates
      const newImageArea = calculateExactResize(
        resizeHandle,
        initialImageArea,
        imageDeltaX,
        imageDeltaY,
        aspectRatio
      );
      
      // Convert back to preview coordinates
      newPreviewArea = imageToPreview(newImageArea);
      
      // Ensure we don't exceed preview bounds
      if (newPreviewArea.x < 0 || newPreviewArea.y < 0 || 
          newPreviewArea.x + newPreviewArea.width > previewDimensions.width ||
          newPreviewArea.y + newPreviewArea.height > previewDimensions.height) {
        // If we exceed bounds, use the constrained version
        const constrainedImageArea = constrainCropArea(
          newImageArea,
          imageDimensions.width,
          imageDimensions.height,
          aspectRatio
        );
        newPreviewArea = imageToPreview(constrainedImageArea);
      }
    } else if (isResizing) {
      // Free resize (no aspect ratio selected) - use old logic
      const minSize = 20;
      
      switch (resizeHandle) {
        case 'nw':
          newPreviewArea.width = Math.max(minSize, initialState.cropWidth - deltaX);
          newPreviewArea.height = Math.max(minSize, initialState.cropHeight - deltaY);
          newPreviewArea.x = initialState.cropX + initialState.cropWidth - newPreviewArea.width;
          newPreviewArea.y = initialState.cropY + initialState.cropHeight - newPreviewArea.height;
          break;
        case 'ne':
          newPreviewArea.width = Math.max(minSize, initialState.cropWidth + deltaX);
          newPreviewArea.height = Math.max(minSize, initialState.cropHeight - deltaY);
          newPreviewArea.x = initialState.cropX;
          newPreviewArea.y = initialState.cropY + initialState.cropHeight - newPreviewArea.height;
          break;
        case 'sw':
          newPreviewArea.width = Math.max(minSize, initialState.cropWidth - deltaX);
          newPreviewArea.height = Math.max(minSize, initialState.cropHeight + deltaY);
          newPreviewArea.x = initialState.cropX + initialState.cropWidth - newPreviewArea.width;
          newPreviewArea.y = initialState.cropY;
          break;
        case 'se':
          newPreviewArea.width = Math.max(minSize, initialState.cropWidth + deltaX);
          newPreviewArea.height = Math.max(minSize, initialState.cropHeight + deltaY);
          newPreviewArea.x = initialState.cropX;
          newPreviewArea.y = initialState.cropY;
          break;
      }
      
      // Basic bounds checking for free resize
      newPreviewArea.x = Math.max(0, newPreviewArea.x);
      newPreviewArea.y = Math.max(0, newPreviewArea.y);
      newPreviewArea.width = Math.min(newPreviewArea.width, previewDimensions.width - newPreviewArea.x);
      newPreviewArea.height = Math.min(newPreviewArea.height, previewDimensions.height - newPreviewArea.y);
    }

    // Convert back to image coordinates and apply final constraints
    const newImageArea = previewToImage(newPreviewArea);
    
    // For aspect ratio resizing, we already handled constraints above
    // For dragging or free resize, apply constraints
    let finalImageArea;
    if (isDragging && aspectRatio) {
      finalImageArea = constrainCropArea(newImageArea, imageDimensions.width, imageDimensions.height, aspectRatio);
    } else if (isResizing && aspectRatio) {
      // Already constrained in the resize logic above
      finalImageArea = newImageArea;
    } else {
      // Free resize or no aspect ratio
      finalImageArea = newImageArea;
    }

    onCropAreaChange(finalImageArea);
  };

  const handleEnd = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setInitialState({});
  };

  // Keep old names for compatibility
  const handleMouseMove = handleMove;
  const handleMouseUp = handleEnd;

  useEffect(() => {
    if (isDragging || isResizing) {
      // Add both mouse and touch event listeners
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
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
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    >
      <div className="crop-overlay-inner" />
      
      {/* Resize handles */}
      <div
        className="resize-handle nw"
        onMouseDown={(e) => handleStart(e, 'nw')}
        onTouchStart={(e) => handleStart(e, 'nw')}
      />
      <div
        className="resize-handle ne"
        onMouseDown={(e) => handleStart(e, 'ne')}
        onTouchStart={(e) => handleStart(e, 'ne')}
      />
      <div
        className="resize-handle sw"
        onMouseDown={(e) => handleStart(e, 'sw')}
        onTouchStart={(e) => handleStart(e, 'sw')}
      />
      <div
        className="resize-handle se"
        onMouseDown={(e) => handleStart(e, 'se')}
        onTouchStart={(e) => handleStart(e, 'se')}
      />
    </div>
  );
};

export default CropOverlay;