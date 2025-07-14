import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock, Trophy, ArrowRight } from 'lucide-react';
import axios from 'axios';

const Onboarding = () => {
  const [steps, setSteps] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOnboardingData();
  }, []);

  const fetchOnboardingData = async () => {
    try {
      const [stepsResponse, statusResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/onboarding/steps`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/onboarding/status`)
      ]);

      setSteps(stepsResponse.data);
      setStatus(statusResponse.data);
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboardingStep = async (stepId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/onboarding/steps/${stepId}/complete`);
      fetchOnboardingData(); // Refresh data
    } catch (error) {
      console.error('Error completing step:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="max-w-9xl mx-auto space-y-4">
      {/* Header */}
      <div className=" rounded-xl p-4 text-black border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Onboarding Journey</h1>
            <p className="text-vlack">Complete all steps to finish your onboarding process</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <Trophy className="h-12 w-12 text-black" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Progress Overview</h2>
            <p className="text-sm text-gray-600">
              {completedSteps} of {totalSteps} steps completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-black">{Math.round(progress)}%</div>
            <div className="text-sm text-gray-600">Complete</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-black h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {status?.status === 'completed' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-700 font-medium">
                Congratulations! You have completed all onboarding steps.
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
  <h2 className="text-xl font-semibold text-gray-900 mb-8 text-center">Onboarding Steps</h2>

  <div className="overflow-x-auto">
    <div className="relative flex justify-between items-center w-full min-w-[600px] px-6">
      {steps.map((step, index) => (
        <div key={step._id} className="flex flex-col items-center text-center w-full relative">
          {/* Connector line: only between steps */}
          {index < steps.length - 1 && (
            <div className="absolute top-5 left-1/2 w-full h-0.5 bg-gray-300 z-0"></div>
          )}

          {/* Step circle icon */}
          <div
            className={`relative z-10 h-10 w-10 flex items-center justify-center rounded-full border-2 text-white font-semibold transition-all duration-300 ${
              step.completed ? 'bg-green-500 border-green-500' : 'bg-gray-300 border-gray-300'
            }`}
          >
            {step.completed ? (
              <CheckCircle className="h-5 w-5 text-white" />
            ) : (
              <Circle className="h-5 w-5 text-white" />
            )}
          </div>

          {/* Step Title */}
          <p
            className={`mt-2 text-sm font-medium ${
              step.completed ? 'text-green-700' : 'text-gray-700'
            }`}
          >
            {step.stepName}
          </p>

          {/* Optional Step Description */}
          <p className="text-xs text-gray-500">{step.stepDescription}</p>
        </div>
      ))}
    </div>
  </div>
</div>



      {/* Help Section */}
      <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="bg-black p-2 rounded-full">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Need Help?</h3>
            <p className="text-blue-700 mt-1 text-sm">
              If you're having trouble completing any step, don't hesitate to reach out to your manager or HR team. 
              They're here to help you succeed in your onboarding journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;