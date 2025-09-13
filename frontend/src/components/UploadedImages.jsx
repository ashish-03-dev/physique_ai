import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { Link } from 'react-router-dom';
import {
  AiOutlineSearch,
  AiOutlineDelete,
  AiOutlineDownload,
  AiOutlineBarChart,
} from 'react-icons/ai';
import { Md3dRotation } from 'react-icons/md';

const UploadedImages = () => {
  const [images, setImages] = useState([]);
  const [loadingImageId, setLoadingImageId] = useState(null);
  const [analyzingImageId, setAnalyzingImageId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHeightModal, setShowHeightModal] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [heightInput, setHeightInput] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await API.get('/upload/my-images', { withCredentials: true });
        setImages(response.data.images);
      } catch (err) {
        console.error('Error fetching images:', err);
        alert('Failed to fetch images. Please try again.');
      }
    };
    fetchImages();
  }, []);

  const handleGenerate = async (imageId) => {
    try {
      setLoadingImageId(imageId);
      const response = await API.post('/generate', { imageId }, { withCredentials: true });
      alert(response.data.message || 'Mesh generation started');
      const res = await API.get('/upload/my-images', { withCredentials: true });
      setImages(res.data.images);
    } catch (err) {
      console.error('Error generating mesh:', err);
      alert('Failed to start mesh generation: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingImageId(null);
    }
  };

  const handleAnalyzeClick = (imageId) => {
    setSelectedImageId(imageId);
    setShowHeightModal(true);
  };

  const handleAnalyze = async () => {
    if (!heightInput || isNaN(heightInput) || Number(heightInput) <= 0) {
      alert('Please enter a valid height in centimeters.');
      return;
    }

    try {
      setAnalyzingImageId(selectedImageId);
      const response = await API.post(
        '/analyze',
        { imageId: selectedImageId, actualHeight: Number(heightInput) },
        { withCredentials: true }
      );
      alert(response.data.message || 'Analysis started');
      const res = await API.get('/upload/my-images', { withCredentials: true });
      setImages(res.data.images);
      setShowHeightModal(false);
      setHeightInput('');
    } catch (err) {
      console.error('Error analyzing image:', err);
      alert('Failed to start analysis: ' + (err.response?.data?.error || err.message));
    } finally {
      setAnalyzingImageId(null);
      setSelectedImageId(null);
    }
  };

  const handleDelete = async (imageId) => {
    if (window.confirm('Are you sure you want to delete this image and all associated data?')) {
      try {
        await API.delete(`/upload/${imageId}`, { withCredentials: true });
        setImages(images.filter((img) => img.imageId !== imageId));
        alert('Image deleted successfully');
      } catch (err) {
        console.error('Error deleting image:', err);
        alert('Failed to delete image: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const filteredImages = images.filter((img) =>
    img.originalFilename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6 mt-6">
        <h2 className="text-2xl font-bold text-yellow-600">Uploaded Images</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search images..."
            className="w-64 p-2 pl-10 rounded-full bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <AiOutlineSearch className="absolute left-3 top-2 text-gray-400" />
        </div>
      </div>

      {filteredImages.length === 0 ? (
        <p className="text-center text-gray-500">No images uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((img) => (
            <div
              key={img.imageId}
              className="border rounded-xl bg-white hover:bg-gray-50 transition-colors overflow-hidden"
            >
              <Link
                to={img.meshGenerated ? `/visualize/${img.imageId}` : '#'}
                className={`block p-4 ${img.meshGenerated ? 'cursor-pointer' : 'cursor-not-allowed pointer-events-none'
                  }`}
              >
                <img
                  src={`http://localhost:4000${img.filePath}`}
                  alt={img.originalFilename}
                  className="w-full h-auto aspect-[4/3] object-contain rounded-lg"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Uploaded: {new Date(img.uploadDate).toLocaleString()}
                </p>
                <p className="text-sm">
                  <strong className={img.meshGenerated ? 'text-green-600' : 'text-red-600'}>
                    {img.meshGenerated ? 'Generated' : 'Not Generated'}
                  </strong>
                </p>
                <p className="text-sm">
                  <strong className={img.analysis ? 'text-green-600' : 'text-red-600'}>
                    {img.analysis ? 'Analyzed' : 'Not Analyzed'}
                  </strong>
                </p>
              </Link>

              <div className="p-4 pt-0 flex flex-wrap gap-2">
                {!img.meshGenerated && (
                  <button
                    onClick={() => handleGenerate(img.imageId)}
                    disabled={loadingImageId === img.imageId}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loadingImageId === img.imageId ? (
                      'Processing...'
                    ) : (
                      <>
                        <Md3dRotation className="mr-1" />
                        Generate Mesh
                      </>
                    )}
                  </button>
                )}
                {img.meshGenerated && !img.analysis && (
                  <button
                    onClick={() => handleAnalyzeClick(img.imageId)}
                    disabled={analyzingImageId === img.imageId}
                    className="flex items-center px-3 py-1 bg-yellow-600 text-white rounded-full hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {analyzingImageId === img.imageId ? (
                      'Analyzing...'
                    ) : (
                      <>
                        <AiOutlineBarChart className="mr-1" />
                        Start Analysis
                      </>
                    )}
                  </button>
                )}
                {img.meshGenerated && (
                  <Link
                    to={`/obj-viewer/${img.imageId}`}
                    className="flex items-center px-3 py-1 bg-purple-600 text-white rounded-full hover:bg-purple-700"
                  >
                    <AiOutlineDownload className="mr-1" />
                    View OBJ
                  </Link>
                )}
                <button
                  onClick={() => handleDelete(img.imageId)}
                  className="flex items-center px-3 py-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <AiOutlineDelete className="mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Height Input Modal */}
      {showHeightModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Enter Height</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please enter the actual height of the subject in centimeters.
            </p>
            <input
              type="number"
              placeholder="Height in cm"
              className="w-full p-2 mb-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={heightInput}
              onChange={(e) => setHeightInput(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowHeightModal(false);
                  setHeightInput('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAnalyze}
                className="px-4 py-2 bg-yellow-600 text-white rounded-full hover:bg-yellow-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadedImages;