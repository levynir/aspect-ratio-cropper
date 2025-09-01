import React from 'react';

const ImageUpload = ({ onImageSelect }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  };

  return (
    <div className="image-upload">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        id="image-input"
        className="file-input"
      />
      <label htmlFor="image-input" className="upload-button">
        Choose Image
      </label>
    </div>
  );
};

export default ImageUpload;