import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { quizService } from "@/services/quizService";
import { useToast } from "@/components/ui/use-toast";

const EmailCollectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get quiz result from location state
  const quizResult = location.state?.result;
  const answers = location.state?.answers;

  if (!quizResult || !answers) {
    // Redirect to home if no quiz data
    navigate("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setIsSubmitting(true);
    try {
      // Submit quiz with name and email
      const result = await quizService.submitQuiz({
        user_id: localStorage.getItem("userId") || "",
        name: name,
        email: email,
        answers: answers,
      });

      // Navigate to results page
      navigate("/results", { state: { result } });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Almost Done!
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Enter your details to receive your quiz results and detailed
              explanations.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email || !name}
                className={`w-full px-6 py-3 rounded-md text-white font-medium transition-colors ${
                  isSubmitting || !email || !name
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-brand-blue hover:bg-brand-blue-dark"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Get Results"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default EmailCollectionPage;
