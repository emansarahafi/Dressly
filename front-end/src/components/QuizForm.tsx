import { useState, useEffect } from "react";
import { quizSteps } from "../lib/quizSteps";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import api from "../lib/api";

interface QuizFormProps {
  onComplete: (result: { recommendation: string; products: any[] }) => void;
  onError?: (message: string) => void;
}

export default function QuizForm({ onComplete, onError }: QuizFormProps) {
  // ============= STATE =============
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============= COMPUTED VALUES =============
  const totalSteps = quizSteps.length;
  const currentStep = quizSteps[step];
  const progress = ((step + 1) / totalSteps) * 100;
  const isLastStep = step === totalSteps - 1;
  const isFirstStep = step === 0;

  // ============= LOAD SAVED ANSWER =============
  useEffect(() => {
    setCurrentAnswer(answers[currentStep.key] || null);
  }, [step, currentStep.key, answers]);

  const sendData = async (answers: Record<string, any>) => {
    try {
      const response = await api.post("/quiz/submit", answers);
      console.log("✅ AI result:", response.data.recommendation);
      console.log("✅ Products:", response.data.products);
      return response.data;
    } catch (error) {
      console.error("❌ Error sending quiz:", error);
      throw error;
    }
  };

  // ============= NAVIGATION =============
  const isAnswerValid = () => {
    if (!currentStep.required) return true;
    if (!currentAnswer) return false;
    
    if (currentStep.type === "multi") {
      return Array.isArray(currentAnswer) && currentAnswer.length > 0;
    }
    if (currentStep.type === "pair" || currentStep.type === "inputs" || currentStep.type === "range") {
      return Object.keys(currentAnswer).length > 0 && Object.values(currentAnswer).every(v => v);
    }
    return true;
  };

  const next = async () => {
    // Validate required fields
    if (!isAnswerValid()) {
      setError("Please answer this question before continuing");
      return;
    }
    
    setError(null);
    const newAnswers = { ...answers, [currentStep.key]: currentAnswer };
    setAnswers(newAnswers);

    if (isLastStep) {
      setLoading(true);
      try {
        const result = await sendData(newAnswers);
        onComplete(result);
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || "Failed to submit quiz. Please try again.";
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const prev = () => {
    setError(null);
    const newAnswers = { ...answers, [currentStep.key]: currentAnswer };
    setAnswers(newAnswers);

    if (!isFirstStep) {
      setStep(step - 1);
    }
  };

  // ============= ANSWER MANAGEMENT =============
  const toggleOption = (option: string) => {
    const current = currentAnswer || [];

    if (current.includes(option)) {
      setCurrentAnswer(current.filter((o: string) => o !== option));
    } else {
      setCurrentAnswer([...current, option]);
    }
  };

  
  // ============= RENDER FUNCTIONS =============
  const renderQuestion = () => {
    // 1. Multi-select (occasion, style, colors)
    if (currentStep.type === "multi") {
      const selected = currentAnswer || [];

      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {currentStep.options?.map((option: string) => {
            const isSelected = selected.includes(option);

            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleOption(option)}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-200
                  ${
                    isSelected
                      ? "border-rose-500 bg-rose-50 shadow-md scale-105"
                      : "border-gray-200 bg-white hover:border-rose-300 hover:shadow-sm"
                  }
                `}
              >
                <span
                  className={`font-medium ${
                    isSelected ? "text-rose-700" : "text-gray-700"
                  }`}
                >
                  {option}
                </span>

                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      );
    }

    // 2. Pair (height ft/in)
    if (currentStep.type === "pair") {
      const current = currentAnswer || {};

      return (
        <div className="flex gap-4 max-w-sm mx-auto">
          {currentStep.fields?.map((field) => (
            <div key={field.name} className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
              </label>
              <input
                type="number"
                value={current[field.name] || ""}
                onChange={(e) => {
                  setCurrentAnswer({
                    ...current,
                    [field.name]: e.target.value,
                  });
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:outline-none transition-colors"
              />
            </div>
          ))}
        </div>
      );
    }

    // 3. Inputs (sizes)
    if (currentStep.type === "inputs") {
      const current = currentAnswer || {};

      return (
        <div className="space-y-4 max-w-md mx-auto">
          {currentStep.fields?.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
              </label>
              <input
                type="text"
                placeholder={field.placeholder}
                value={current[field.name] || ""}
                onChange={(e) => {
                  setCurrentAnswer({
                    ...current,
                    [field.name]: e.target.value,
                  });
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:outline-none transition-colors"
              />
            </div>
          ))}
        </div>
      );
    }

    // 4. Range (budget min/max)
    if (currentStep.type === "range") {
      const current = currentAnswer || {};

      return (
        <div className="space-y-4 max-w-md mx-auto">
          {currentStep.fields?.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
              </label>
              <input
                type="number"
                value={current[field.name] || ""}
                onChange={(e) => {
                  setCurrentAnswer({
                    ...current,
                    [field.name]: e.target.value,
                  });
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:outline-none transition-colors"
              />
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  // ============= MAIN RENDER =============
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Dressly
            </h1>
            <span className="text-sm text-gray-600">
              Step {step + 1} of {totalSteps}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-500 to-pink-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 min-h-[500px] flex flex-col">
          {/* Question Content */}
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
              {currentStep.title}
            </h2>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center font-medium">{error}</p>
              </div>
            )}

            <div className="mb-8">{renderQuestion()}</div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-100">
            <button
              type="button"
              onClick={prev}
              disabled={isFirstStep || loading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => void next()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isLastStep ? "Complete" : "Next"}</span>
                  {isLastStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}