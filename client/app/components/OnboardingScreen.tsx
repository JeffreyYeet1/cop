'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  id: number;
  text: string;
  options: {
    id: string;
    text: string;
    icon?: string;
  }[];
}

const questions: Question[] = [
  {
    id: 1,
    text: "When are you most productive?",
    options: [
      { id: "morning", text: "Morning", icon: "☀️" },
      { id: "afternoon", text: "Afternoon", icon: "🌤️" },
      { id: "evening", text: "Evening", icon: "🌙" },
      { id: "varies", text: "It varies day to day", icon: "📅" },
    ],
  },
  {
    id: 2,
    text: "How do you prefer to organize your tasks?",
    options: [
      { id: "priority", text: "By priority", icon: "🔝" },
      { id: "deadline", text: "By deadline", icon: "⏱️" },
      { id: "category", text: "By category", icon: "📂" },
      { id: "difficulty", text: "By difficulty", icon: "🏋️" },
    ],
  },
  {
    id: 3,
    text: "How often do you check your to-do list?",
    options: [
      { id: "multiple", text: "Multiple times a day", icon: "🔄" },
      { id: "once", text: "Once a day", icon: "1️⃣" },
      { id: "when-needed", text: "Only when needed", icon: "👀" },
      { id: "rarely", text: "Rarely", icon: "🕸️" },
    ],
  },
];

const OnboardingScreen = () => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [completed, setCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelect = (optionId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: optionId,
    });
  };

  const isOptionSelected = (optionId: string) => {
    return selectedAnswers[currentQuestion.id] === optionId;
  };

  const canContinue = !!selectedAnswers[currentQuestion.id];

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Complete onboarding
      setCompleted(true);
      savePreferencesToDatabase();
    }
  };

  const handleContinue = () => {
    router.push('/dashboard');
  };

  const savePreferencesToDatabase = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      // Format the preferences data
      const formattedPreferences = Object.entries(selectedAnswers).map(([questionId, answerId]) => {
        const question = questions.find(q => q.id === parseInt(questionId));
        const option = question?.options.find(o => o.id === answerId);
        
        return {
          questionText: question?.text || '',
          answerId: answerId,
          answerText: option?.text || '',
        };
      });
      
      // Make API call to save to database
      const response = await fetch('http://localhost:8000/api/onboarding/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          preferences: formattedPreferences,
        }),
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to save preferences');
        } else {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }
      
      console.log('Preferences saved successfully');
      
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const loadExistingPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:8000/api/onboarding/preferences', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to load preferences');
        } else {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      
      // Convert the loaded preferences back to our format
      if (data.preferences && data.preferences.length > 0) {
        const loadedAnswers: Record<number, string> = {};
        data.preferences.forEach((pref: any) => {
          const question = questions.find(q => q.text === pref.questionText);
          if (question) {
            loadedAnswers[question.id] = pref.answerId;
          }
        });
        setSelectedAnswers(loadedAnswers);
        
        // If all questions are answered, redirect directly to dashboard
        if (Object.keys(loadedAnswers).length === questions.length) {
          console.log('All questions already answered, redirecting to dashboard');
          setIsRedirecting(true);
          router.push('/dashboard');
          return true; // Return true to indicate redirect is happening
        }
      }
      return false; // No redirect needed
    } catch (err) {
      console.error('Error loading preferences:', err);
      // Don't show error to user, just proceed with onboarding
      return false;
    }
  };

  // Load existing preferences when component mounts
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const isRedirecting = await loadExistingPreferences();
      if (!isRedirecting) {
        // Only set completed if we're not redirecting
        // This prevents the "All set!" screen from flashing before redirect
        if (Object.keys(selectedAnswers).length === questions.length) {
          setCompleted(true);
        }
      }
    };
    
    checkOnboardingStatus();
  }, []);

  // If we're redirecting, show minimal content to prevent flash
  if (isRedirecting) {
    return <div className="h-full flex items-center justify-center">Redirecting...</div>;
  }

  // Show completion screen if all questions are answered
  if (completed) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-md mx-auto bg-white rounded-3xl px-6 py-8 shadow-sm">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">All set!</h2>
            <p className="text-gray-600 mb-6">
              Your preferences have been saved. We'll use these to personalize your experience.
            </p>
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            <button
              className={`w-full py-3.5 px-4 bg-blue-500 rounded-full text-white font-medium text-base transition-all hover:bg-opacity-90 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              onClick={handleContinue}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl px-6 py-8 shadow-sm">
        {/* Header */}
        <div>
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-medium text-gray-800">Personalize</h1>
            <span className="text-gray-400 text-sm">
              {currentQuestionIndex + 1}/{questions.length}
            </span>
          </div>
          <h2 className="text-lg font-normal text-gray-700 mt-1">{currentQuestion.text}</h2>
        </div>

        {/* Options */}
        <div className="mt-6 mb-10">
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                className={`w-full flex items-center py-4 px-5 rounded-xl border transition-all ${
                  isOptionSelected(option.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border border-gray-200 bg-white'
                }`}
                onClick={() => handleSelect(option.id)}
              >
                {option.icon && (
                  <span className="text-2xl mr-4">{option.icon}</span>
                )}
                <span className={`font-normal text-left ${isOptionSelected(option.id) ? 'text-gray-800' : 'text-gray-600'}`}>
                  {option.text}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Progress indicators */}
        <div className="mb-7 flex justify-center space-x-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full ${
                index === currentQuestionIndex
                  ? 'bg-blue-500 w-6'
                  : index < currentQuestionIndex
                    ? 'w-1.5 bg-blue-500 opacity-30'
                    : 'w-1.5 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Continue button */}
        <button
          className={`w-full py-3.5 px-4 bg-blue-500 rounded-full text-white font-medium text-base transition-all ${
            !canContinue ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'
          }`}
          onClick={handleNext}
          disabled={!canContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;