import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { createCheckoutSession } from "@/lib/api";

const BuyWorkbook = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (!formData.name || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and email to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    /* console.log("Starting checkout process with data:", formData); */
    /* console.log("API URL:", import.meta.env.VITE_API_URL); */

    try {
      // Create checkout session using API utility
      /* console.log("Calling createCheckoutSession API..."); */
      const data = await createCheckoutSession(formData);
      /* console.log("Checkout session created successfully:", data); */
      toast({
        title: "Success!",
        description: "You'll be redirected to payment shortly.",
      });

      // Redirect to Stripe Checkout
      /* console.log("Redirecting to Stripe Checkout URL:", data.checkout_url); */
      window.location.href = data.checkout_url;
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Error",
        description:
          "Something went wrong with the payment process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <PageLayout>
      <section className="bg-brand-blue py-12">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            SHSAT Strategy Workbook 2025
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            The complete preparation resource for the digital SHSAT
          </p>
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Product Information */}
            <div>
              <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <div className="flex justify-center mb-6">
                  <div className="bg-brand-lightBlue p-2 rounded-lg">
                    <div className="aspect-w-4 aspect-h-5 w-56">
                      <img
                        src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
                        alt="SHSAT Workbook Cover"
                        className="rounded-md object-cover"
                      />
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  What's Inside:
                </h2>

                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>
                      <strong>250+ pages</strong> of comprehensive SHSAT content
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>
                      <strong>Digital-specific strategies</strong> for the 2025
                      test format
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>
                      <strong>300+ practice questions</strong> with detailed
                      explanations
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>
                      <strong>2 complete practice tests</strong> in the new
                      digital format
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>
                      <strong>Study schedule templates</strong> for 4, 8, and
                      12-week plans
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>
                      <strong>Free bonus:</strong> Parent's companion guide
                    </span>
                  </li>
                </ul>

                <div className="mt-6 p-4 bg-yellow-50 rounded-md border border-yellow-200">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-yellow-500 mr-2 mt-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <div>
                      <span className="font-medium">Instant Delivery</span>
                      <p className="text-sm text-gray-600">
                        You'll receive the PDF immediately after purchase via
                        email, plus access to our digital portal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <span className="mr-2">⭐⭐⭐⭐⭐</span>
                  Loved by Parents & Students
                </h3>
                <div className="italic text-gray-700 mb-4">
                  "My daughter scored in the 99th percentile after using this
                  workbook! The strategies were clear and the practice questions
                  were spot-on similar to the actual test."
                </div>
                <div className="font-medium">
                  - Maria G., Parent of Stuyvesant Student
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-6">
                Complete Your Purchase
              </h2>

              <div className="mb-8 p-4 bg-gray-50 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-800">
                    SHSAT Strategy Workbook 2025
                  </span>
                  <span className="font-medium">$49.99</span>
                </div>
                <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                  <span>Digital delivery</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span>$49.99</span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your workbook will be delivered to this email address
                  </p>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="phone_number"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-blue text-white py-3 px-6 rounded-md font-medium hover:bg-brand-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Processing..." : "Complete Purchase"}
                </button>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  By completing your purchase, you agree to our{" "}
                  <Link to="/terms" className="text-brand-blue hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-brand-blue hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default BuyWorkbook;
