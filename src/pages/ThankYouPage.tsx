import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";

const ThankYouPage = () => {
  return (
    <PageLayout>
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold mb-4 text-brand-blue">
              Thank You!
            </h1>

            <p className="text-gray-600 mb-8">
              Your quiz results have been sent to your email. Check your inbox
              for a detailed report with your score and explanations for each
              question.
            </p>

            <div className="space-y-4">
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue-dark transition-colors"
              >
                Return to Home
              </Link>

              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-2">📚 Get the Workbook</h3>
                    <p className="text-gray-600 text-sm">
                      Access our comprehensive SHSAT preparation workbook with
                      practice questions and strategies.
                    </p>
                    <Link
                      to="/buy-workbook"
                      className="text-brand-blue hover:underline text-sm mt-2 inline-block"
                    >
                      Learn More →
                    </Link>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-2">📧 Stay Updated</h3>
                    <p className="text-gray-600 text-sm">
                      Subscribe to our newsletter for SHSAT tips, updates, and
                      important dates.
                    </p>
                    <Link
                      to="/subscribe"
                      className="text-brand-blue hover:underline text-sm mt-2 inline-block"
                    >
                      Subscribe →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ThankYouPage;
