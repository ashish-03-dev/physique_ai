import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { AiOutlineBarChart, AiOutlineDownload } from 'react-icons/ai';
import jsPDF from 'jspdf';

const WorkoutSuggestions = () => {
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await API.get(`/workout/my-workouts`, { withCredentials: true });
        setWorkouts(response.data.workouts);
      } catch (err) {
        console.error('Error fetching workouts:', err);
        alert('Failed to fetch workout suggestions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
  }, []);

  const handleGenerateWorkout = async () => {
    setGenerating(true);
    try {
      const response = await API.post('/workout/generate-workout', { withCredentials: true });
      setWorkouts([response.data.workout, ...workouts]);
      alert('Weekly workout plan generated successfully!');
    } catch (err) {
      console.error('Error generating workout:', err);
      alert('Failed to generate workout: ' + (err.response?.data?.error || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleCardClick = (workout) => {
    setSelectedWorkout(workout);
  };

  const closeOverlay = () => {
    setSelectedWorkout(null);
  };

  const generatePDF = (workout) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Weekly Workout Plan - ${new Date(workout.createdAt).toLocaleDateString()}`, 10, 10);

    let yOffset = 20;
    Object.entries(workout.weeklyPlan).forEach(([day, plan], index) => {
      doc.setFontSize(14);
      doc.text(`${day} - ${plan.focus}`, 10, yOffset);
      yOffset += 10;
      doc.setFontSize(12);
      doc.text(plan.description, 10, yOffset);
      yOffset += 10;

      plan.exercises.forEach((exercise, exIndex) => {
        const exerciseText = `${exercise.name}: ${exercise.sets} sets${exercise.reps ? `, ${exercise.reps} reps` : exercise.duration ? `, ${exercise.duration}` : ''
          }`;
        doc.text(exerciseText, 15, yOffset);
        yOffset += 8;
      });
      yOffset += 5;
    });

    doc.save(`Workout_Plan_${new Date(workout.createdAt).toLocaleDateString().replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6 mt-6">
        <h2 className="text-2xl font-bold text-yellow-600">Weekly Workout Plans</h2>
        <button
          onClick={handleGenerateWorkout}
          disabled={generating}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {generating ? 'Generating...' : 'Generate New Weekly Plan'}
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading workouts...</p>
      ) : workouts.length === 0 ? (
        <p className="text-center text-gray-500">No workout plans available. Click "Generate New Weekly Plan" to create one.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map((workout) => (
            <div
              key={workout.id}
              onClick={() => handleCardClick(workout)}
              className="border rounded-xl bg-white hover:bg-gray-50 transition-colors cursor-pointer overflow-hidden"
            >
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-gray-800">
                    Weekly Plan - {new Date(workout.createdAt).toLocaleDateString()}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click from triggering overlay
                      generatePDF(workout);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                    title="Download as PDF"
                  >
                    <AiOutlineDownload size={20} />
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  Created: {new Date(workout.createdAt).toLocaleString()}
                </p>
                <div className="flex items-center mt-2 text-green-600">
                  <AiOutlineBarChart className="mr-1" />
                  <span>7-Day Plan</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Workout Details Overlay */}
      {selectedWorkout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-yellow-600">
                Weekly Workout Plan - {new Date(selectedWorkout.createdAt).toLocaleDateString()}
              </h3>

              <button
                onClick={closeOverlay}
                className="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600"
              >
                Close
              </button>
            </div>

            {/* Content */}
            {Object.entries(selectedWorkout.weeklyPlan).map(([day, plan], index) => (
              <div key={day} className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800">{day} - {plan.focus}</h4>
                <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                <div className="grid grid-cols-1 gap-2">
                  {plan.exercises.map((exercise, exIndex) => (
                    <div key={exIndex} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-600">
                        {exercise.name}: {exercise.sets} sets
                        {exercise.reps ? `, ${exercise.reps} reps` : exercise.duration ? `, ${exercise.duration}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Floating Download PDF Button */}
            <div className="sticky bottom-0 mt-4 flex justify-end">
              <button
                onClick={() => generatePDF(selectedWorkout)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-full shadow-md hover:bg-yellow-700 transition"
              >
                Download PDF
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutSuggestions;