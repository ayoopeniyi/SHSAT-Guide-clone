import { useLocation, useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";

interface QuizResult {
  score: number;
  total_questions: number;
  percentage: number;
  answers: Array<{
    question: string;
    selected_answer: string;
    correct_answer: string;
    explanation: string | null;
    is_correct: boolean;
  }>;
}

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as QuizResult;

  if (!result) {
    navigate("/");
    return null;
  }

  return (
    <PageLayout>
      <div className="min-h-[80vh] py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h1 className="text-3xl font-bold text-center mb-8">
              Quiz Results
            </h1>

            {/* Score Summary */}
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-brand-blue mb-2">
                {result.score}/{result.total_questions}
              </div>
              <div className="text-xl text-gray-600">
                {result.percentage.toFixed(1)}% Correct
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-6">
              {result.answers.map((answer, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-lg border ${
                    answer.is_correct
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <h3 className="font-semibold mb-2">Question {index + 1}</h3>
                  <p className="text-gray-700 mb-4">{answer.question}</p>

                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Your answer: </span>
                      <span
                        className={
                          answer.is_correct ? "text-green-600" : "text-red-600"
                        }
                      >
                        {answer.selected_answer}
                      </span>
                    </div>

                    {!answer.is_correct && (
                      <div>
                        <span className="font-medium">Correct answer: </span>
                        <span className="text-green-600">
                          {answer.correct_answer}
                        </span>
                      </div>
                    )}

                    {answer.explanation && (
                      <div className="mt-4 p-4 bg-white rounded-md">
                        <span className="font-medium">Explanation: </span>
                        <p className="text-gray-600 mt-1">
                          {answer.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-brand-blue text-white rounded-md hover:bg-brand-blue-dark transition-colors"
            >
              Take Quiz Again
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ResultsPage;
