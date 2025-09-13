import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { AiOutlineBarChart, AiOutlineDownload, AiOutlineShareAlt } from 'react-icons/ai';
import jsPDF from 'jspdf';

const AnalysisReport = () => {
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const response = await API.get('/upload/my-images', { withCredentials: true });
        const analyzedImages = response.data.images.filter(img => img.analysis);
        setAnalyses(analyzedImages);
      } catch (err) {
        console.error('Error fetching analyses:', err);
        alert('Failed to fetch analysis data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyses();
  }, []);

  const handleCardClick = (analysis) => {
    setSelectedAnalysis(analysis);
  };

  const closeOverlay = () => {
    setSelectedAnalysis(null);
  };

  const exportToPDF = async () => {
    if (!selectedAnalysis) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Analysis Report: ${selectedAnalysis.originalFilename}`, 20, 20);
    
    doc.setFontSize(12);
    let yPos = 40;
    
    const measurements = [
      { label: 'Height', value: selectedAnalysis.analysis.measurements?.height, suffix: ' cm' },
      { label: 'Torso Length', value: selectedAnalysis.analysis.measurements?.torso, suffix: ' cm' },
      // ... add other measurements as in the original
    ];

    measurements.forEach(({ label, value, suffix = '' }) => {
      if (value) {
        doc.text(`${label}: ${value.toFixed(2)}${suffix}`, 20, yPos);
        yPos += 10;
      }
    });

    // Note: Image addition to PDF requires CORS-enabled image
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = `http://localhost:4000${selectedAnalysis.filePath}`;
      await new Promise(resolve => { img.onload = resolve; });
      doc.addImage(img, 'JPEG', 20, yPos, 160, 120);
    } catch (err) {
      console.error('Error adding image to PDF:', err);
    }

    doc.save(`${selectedAnalysis.originalFilename}_analysis.pdf`);
  };

  const handleShare = async () => {
    if (!selectedAnalysis) return;

    const shareData = {
      title: `Analysis Report: ${selectedAnalysis.originalFilename}`,
      text: 'Check out my analysis report!',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support Web Share API
        alert('Sharing is not supported in this browser. You can copy the URL to share.');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      alert('Failed to share. Please try again.');
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-yellow-600 mb-6 mt-6">Analysis Reports</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading analyses...</p>
      ) : analyses.length === 0 ? (
        <p className="text-center text-gray-500">No analyses available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyses.map((img) => (
            <div
              key={img.imageId}
              onClick={() => handleCardClick(img)}
              className="border rounded-xl bg-white hover:bg-gray-50 transition-colors cursor-pointer overflow-hidden"
            >
              <div className="p-4">
                <img
                  src={`http://localhost:4000${img.filePath}`}
                  alt={img.originalFilename}
                  className="w-full h-auto aspect-[4/3] object-contain rounded-lg"
                />
                <p className="mt-2 text-sm font-semibold text-gray-800">
                  {img.originalFilename}
                </p>
                <p className="text-sm text-gray-600">
                  Analyzed: {new Date(img.analysisDate || img.uploadDate).toLocaleString()}
                </p>
                <div className="flex items-center mt-2 text-green-600">
                  <AiOutlineBarChart className="mr-1" />
                  <span>Analysis Complete</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-yellow-600">
                Analysis Report: {selectedAnalysis.originalFilename}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={exportToPDF}
                  className="text-gray-500 hover:text-gray-700"
                  title="Export to PDF"
                >
                  <AiOutlineDownload size={24} />
                </button>
                <button
                  onClick={handleShare}
                  className="text-gray-500 hover:text-gray-700"
                  title="Share Report"
                >
                  <AiOutlineShareAlt size={24} />
                </button>
                <button
                  onClick={closeOverlay}
                  className="text-gray-500 hover:text-gray-700 font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
            <img
              src={`http://localhost:4000${selectedAnalysis.filePath}`}
              alt={selectedAnalysis.originalFilename}
              className="w-full h-auto aspect-[4/3] object-contain rounded-lg mb-4"
            />
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Height', value: selectedAnalysis.analysis.measurements?.height, suffix: ' cm' },
                { label: 'Torso Length', value: selectedAnalysis.analysis.measurements?.torso, suffix: ' cm' },
                { label: 'Leg Length', value: selectedAnalysis.analysis.measurements?.leg, suffix: ' cm' },
                { label: 'Upper Leg', value: selectedAnalysis.analysis.measurements?.upperLeg, suffix: ' cm' },
                { label: 'Lower Leg', value: selectedAnalysis.analysis.measurements?.lowerLeg, suffix: ' cm' },
                { label: 'Arm Length', value: selectedAnalysis.analysis.measurements?.arm, suffix: ' cm' },
                { label: 'Upper Arm', value: selectedAnalysis.analysis.measurements?.upperArm, suffix: ' cm' },
                { label: 'Forearm', value: selectedAnalysis.analysis.measurements?.forearm, suffix: ' cm' },
                { label: 'Shoulder Width', value: selectedAnalysis.analysis.measurements?.shoulderWidth, suffix: ' cm' },
                { label: 'Hip Width', value: selectedAnalysis.analysis.measurements?.hipWidth, suffix: ' cm' },
                { label: 'Arm Span', value: selectedAnalysis.analysis.measurements?.armSpan, suffix: ' cm' },
                { label: 'Chest', value: selectedAnalysis.analysis.measurements?.chest, suffix: ' cm' },
                { label: 'Waist', value: selectedAnalysis.analysis.measurements?.waist, suffix: ' cm' },
                { label: 'Thigh', value: selectedAnalysis.analysis.measurements?.thigh, suffix: ' cm' },
                { label: 'Calf', value: selectedAnalysis.analysis.measurements?.calf, suffix: ' cm' },
                { label: 'Leg to Height Ratio', value: selectedAnalysis.analysis.proportions?.legToHeight * 100, suffix: '%' },
                { label: 'Torso to Height Ratio', value: selectedAnalysis.analysis.proportions?.torsoToHeight * 100, suffix: '%' },
                { label: 'Arm to Height Ratio', value: selectedAnalysis.analysis.proportions?.armToHeight * 100, suffix: '%' },
                { label: 'Upper to Lower Leg Ratio', value: selectedAnalysis.analysis.proportions?.upperToLowerLeg },
                { label: 'Upper to Lower Arm Ratio', value: selectedAnalysis.analysis.proportions?.upperToLowerArm },
                { label: 'Arm to Leg Ratio', value: selectedAnalysis.analysis.proportions?.armToLeg },
                { label: 'Shoulder to Hip Ratio', value: selectedAnalysis.analysis.proportions?.shoulderToHipRatio },
                { label: 'Shoulder to Height Ratio', value: selectedAnalysis.analysis.proportions?.shoulderToHeight * 100, suffix: '%' },
                { label: 'Arm Span Ratio', value: selectedAnalysis.analysis.proportions?.armSpanRatio * 100, suffix: '%' },
                { label: 'Chest to Waist Ratio', value: selectedAnalysis.analysis.proportions?.chestToWaist },
                { label: 'Thigh to Calf Ratio', value: selectedAnalysis.analysis.proportions?.thighToCalf },
                { label: 'Chest to Height Ratio', value: selectedAnalysis.analysis.proportions?.chestToHeight * 100, suffix: '%' },
                { label: 'Waist to Height Ratio', value: selectedAnalysis.analysis.proportions?.waistToHeight * 100, suffix: '%' },
                { label: 'Thigh to Height Ratio', value: selectedAnalysis.analysis.proportions?.thighToHeight * 100, suffix: '%' },
                { label: 'Calf to Height Ratio', value: selectedAnalysis.analysis.proportions?.calfToHeight * 100, suffix: '%' },
                { label: 'Shoulder to Waist Ratio', value: selectedAnalysis.analysis.proportions?.shoulderToWaist },
                { label: 'Hip to Waist Ratio', value: selectedAnalysis.analysis.proportions?.hipToWaist },
                { label: 'Arm to Torso Ratio', value: selectedAnalysis.analysis.proportions?.armToTorso },
                { label: 'Leg to Torso Ratio', value: selectedAnalysis.analysis.proportions?.legToTorso },
                { label: 'Chest to Arm Ratio', value: selectedAnalysis.analysis.proportions?.chestToArm },
                { label: 'Waist to Leg Ratio', value: selectedAnalysis.analysis.proportions?.waistToLeg },
              ].map(({ label, value, suffix = '' }) => (
                <div key={label} className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-600">
                    {label}: {value ? `${value.toFixed(2)}${suffix}` : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={closeOverlay}
                className="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisReport;