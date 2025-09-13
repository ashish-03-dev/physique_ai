import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import API from '../api/axios';

const FileUpload = () => {
  const [previews, setPreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);
    if (rejectedFiles.length > 0) {
      setError('Only .jpg/.png images under 10MB are allowed.');
      return;
    }
    const newPreviews = acceptedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
  }, []);

  const handleUpload = async () => {
    setError(null);
    setUploadProgress(0);
    setUploading(true);

    const formData = new FormData();
    previews.forEach((p) => formData.append('images', p.file));

    try {
      await API.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      setPreviews([]);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (fileName) => setPreviews((prev) => prev.filter((p) => p.file.name !== fileName));

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    onDrop,
  });

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-full">
      <div className="bg-white rounded-xl border border-gray-300 p-8 w-full max-w-2xl">
        <label className="block text-lg font-semibold text-gray-800 mb-4 text-center">
          Upload Images (Multiple .jpg/.png, max 10MB each)
        </label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md px-4 py-8 text-center transition-colors cursor-pointer
          ${isDragActive ? 'border-gray-400 bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}
        >
          <input {...getInputProps()} />
          <p className="text-gray-600">
            {isDragActive ? 'Drop your images here' : 'Drag & drop images, or click to select'}
          </p>
          <button
            type="button"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Choose Images
          </button>
        </div>

        {error && <p className="mt-3 text-red-500 text-sm text-center">{error}</p>}

        {previews.length > 0 && (
          <div className="mt-6">
            <h3 className="text-base font-medium text-gray-700 mb-3 text-center">Selected Images</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {previews.map(({ file, url }) => (
                <div key={file.name} className="relative">
                  <img src={url} alt={file.name} className="w-full h-24 object-cover rounded-md" />
                  <button
                    onClick={() => removeFile(file.name)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={handleUpload}
                disabled={uploading || previews.length === 0}
                className={`px-4 py-1 rounded-md text-gray-800 transition 
                ${uploading || previews.length === 0
                    ? 'bg-gray-200 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {uploading ? `${uploadProgress}%` : 'Upload'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;