import React, { useState } from 'react';
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

const OnboardingScreen: React.FC = () => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [completed, setCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelect = (optionId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: optionId,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Complete onboarding
      setCompleted(true);
      
      // Save preferences to localStorage or send to backend
      localStorage.setItem('userPreferences', JSON.stringify(selectedAnswers));
    }
  };

  const handleContinue = () => {
    // Redirect to dashboard after completing onboarding
    router.push('/dashboard');
  };

  const isOptionSelected = (optionId: string) => {
    return selectedAnswers[currentQuestion.id] === optionId;
  };

  const canContinue = !!selectedAnswers[currentQuestion.id];

  if (completed) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-md mx-auto bg-white rounded-3xl onboarding-card p-8 mt-4 overflow-hidden">
          <div className="w-16 h-16 mx-auto bg-[#3478F6] bg-opacity-10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-[#3478F6]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-center text-gray-800 mb-2">All done</h1>
          <p className="text-gray-500 text-center mb-8">
            Your productivity profile has been created. We'll use this to tailor your experience.
          </p>
          <button
            className="w-full py-3.5 px-4 bg-[#4C8DFF] continue-button rounded-full text-white font-medium text-base transition-all hover:bg-opacity-90"
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl onboarding-card px-6 py-8">
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
                className={`w-full flex items-center py-4 px-5 option-button border rounded-xl transition-all ${
                  isOptionSelected(option.id)
                    ? 'border-[#3478F6] bg-[#3478F6] bg-opacity-5'
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
              className={`h-1.5 rounded-full progress-dot ${
                index === currentQuestionIndex
                  ? 'active-dot bg-[#4C8DFF] w-6'
                  : index < currentQuestionIndex
                    ? 'w-1.5 bg-[#4C8DFF] opacity-30'
                    : 'w-1.5 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Continue button */}
        <button
          className={`w-full py-3.5 px-4 bg-[#4C8DFF] continue-button rounded-full text-white font-medium text-base transition-all ${
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