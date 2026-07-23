import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { quizService, QuizQuestion, QuizAnswer } from "@/services/quizService";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

const QuizPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState(() => {
    // Get existing userId from localStorage or generate new one
    const existingId = localStorage.getItem("userId");
    if (existingId) return existingId;
    const newId = uuidv4();
    localStorage.setItem("userId", newId);
    return newId;
  });

  // Load questions
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setIsLoading(true);
        const loadedQuestions = await quizService.getQuestions();
        /* console.log("Loaded questions:", loadedQuestions); */
        setQuestions(loadedQuestions);
        setError(null);
      } catch (err) {
        console.error("Error loading quiz:", err);
        setError("Failed to load quiz questions. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load quiz questions. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [toast]);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleNext = async () => {
    if (selectedOption === null) return;

    const newAnswer: QuizAnswer = {
      question_id: questions[currentQuestion].id,
      selected_option: selectedOption,
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      // Navigate to email collection page with answers
      navigate("/email", {
        state: {
          answers: newAnswers,
          result: {
            score: 0, // Will be calculated after email submission
            total_questions: questions.length,
            percentage: 0,
            answers: [],
          },
        },
      });
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading quiz questions...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-dark transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <PageLayout>
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600">No questions available.</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <PageLayout>
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
        <div className="max-w-2xl w-full mx-auto px-4">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-brand-blue rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>

          {/* Question card */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold mb-6">{question.question}</h2>

            <div className="space-y-4">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedOption === option
                      ? "border-brand-blue bg-blue-50"
                      : "border-gray-200 hover:border-brand-blue hover:bg-gray-50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                disabled={selectedOption === null}
                className={`px-6 py-3 rounded-md text-white font-medium transition-colors ${
                  selectedOption === null
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-brand-blue hover:bg-brand-blue-dark"
                }`}
              >
                {currentQuestion < questions.length - 1
                  ? "Next Question"
                  : "Finish Quiz"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default QuizPage;
