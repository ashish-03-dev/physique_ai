import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import API from '../api/axios';

const MeshViewer = ({ objUrl }) => {
  const object = useLoader(OBJLoader, objUrl);
  return <primitive object={object} scale={1.0} />;
};

const OBJViewer = () => {
  const { imageId } = useParams();
  const [meshUrl, setMeshUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const res = await API.get(`/image/${imageId}`, { withCredentials: true });
        if (res.data.image && res.data.image.meshPath) {
          setMeshUrl(`http://localhost:4000${res.data.image.meshPath}`);
        }
      } catch (err) {
        console.error('Error fetching image data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [imageId]);

  if (loading) return <div className="text-center p-6 text-white">Loading...</div>;
  if (!meshUrl) return <div className="text-center p-6 text-red-400">Mesh not found</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-2xl font-bold text-center text-yellow-400 mb-6">
        OBJ Mesh Viewer
      </h2>

      <div className="bg-gray-800 p-4 rounded shadow-lg">
        <h3 className="text-xl mb-4 text-center">3D Mesh (.obj)</h3>
        <div className="h-screen">
          <Canvas camera={{ position: [0, 0, 2.5], fov: 50 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 10]} intensity={1} />
              <Stage environment="city" intensity={0.5}>
                <MeshViewer objUrl={meshUrl} />
              </Stage>
              <OrbitControls />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default OBJViewer;