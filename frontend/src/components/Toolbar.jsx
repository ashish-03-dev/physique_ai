import React from 'react';

const Toolbar = () => {
  return (
    <div className="bg-white border p-4 rounded-lg mb-6 flex justify-between items-center">
      <div className="flex space-x-4">
        <h2 className="text-2xl font-bold text-dark">PhysiquePro</h2>
      </div>
      <div className="flex items-center space-x-4">
        <button className="bg-yellow-500 text-white px-4 py-2 rounded-full hover:bg-yellow-600">Save</button>
        <button className="text-gray-600 hover:text-gray-900">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button className="text-gray-600 hover:text-gray-900">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">U</div>
      </div>
    </div>
  );
};

export default Toolbar;