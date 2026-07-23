import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";

const StartPage = () => {
  return (
    <PageLayout>
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6 text-brand-blue">
            SHSAT Readiness Quiz
          </h1>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Test Your Knowledge</h2>
            <p className="text-gray-600 mb-6">
              Take this 5-question quiz to assess your understanding of the
              SHSAT. Get immediate feedback and a detailed report sent to your
              email.
            </p>

            <div className="space-y-4 text-left mb-8">
              <div className="flex items-start">
                <span className="text-brand-blue mr-3">📝</span>
                <p className="text-gray-600">
                  5 multiple-choice questions about the SHSAT
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-brand-blue mr-3">⏱️</span>
                <p className="text-gray-600">
                  Takes about 5 minutes to complete
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-brand-blue mr-3">📧</span>
                <p className="text-gray-600">
                  Get your results and explanations via email
                </p>
              </div>
            </div>

            <Link
              to="/quiz"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue-dark transition-colors"
            >
              Begin Quiz
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            By taking this quiz, you agree to receive your results via email.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default StartPage;
