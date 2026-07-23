import React, { useEffect, useState } from "react";

export interface Tool {
  id: string;
  name: string;
}

interface ServiceSectionBtnsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTool: string | null;
  availableTools: Tool[];
}

const ServiceSectionBtns: React.FC<ServiceSectionBtnsProps> = ({
  isOpen,
  onClose,
  selectedTool,
  availableTools,
}) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [additionalTools, setAdditionalTools] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      setEmail("");
      setName("");
      setAdditionalTools(selectedTool ? [selectedTool] : []);
      setSubmitted(false);
      setError(null);
    } else {
      setTimeout(() => setShowModal(false), 500);
    }
  }, [isOpen, selectedTool]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (e.target.checked) {
      setAdditionalTools([...additionalTools, value]);
    } else {
      setAdditionalTools(additionalTools.filter((tool) => tool !== value));
    }
  };

  const validateForm = () => {
    if (!email || !email.includes("@")) {
      return "Please enter a valid email address";
    }
    
    if (additionalTools.length === 0) {
      return "Please select at least one tool";
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tools/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          tools_name: additionalTools,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to submit. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className={`fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div 
        className={`bg-white p-6 rounded-xl shadow-2xl max-w-md w-full mx-4 transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl transition-colors duration-200"
          aria-label="Close"
        >
          ×
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Thank You!</h3>
            <p className="text-gray-600 mb-4">We'll notify you when the tools are available.</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all duration-3000" style={{width: '100%'}}></div>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Get Notified</h3>
            <p className="text-gray-600 text-sm mb-6">We'll let you know as soon as these tools become available</p>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#377e9a] focus:border-transparent transition-colors duration-200"
                  placeholder="Your name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#377e9a] focus:border-transparent transition-colors duration-200"
                  placeholder="Your email address"
                  required
                />
              </div>

              <div className="mb-6">
                <p className="block text-gray-700 text-sm font-medium mb-2">Select Tools *</p>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  {availableTools.map((tool) => (
                    <label key={tool.id} className="flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        value={tool.name}
                        checked={additionalTools.includes(tool.name)}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-[#377e9a] focus:ring-[#377e9a] border-gray-300 rounded"
                      />
                      <span className="ml-3 text-gray-700">{tool.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#377e9a] hover:bg-[#2c5f6c] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-[#2c5f6c] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Get Notified"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ServiceSectionBtns;