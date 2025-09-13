import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';
import { Line, Sphere, Html } from '@react-three/drei';
import API from '../api/axios';

const skeletonConnections = [
  // Spine / Torso
  [43, 38], // Top Head → Forehead
  [38, 0],  // Forehead → Nose
  [0, 42],  // Nose → Chin/Jaw
  [42, 1],  // Chin → Neck
  [1, 40],  // Neck → Upper Chest
  [40, 41], // Upper Chest → Stomach
  [41, 39], // Stomach → Lower Spine (Pelvis center)
  [39, 8],  // Lower Spine → Pelvis center (J8)

  // Right Arm
  [1, 2],   // Neck → Right Shoulder
  [2, 32],  // Right Shoulder → Right Upper Arm
  [32, 3],  // Upper Arm → Right Elbow
  [3, 4],   // Elbow → Right Wrist
  [4, 31],  // Wrist → Right Hand

  // Left Arm
  [1, 5],   // Neck → Left Shoulder
  [5, 34],  // Left Shoulder → Left Clavicle
  [34, 35], // Clavicle → Left Upper Arm
  [35, 6],  // Upper Arm → Left Elbow
  [6, 7],   // Elbow → Left Wrist
  [7, 36],  // Wrist → Left Hand

  // Right Leg
  [8, 9],   // Pelvis → Right Hip
  [9, 10],  // Hip → Right Knee
  [10, 11], // Knee → Right Ankle
  [11, 24], // Ankle → Right Heel
  [11, 22], // Ankle → Right Big Toe
  [11, 23], // Ankle → Right Small Toe
  [11, 25], // Ankle → Right Midfoot

  // Left Leg
  [8, 12],  // Pelvis → Left Hip
  [12, 13], // Hip → Left Knee
  [13, 14], // Knee → Left Ankle
  [14, 21], // Ankle → Left Heel
  [14, 19], // Ankle → Left Big Toe
  [14, 20], // Ankle → Left Small Toe
  [14, 30], // Ankle → Left Outer Foot

  [39, 28], // Waist center → Left waist
  [39, 27], // Waist center → Right waist

  // Head (facial features)
  [0, 15],  // Nose → Right Eye
  [0, 16],  // Nose → Left Eye
  [15, 17], // Right Eye → Right Ear
  [16, 18], // Left Eye → Left Ear
  [43, 37], // Top Crown → Head Top Back
];

const SkeletonLines = ({ joints, connections, color = 'blue' }) => {
  if (!joints) return null;

  return connections.map(([startIdx, endIdx], i) => {
    const start = joints[startIdx];
    const end = joints[endIdx];
    if (!start || !end) return null;

    return (
      <Line
        key={i}
        points={[new THREE.Vector3(...start), new THREE.Vector3(...end)]}
        color={color}
        lineWidth={2}
      />
    );
  });
};

const keyByIndex = (jointsArray) => {
  if (!Array.isArray(jointsArray)) return null;
  return jointsArray.reduce((acc, coords, idx) => {
    acc[idx] = coords;
    return acc;
  }, {});
};

const Label = ({ position, text }) => (
  <Html position={position} center>
    <div className="bg-black text-white text-xs px-2 py-1 rounded shadow">{text}</div>
  </Html>
);

const Marker = ({ position, color = 'red', size = 0.01 }) => (
  <Sphere args={[size, 16, 16]} position={position}>
    <meshStandardMaterial color={color} />
  </Sphere>
);

const JointMarkers = ({ joints }) => {
  if (!joints) return null;
  return Object.entries(joints).map(([index, pos]) => (
    <React.Fragment key={index}>
      <Marker position={pos} color="white" size={0.001} />
      <Label position={pos} text={`J${index}`} />
    </React.Fragment>
  ));
};

const CameraMarker = ({ position }) => {
  if (!position) return null;
  return (
    <>
      <Marker position={[0, 0, 0]} color="green" size={0.01} />
      <Label position={[0, 0, 0]} text="Camera" />
    </>
  );
};

const MeshViewer = ({ objUrl, onCenter, visible }) => {
  const object = useLoader(OBJLoader, objUrl);
  useEffect(() => {
    const center = new THREE.Vector3();
    object.traverse((child) => {
      if (child.isMesh) {
        child.geometry.computeBoundingBox();
        const box = child.geometry.boundingBox;
        box.getCenter(center);
        child.geometry.translate(-center.x, -center.y, -center.z);
        object.userData.centerOffset = center.toArray();
      }
    });
    onCenter(object.userData.centerOffset);
  }, [object, onCenter]);
  return <primitive object={object} scale={1} visible={visible} />;
};

