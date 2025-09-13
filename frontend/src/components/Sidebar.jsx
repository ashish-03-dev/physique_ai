import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AiOutlineUpload,
  AiOutlineBarChart,
  AiOutlineFolderOpen,
} from 'react-icons/ai';
import { Md3dRotation } from 'react-icons/md';
import { GiWeightLiftingUp } from 'react-icons/gi';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const views = [
    { name: 'upload', label: 'Upload Data', icon: <AiOutlineUpload className="mr-2" /> },
    { name: '3d-view', label: '3D Visualization', icon: <Md3dRotation className="mr-2" /> },
    { name: 'analysis', label: 'Analysis Report', icon: <AiOutlineBarChart className="mr-2" /> },
    { name: 'workouts', label: 'Workouts', icon: <GiWeightLiftingUp className="mr-2" /> },
    { name: 'my-uploads', label: 'My Uploads', icon: <AiOutlineFolderOpen className="mr-2" /> },
  ];

  return (
    <div className="relative z-40">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-r-full shadow-lg hover:from-yellow-500 hover:to-orange-600 focus:outline-none z-50 absolute top-0"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`bg-white w-64 mr-16 mt-10 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 z-40 overflow-y-auto rounded-xl`}
      >

        {/* Navigation */}
        <nav className="">
          <ul className="space-y-2 p-4">
            {views.map((view) => (
              <li key={view.name}>
                <button
                  onClick={() => {
                    navigate(`/home/${view.name}`);
                    setIsOpen(false); // Close sidebar on mobile
                  }}
                  className="w-full text-left px-6 py-3 rounded-r-full flex items-center transition-all text-gray-700 hover:bg-yellow-100"
                >
                  {view.icon}
                  {view.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Button */}
        <div className="p-4 mt-auto">
          <button className="w-full bg-gradient-to-r from-green-400 to-teal-500 text-white px-4 py-2 rounded-full hover:from-green-500 hover:to-teal-600 transition-colors">
            Settings
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;