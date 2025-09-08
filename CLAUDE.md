# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React-based web application for cropping images with aspect ratio selection. The app allows users to upload images, preview them with metadata, select predefined aspect ratios, and crop images using a resizable overlay system. All processing is done client-side using HTML5 Canvas API.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm start

# Build for production
npm run build

# Run linting
npm run lint

# Run tests
npm test
```

## Architecture

### Component Structure
- **App.js**: Main application component managing global state (image data, crop area, selected ratio)
- **ImageUpload.js**: File upload component with drag-and-drop support
- **ImagePreview.js**: Image display with metadata and crop overlay integration
- **AspectRatioSelector.js**: Predefined ratio selection (1:1, 4:3, 16:9, etc.)
- **CropOverlay.js**: Interactive crop rectangle with drag/resize functionality
- **CropInfo.js**: Displays current crop dimensions and coordinates for debugging/feedback
- **DownloadButton.js**: Crop processing and file download using Canvas API

### Utility Functions
- **imageUtils.js**: Image loading, aspect ratio calculations, preview scaling, GCD calculations
- **cropUtils.js**: Canvas-based cropping, coordinate transformations, area constraints, exact resize calculations

### Key Features
- Client-side only processing (no backend required)
- Preserves original image quality during cropping
- Responsive preview that scales to fit viewport
- Maintains aspect ratios during crop resize operations
- Canvas-based cropping at full resolution
- Automatic filename generation for downloads

### State Management
The main App component manages:
- `imageData`: Loaded image object with dimensions and URL
- `selectedRatio`: Currently selected aspect ratio object
- `cropArea`: Crop rectangle coordinates in image space
- `originalFileName`: Source file name for download naming

### Coordinate Systems
The app uses two coordinate systems:
- **Image coordinates**: Original pixel dimensions for processing
- **Preview coordinates**: Scaled dimensions for display
Utilities handle conversion between these systems to ensure accurate cropping.

### Build System
- **Webpack 5** with Babel for React JSX transpilation
- **Development server** on port 3000 with hot reload
- **ESLint** for code quality (React plugin included)
- **Jest** configured for testing (no tests currently implemented)
- CSS loader for styling support