export default function Visualization() {
  const { imageId } = useParams();
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meshCenter, setMeshCenter] = useState([0, 0, 0]);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showMarkers, setShowMarkers] = useState(false);
  const [showMesh, setShowMesh] = useState(true);

  useEffect(() => {
    API.get(`/image/${imageId}`, { withCredentials: true })
      .then(res => setImageData(res.data.image))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [imageId]);

  if (loading) return <div className="text-center p-6 text-white">Loading...</div>;
  if (!imageData) return <div className="text-center p-6 text-red-400">Image not found</div>;

  const meshUrl = `http://localhost:4000${imageData.meshPath}`;
  const { allJoints, cam_t, measurements, proportions } = imageData.analysis || {};

  const normalizedAll = keyByIndex(allJoints);
  const normalizedCamT = cam_t;

  const toggleSkeleton = () => {
    setShowSkeleton(prev => !prev);
    setShowMesh(prev => !prev); // Toggle mesh visibility when showing skeleton
  };

  const toggleMarkers = () => {
    setShowMarkers(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <h2 className="text-3xl font-bold text-yellow-600 mb-6">3D Mesh Visualization</h2>
      <div className="md:flex gap-8">
        <div className="md:w-1/3 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Original Image</h3>
          <img
            src={`http://localhost:4000${imageData.filePath}`}
            alt="User Upload"
            className="w-full object-contain rounded-lg"
          />
        </div>
        <div className="md:flex-1 col-span-2 bg-white rounded-xl shadow-lg p-6 flex flex-col">
          <h3 className="text-xl font-semibold mb-4 text-center">3D Mesh Workspace</h3>
          <div className="relative flex-1 bg-gray-200 rounded-lg">
            <Canvas className="w-full h-full" camera={{ position: [0, 0, 2.2], fov: 50, near: 0.1, far: 1000 }}>
              <Suspense fallback={null}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 10]} intensity={1} />
                <MeshViewer objUrl={meshUrl} onCenter={setMeshCenter} visible={showMesh} />
                {showSkeleton && <SkeletonLines joints={normalizedAll} connections={skeletonConnections} />}
                {showMarkers && <JointMarkers joints={normalizedAll} />}
                <CameraMarker position={normalizedCamT} />
                <OrbitControls target={[0, 0, 0]} />
              </Suspense>
            </Canvas>
            <div className="absolute top-2 right-2 z-10 flex space-x-2">
              <button onClick={toggleSkeleton} className="bg-blue-500 text-white px-2 py-1 rounded">
                {showSkeleton ? 'Hide Skeleton' : 'Show Skeleton'}
              </button>
              <button onClick={toggleMarkers} className="bg-blue-500 text-white px-2 py-1 rounded">
                {showMarkers ? 'Hide Joint Markers' : 'Show Joint Markers'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Measurements & Proportions</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Height', value: measurements?.height },
            { label: 'Torso Length', value: measurements?.torso },
            { label: 'Leg Length', value: measurements?.leg },
            { label: 'Upper Leg', value: measurements?.upperLeg },
            { label: 'Lower Leg', value: measurements?.lowerLeg },
            { label: 'Arm Length', value: measurements?.arm },
            { label: 'Upper Arm', value: measurements?.upperArm },
            { label: 'Forearm', value: measurements?.forearm },
            { label: 'Shoulder Width', value: measurements?.shoulderWidth },
            { label: 'Hip Width', value: measurements?.hipWidth },
            { label: 'Arm Span', value: measurements?.armSpan },
            { label: 'Leg to Height Ratio', value: proportions?.legToHeight * 100, suffix: '%' },
            { label: 'Torso to Height Ratio', value: proportions?.torsoToHeight * 100, suffix: '%' },
            { label: 'Arm to Height Ratio', value: proportions?.armToHeight * 100, suffix: '%' },
            { label: 'Upper to Lower Leg Ratio', value: proportions?.upperToLowerLeg },
            { label: 'Upper to Lower Arm Ratio', value: proportions?.upperToLowerArm },
            { label: 'Arm to Leg Ratio', value: proportions?.armToLeg },
            { label: 'Shoulder to Hip Ratio', value: proportions?.shoulderToHipRatio },
            { label: 'Shoulder to Height Ratio', value: proportions?.shoulderToHeight * 100, suffix: '%' },
            { label: 'Arm Span Ratio', value: proportions?.armSpanRatio * 100, suffix: '%' },
          ].map(({ label, value, suffix = '' }) => (
            <div key={label} className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-600">
                {label}: {value ? `${value.toFixed(2)}${suffix}` : 'N/A'}
              </p>
              <button className="mt-2 bg-green-500 text-white px-2 py-1 rounded-full hover:bg-green-600">Adjust</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}