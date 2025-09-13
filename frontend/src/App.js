import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FrontPage from './components/FrontPage';
import FileUpload from './components/FileUpload';
import MyObj from './components/MyObj';
import AnalysisReport from './components/AnalysisReport';
import WorkoutSuggestions from './components/WorkoutSuggestions';
import UploadedImages from './components/UploadedImages';
import Visualization from './components/Visualization';
import OBJViewer from './components/OBJViewer';
import { HomeLayout } from './components/HomeLayout';

const AppRouter = () => {
  return (
    <Router>
      <div className="h-screen bg-gradient-to-br from-gray-100 to-white text-gray-900 font-sans">
        <div className="h-full flex flex-col">
          <div className="flex-1 min-h-0">
            <Routes>
              <Route path="/" element={<FrontPage />} />
              <Route path="/home" element={<HomeLayout />}>
                <Route index element={<FileUpload />} />
                <Route path="upload" element={<FileUpload />} />
                <Route path="3d-view" element={<MyObj />} />
                <Route path="analysis" element={<AnalysisReport />} />
                <Route path="workouts" element={<WorkoutSuggestions />} />
                <Route path="my-uploads" element={<UploadedImages />} />
                <Route index element={<FileUpload />} />
              </Route>
              <Route path="/visualize/:imageId" element={<Visualization />} />
              <Route path="/obj-viewer/:imageId" element={<OBJViewer />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default AppRouter;