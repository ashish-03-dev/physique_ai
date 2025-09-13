import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three-stdlib';

const MeshViewer = ({ folderPath = '/data/', count = 10 }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.2, 2);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    // OBJ Loader
    const loader = new OBJLoader();
    const folderPath = '/data/';
    const spacing = 1.5;
    const count = 10; // or however many models you have

    for (let i = 0; i < count; i++) {
      const fileName = `${i}_0.obj`;
      const path = `${folderPath}${fileName}`;
      console.log(`🔍 Attempting to load: ${path}`);

      loader.load(
        path,
        (obj) => {
          const box = new THREE.Box3().setFromObject(obj);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());

          obj.position.set((i - (count - 1) / 2) * spacing, 0, 0);
          obj.position.sub(center);
          obj.position.y += size.y / 2;

          scene.add(obj);
          console.log(`✅ Loaded: ${fileName}`);
        },
        undefined,
        (error) => {
          console.error(`❌ Failed to load ${fileName}`, error);
        }
      );
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [folderPath, count]);

  return (
    <div
      ref={mountRef}
      className="w-full h-[80vh] bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg shadow-lg"
    />
  );
};

export default MeshViewer;