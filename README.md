# Aspect Ratio Cropper

A React-based web application for cropping images with precise aspect ratio control. Upload images, select from predefined aspect ratios, and crop with an interactive overlay system. All processing happens client-side using the HTML5 Canvas API.

## Purpose

This tool was created to solve the common problem of cropping images to specific aspect ratios while maintaining full control over the crop area. Unlike many online tools that require uploading to external servers, this app processes everything locally in your browser, preserving privacy and image quality.

## Features

- **Client-side processing**: No uploads to external servers
- **Drag-and-drop upload**: Easy image loading
- **Predefined aspect ratios**: Common ratios like 1:1, 4:3, 16:9, etc.
- **Interactive crop overlay**: Drag and resize crop area
- **Full resolution output**: Maintains original image quality
- **Real-time feedback**: Live crop dimensions and coordinates
- **Responsive design**: Works on desktop and mobile

## Cloud Run
You can use this application freely on Vercel: https://aspect-ratio-cropper.vercel.app/

## Installation
If you prefer a local installation and know what git and npm are, you can grab a local copy, like so:

```bash
# Clone the repository
git clone <repository-url>
cd aspect-ratio-cropper

# Install dependencies
npm install

# Start development server
npm start
```

The app will be available at `http://localhost:3000`.

## Usage

1. **Upload an Image**: Drag and drop an image file or click to select from your device
2. **Select Aspect Ratio**: Choose from predefined ratios or use "Free" for unrestricted cropping
3. **Adjust Crop Area**: Drag the crop rectangle to reposition, or resize using the corner handles
4. **Monitor Crop Info**: View real-time dimensions and coordinates in the crop info panel
5. **Download**: Click "Download Cropped Image" to save your cropped image

## The Pixel Rounding Issue & "Actual Ratio" Field

Due to the discrete nature of pixels, it's often impossible to achieve exact aspect ratios when working with specific pixel dimensions. For example, a perfect 16:9 ratio at 100px width would require 56.25px height, but pixels can't be fractional.

The **"Actual Ratio"** output field shows the true mathematical ratio of your current crop dimensions. This helps you understand:

- Whether your crop achieves the intended ratio exactly
- How close you are to the target ratio when exact matching isn't possible
- The real ratio you're working with for precise applications

**Example**: If you select 16:9 but your crop area is 320×179 pixels, the actual ratio would be approximately 1.787 instead of the perfect 1.778 (16÷9). The actual ratio field displays this as "320:179" so you can make informed decisions about your crop.

## Development

```bash
# Start development server with hot reload
npm start

# Build for production
npm run build

# Run linting
npm run lint

# Run tests (when implemented)
npm test
```

## Architecture

The app uses a component-based architecture with:

- **App.js**: Main component managing global state
- **ImageUpload.js**: File upload with drag-and-drop
- **ImagePreview.js**: Image display with crop overlay
- **AspectRatioSelector.js**: Ratio selection controls
- **CropOverlay.js**: Interactive crop rectangle
- **CropInfo.js**: Real-time crop feedback
- **DownloadButton.js**: Canvas-based crop processing

Utility modules handle image processing (`imageUtils.js`) and crop calculations (`cropUtils.js`).

## Technical Notes

- Uses HTML5 Canvas API for high-quality image processing
- Maintains two coordinate systems: image space (original pixels) and preview space (scaled for display)
- Preserves original image quality during cropping operations
- No backend required - entirely client-side application

## Vibe-Coding Disclaimer

This project was rapidly prototyped with Claude AI assistance and may contain bugs or edge cases that haven't been thoroughly tested. While functional for most use cases, please test thoroughly with your specific requirements before relying on it for critical applications.

## Browser Compatibility

Modern browsers with HTML5 Canvas support. Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - see the [LICENSE](LICENSE) file for details.
