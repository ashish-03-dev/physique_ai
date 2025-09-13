import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios'; // Adjust path if needed

const FrontPage = () => {
  useEffect(() => {
    API.get('/', { withCredentials: true })
      .catch(err => {
        console.error('Failed to connect to backend:', err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-teal-50 text-gray-800 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white/90 p-6 sticky top-0 z-50 backdrop-blur-lg shadow-sm rounded-b-3xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl md:text-4xl font-bold text-teal-600 tracking-tight transition-transform duration-300 hover:scale-105">
            PhysiquePro
          </h1>
          <nav className="flex space-x-8">
            <Link
              to="/upload"
              className="text-lg text-gray-600 hover:text-teal-500 transition-colors duration-300 font-medium hover:underline underline-offset-4"
            >
              Upload
            </Link>
            <Link
              to="/generate"
              className="text-lg text-gray-600 hover:text-teal-500 transition-colors duration-300 font-medium hover:underline underline-offset-4"
            >
              Generate Report
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-16 px-4 w-full">
        <div className="text-center max-w-6xl w-full relative">
          {/* Organic decorative element */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-teal-100/30 to-rose-100/30 rounded-full blur-3xl transform scale-125" />
          <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 animate-fade-in">
            Elevate Your Physique Journey
          </h2>
          <p className="text-lg md:text-xl text-gray-500 mb-10 mx-auto max-w-3xl leading-relaxed">
            Discover intuitive tools to analyze your physique, create insightful reports, and track your progress with ease and precision.
          </p>
          <div className="flex justify-center space-x-6">
            <Link
              to="/home"
              className="inline-block bg-teal-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-teal-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              Start Analysis
            </Link>
            <Link
              to="/generate"
              className="inline-block bg-white border-2 border-teal-500 text-teal-500 px-8 py-4 rounded-full text-lg font-semibold hover:bg-teal-500 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              View Reports
            </Link>
          </div>
        </div>
      </section>

      <style>
        {`
          @keyframes fade-in {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 1s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default FrontPage;