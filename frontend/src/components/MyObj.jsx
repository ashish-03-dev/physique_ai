import React, { useEffect, useState, Suspense, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import API from '../api/axios';

const MeshViewer = ({ objUrl }) => {
  const object = useLoader(OBJLoader, objUrl);
  return <primitive object={object} scale={1.0} />;
};

const OBJViewer = () => {
  const [images, setImages] = useState([]);
  const [selectedMeshUrl, setSelectedMeshUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const controlsRef = useRef();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await API.get('/upload/my-images', { withCredentials: true });
        const meshImages = response.data.images.filter(img => img.meshGenerated && img.meshPath);
        setImages(meshImages);
        if (meshImages.length > 0) {
          setSelectedMeshUrl(`http://localhost:4000${meshImages[0].meshPath}`);
        }
      } catch (err) {
        console.error('Error fetching images:', err);
        setError('Failed to load images');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const handleSelectMesh = (meshPath) => {
    setSelectedMeshUrl(`http://localhost:4000${meshPath}`);
  };

  const resetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  if (loading) return <div className="text-center p-6 text-white">Loading...</div>;
  if (error) return <div className="text-center p-6 text-red-400">{error}</div>;
  if (images.length === 0) return <div className="text-center p-6 text-yellow-400">No meshes available</div>;

  return (
    <div className="min-h-full flex flex-col bg-gray-900 text-white p-6 rounded-xl relative">
      <div className="mb-6"  style={{ zIndex: "101" }}>
        <h3 className="text-xl mb-4">Available Meshes</h3>
        <div className="flex flex-wrap gap-2">
          {images.map((img) => (
            <button
              key={img.imageId}
              onClick={() => handleSelectMesh(img.meshPath)}
              className={`px-4 py-2 rounded-full ${selectedMeshUrl === `http://localhost:4000${img.meshPath}`
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
            >
              {img.originalFilename}
            </button>
          ))}
        </div>
      </div>

      {selectedMeshUrl && (
        <div className="p-4 flex-1 rounded bg-gray-800">
          <button
            onClick={resetView}
            className="absolute top-2 right-2 z-10 p-2 bg-gray-700 rounded-full hover:bg-gray-600"
            style={{ zIndex: "101" }}
            title="Reset View"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          <div className="w-full absolute inset-0" style={{ zIndex: "100" }}>
            <Canvas camera={{ position: [0, 0, 2.5], fov: 50 }}>
              <Suspense fallback={null}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 10]} intensity={1} />
                <Stage environment="city" intensity={0.5}>
                  <MeshViewer objUrl={selectedMeshUrl} />
                </Stage>
                <OrbitControls ref={controlsRef} />
              </Suspense>
            </Canvas>
          </div>
        </div>
      )}
    </div>
  );
};

export default OBJViewer;