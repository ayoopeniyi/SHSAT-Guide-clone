import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftSquareIcon, RefreshCw } from "lucide-react";
import axios from "axios";

interface WhiteLabelApplication {
  organization: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  students: string;
  products: string[];
  launchDate: string;
  notes: string;
  captchaInput: string;
}

interface FormErrors {
  organization?: string;
  contactName?: string;
  email?: string; 
  phone?: string;
  website?: string;
  students?: string;
  products?: string;
  launchDate?: string;
  notes?: string;
  captchaInput?: string;
  general?: string;
}

const WhiteLabelPage = () => {
  const [formData, setFormData] = useState<WhiteLabelApplication>({
    organization: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    students: "",
    products: [],
    launchDate: "",
    notes: "",
    captchaInput: "",
  });

  const [captchaId, setCaptchaId] = useState("");
  const [captchaImageUrl, setCaptchaImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoadingCaptcha, setIsLoadingCaptcha] = useState(true);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const productsList = ["Workbook", "Test Pack", "Q-Bank", "Digital Course"];
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  /* console.log("API URL:", apiUrl); */

  useEffect(() => {
    loadCaptcha();
  }, []);

  const loadCaptcha = async () => {
    try {
      setIsLoadingCaptcha(true);
      /* console.log("Loading CAPTCHA from:", `${apiUrl}/api/captcha/generate`); */
      
      if (captchaImageUrl) {
        URL.revokeObjectURL(captchaImageUrl);
      }
      
      const response = await fetch(`${apiUrl}/api/captcha/generate`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Accept': 'image/png'
        }
      });
      
      /* console.log("CAPTCHA response status:", response.status); */
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const captchaIdFromHeader = response.headers.get('X-Captcha-ID');
      /* console.log("CAPTCHA ID from header:", captchaIdFromHeader); */
      
      if (!captchaIdFromHeader) {
        throw new Error('CAPTCHA ID not received from server');
      }
      
      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      
      setCaptchaId(captchaIdFromHeader);
      setCaptchaImageUrl(imageUrl);
      setErrors(prev => ({ ...prev, captchaInput: undefined, general: undefined }));
      
      /* console.log("CAPTCHA loaded successfully"); */
      
    } catch (error) {
      console.error("Failed to load CAPTCHA:", error);
      setErrors(prev => ({ 
        ...prev, 
        general: `Failed to load CAPTCHA: ${error instanceof Error ? error.message : String(error)}. Please check if your backend is running.`,
        captchaInput: "CAPTCHA loading failed"
      }));
    } finally {
      setIsLoadingCaptcha(false);
    }
  };

  const refreshCaptcha = async () => {
    setFormData(prev => ({ ...prev, captchaInput: "" }));
    await loadCaptcha();
  };

  const handleCheckboxChange = (product: string) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.includes(product)
        ? prev.products.filter((p) => p !== product)
        : [...prev.products, product],
    }));
    
    if (errors.products) {
      setErrors(prev => ({ ...prev, products: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Real-time validation on blur
    validateField(name, e.target.value);
  };

  const validateField = (fieldName: string, value: any) => {
    let error = '';
    
    switch (fieldName) {
      case 'organization':
        if (!value || !value.toString().trim()) {
          error = 'Organization name is required';
        } else if (value.length < 2) {
          error = 'Organization name must be at least 2 characters';
        } else if (value.length > 100) {
          error = 'Organization name cannot exceed 100 characters';
        }
        break;
        
      case 'contactName':
        if (!value || !value.toString().trim()) {
          error = 'Contact name is required';
        } else if (value.length < 2) {
          error = 'Contact name must be at least 2 characters';
        } else if (value.length > 100) {
          error = 'Contact name cannot exceed 100 characters';
        } else if (!/[a-zA-Z]/.test(value)) {
          error = 'Contact name must contain letters';
        }
        break;
        
      case 'email':
        if (!value || !value.toString().trim()) {
          error = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
        
      case 'phone':
        if (!value || !value.toString().trim()) {
          error = 'Phone number is required';
        } else {
          const cleaned = value.replace(/[^\d+]/g, '');
          if (cleaned.length < 10) {
            error = 'Phone number must be at least 10 digits';
          }
        }
        break;
        
      case 'website':
        if (value && value.trim()) {
          const urlPattern = /^https?:\/\/(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/;
          if (!urlPattern.test(value)) {
            error = 'Website must be a valid URL starting with http:// or https://';
          }
        }
        break;
        
      case 'students':
        if (value && value.trim()) {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue <= 0) {
            error = 'Number of students must be a positive number';
          } else if (numValue > 1000000) {
            error = 'Number of students cannot exceed 1,000,000';
          }
        }
        break;
        
      case 'products':
        if (!value || (Array.isArray(value) && value.length === 0)) {
          error = 'Please select at least one product';
        }
        break;
        
      case 'launchDate':
        if (value && value.trim()) {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (selectedDate < today) {
            error = 'Launch date cannot be in the past';
          } else {
            const twoYearsFromNow = new Date();
            twoYearsFromNow.setFullYear(today.getFullYear() + 2);
            if (selectedDate > twoYearsFromNow) {
              error = 'Launch date cannot be more than 2 years in the future';
            }
          }
        }
        break;
        
      case 'notes':
        if (value && value.length > 1000) {
          error = 'Additional notes cannot exceed 1000 characters';
        }
        break;
        
      case 'captchaInput':
        if (!value || !value.toString().trim()) {
          error = 'CAPTCHA verification is required';
        } else if (value.length !== 5) {
          error = 'CAPTCHA must be 5 characters';
        }
        break;
    }
    
    if (error) {
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    } else {
      setErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
    
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.organization.trim()) {
      newErrors.organization = "Organization name is required";
    } else if (formData.organization.length < 2) {
      newErrors.organization = "Organization name must be at least 2 characters";
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = "Contact name is required";
    } else if (formData.contactName.length < 2) {
      newErrors.contactName = "Contact name must be at least 2 characters";
    } else if (!/[a-zA-Z]/.test(formData.contactName)) {
      newErrors.contactName = "Contact name must contain letters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const cleaned = formData.phone.replace(/[^\d+]/g, '');
      if (cleaned.length < 10) {
        newErrors.phone = "Phone number must be at least 10 digits";
      }
    }

    if (formData.website && formData.website.trim()) {
      const urlPattern = /^https?:\/\/(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/;
      if (!urlPattern.test(formData.website)) {
        newErrors.website = "Website must be a valid URL starting with http:// or https://";
      }
    }

    if (formData.students && formData.students.trim()) {
      const numValue = parseInt(formData.students);
      if (isNaN(numValue) || numValue <= 0) {
        newErrors.students = "Number of students must be a positive number";
      } else if (numValue > 1000000) {
        newErrors.students = "Number of students cannot exceed 1,000,000";
      }
    }

    if (formData.products.length === 0) {
      newErrors.products = "Please select at least one product";
    }

    if (formData.launchDate && formData.launchDate.trim()) {
      const selectedDate = new Date(formData.launchDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.launchDate = "Launch date cannot be in the past";
      } else {
        const twoYearsFromNow = new Date();
        twoYearsFromNow.setFullYear(today.getFullYear() + 2);
        if (selectedDate > twoYearsFromNow) {
          newErrors.launchDate = "Launch date cannot be more than 2 years in the future";
        }
      }
    }

    if (formData.notes && formData.notes.length > 1000) {
      newErrors.notes = "Additional notes cannot exceed 1000 characters";
    }

    if (!formData.captchaInput.trim()) {
      newErrors.captchaInput = "CAPTCHA verification is required";
    } else if (formData.captchaInput.length !== 5) {
      newErrors.captchaInput = "CAPTCHA must be 5 characters";
    }

    if (!captchaId) {
      newErrors.captchaInput = "CAPTCHA not loaded. Please refresh.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseBackendErrors = (errorDetail: any): FormErrors => {
    const newErrors: FormErrors = {};
    
    /* console.log("Parsing backend error:", errorDetail); */
    
    if (typeof errorDetail === 'string') {
      const lowerDetail = errorDetail.toLowerCase();
      
      if (lowerDetail.includes('captcha')) {
        newErrors.captchaInput = errorDetail;
      } else if (lowerDetail.includes('organization')) {
        newErrors.organization = errorDetail;
      } else if (lowerDetail.includes('contact')) {
        newErrors.contactName = errorDetail;
      } else if (lowerDetail.includes('email')) {
        newErrors.email = errorDetail;
      } else if (lowerDetail.includes('phone')) {
        newErrors.phone = errorDetail;
      } else if (lowerDetail.includes('website')) {
        newErrors.website = errorDetail;
      } else if (lowerDetail.includes('student')) {
        newErrors.students = errorDetail;
      } else if (lowerDetail.includes('product')) {
        newErrors.products = errorDetail;
      } else if (lowerDetail.includes('date')) {
        newErrors.launchDate = errorDetail;
      } else if (lowerDetail.includes('note')) {
        newErrors.notes = errorDetail;
      } else {
        newErrors.general = errorDetail;
      }
      
    } else if (Array.isArray(errorDetail)) {
      errorDetail.forEach((error: any) => {
        /* console.log("Processing validation error:", error); */
        
        let field: string = '';
        let message: string = '';
        
        if (error.loc && Array.isArray(error.loc)) {
          field = error.loc[error.loc.length - 1];
        }
        
        if (error.msg) {
          message = error.msg;
        } else if (error.message) {
          message = error.message;
        } else {
          message = 'Invalid input';
        }
        
        const frontendField = mapBackendFieldToFrontend(field);
        newErrors[frontendField] = message;
      });
      
    } else if (typeof errorDetail === 'object' && errorDetail !== null) {
      Object.entries(errorDetail).forEach(([field, message]) => {
        const frontendField = mapBackendFieldToFrontend(field);
        
        if (typeof message === 'string') {
          newErrors[frontendField] = message;
        } else if (Array.isArray(message) && message.length > 0) {
          newErrors[frontendField] = message[0];
        } else {
          newErrors[frontendField] = 'Invalid input';
        }
      });
    }
    
    return newErrors;
  };

  const mapBackendFieldToFrontend = (backendField: string): keyof FormErrors => {
    const fieldMap: Record<string, keyof FormErrors> = {
      'organization_name': 'organization',
      'contact_name': 'contactName', 
      'email': 'email',
      'phone_number': 'phone',
      'website': 'website',
      'number_of_students': 'students',
      'desired_products': 'products',
      'expected_launch_date': 'launchDate',
      'additional_notes': 'notes',
      'captcha_input': 'captchaInput',
      'captcha_id': 'captchaInput',
      'urgent_request': 'general',
      'body': 'general'
    };
    
    return fieldMap[backendField] || 'general';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // console.log("Submit button clicked");
    // console.log("Form data:", formData);
    // console.log("CAPTCHA ID:", captchaId);
    
    if (!validateForm()) {
      /* console.log("Form validation failed:", errors); */
      const allFields = ['organization', 'contactName', 'email', 'phone', 'website', 'students', 'products', 'launchDate', 'notes', 'captchaInput'];
      const newTouched: Record<string, boolean> = {};
      allFields.forEach(field => {
        newTouched[field] = true;
      });
      setTouched(newTouched);
      return;
    }
    // console.log("Form validation passed, submitting...");
    setIsSubmitting(true);
    setErrors({});

    try {
      const apiData = {
        organization_name: formData.organization.trim(),
        contact_name: formData.contactName.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone.trim(),
        website: formData.website.trim() || null,
        number_of_students: formData.students && formData.students.trim()
          ? parseInt(formData.students.trim())
          : null,
        desired_products: formData.products,
        expected_launch_date: formData.launchDate.trim() || null,
        additional_notes: formData.notes.trim() || null,
        urgent_request: false, // Honeypot field
        captcha_id: captchaId,
        captcha_input: formData.captchaInput.trim(),
      };

      /* console.log("Sending API data:", apiData); */

      const response = await axios.post(
        `${apiUrl}/api/whitelabel/submit`,
        apiData,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Submit-Time": new Date().toISOString(),
          },
          timeout: 30000, // 30 second timeout
        }
      );

      /* console.log("API Response:", response.data); */

      if (response.data.success) {
        setSubmitSuccess(true);
        if (captchaImageUrl) {
          URL.revokeObjectURL(captchaImageUrl);
        }
      } else {
        setErrors({ general: "Submission failed. Please try again." });
      }
      
    } catch (error: any) {
      console.error("Submission error:", error);
      /* console.log("Error response:", error.response); */
      
      if (error.response?.data?.detail) {
        /* console.log("Backend error detail:", error.response.data.detail); */
        
        if (error.response.status === 400 || error.response.status === 422) {
          const backendErrors = parseBackendErrors(error.response.data.detail);
          /* console.log("Parsed backend errors:", backendErrors); */
          setErrors(backendErrors);
          
          // If CAPTCHA error, refresh CAPTCHA
          // if (backendErrors.captchaInput) {
          //   await refreshCaptcha();
          // }
        } else if (error.response.status === 429) {
          setErrors({ 
            general: "Too many requests. Please wait a moment before trying again." 
          });
        } else if (error.response.status === 500) {
          setErrors({ 
            general: "Server error. Please try again later." 
          });
        } else {
          setErrors({ 
            general: error.response.data.detail || "An unexpected error occurred." 
          });
        }
      } else if (error.code === 'ECONNABORTED') {
        setErrors({ 
          general: "Request timeout. Please check your connection and try again." 
        });
      } else if (error.message?.includes('Network Error')) {
        setErrors({ 
          general: "Network error. Please check your internet connection and try again." 
        });
      } else {
        setErrors({ 
          general: "An unexpected error occurred. Please try again." 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    return () => {
      if (captchaImageUrl) {
        URL.revokeObjectURL(captchaImageUrl);
      }
    };
  }, [captchaImageUrl]);

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
          <svg
            className="mx-auto h-12 w-12 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <h2 className="mt-3 text-2xl font-bold text-gray-900">
            Application Submitted!
          </h2>
          <p className="mt-2 text-gray-600">
            Thank you for your interest in our white-label program. We've
            received your application and will review it shortly. You should
            receive a confirmation email soon.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 bg-[#1d99c6] hover:bg-[#1a7f9c] text-white font-semibold py-2 px-4 rounded-md transition-all duration-300"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 font-sans text-gray-900">
      <section className="bg-[#1d99c6] text-white py-10 px-4">
        <div
          className="flex items-center gap-2 cursor-pointer hover:text-yellow-300 transition-colors duration-200 mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftSquareIcon className="w-8 h-8" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Apply to Launch Your Own SHSAT Program — Powered by Bell Curves
          </h1>
          <p className="text-lg mb-6">
            Our White-Label SHSAT solution gives you everything you need to
            start (or upgrade) your test prep program — fast. Within weeks, you
            can be delivering professional, DOE-aligned, digital SHSAT prep
            under your own brand, backed by over 20 years of Bell Curves
            expertise.
          </p>
          <a
            href="#apply"
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 px-6 rounded-md transition-all duration-300"
          >
            Apply Now
          </a>
        </div>
      </section>

      <section className="max-w-5xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Application Process
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              step: "1",
              title: "Submit Your Application",
              text: "Tell us about your organization, audience, and program goals.",
            },
            {
              step: "2",
              title: "Choose Your Package",
              text: "From single products to the full suite (Workbook, Test Pack, Q-Bank, Digital Course).",
            },
            {
              step: "3",
              title: "Brand Integration",
              text: "We apply your logo, colors, and domain.",
            },
            {
              step: "4",
              title: "Launch & Train",
              text: "Onboarding, tech setup, and optional instructor training.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white shadow rounded-lg p-6 text-center hover:shadow-lg transition"
            >
              <div className="text-blue-800 font-bold text-2xl mb-2">
                {item.step}
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-green-50 py-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-green-800 font-medium">
            Every partner program launches with up-to-date SHSAT materials and
            guaranteed technical support during setup.
          </p>
        </div>
      </section>

      <section id="apply" className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Apply to Partner with Bell Curves
          </h2>
          
          {errors.general && (
            <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
              <p>{errors.general}</p>
            </div>
          )}
          
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded-lg p-6 space-y-4"
          >
            {/* Organization Name */}
            <div>
              <label htmlFor="organization" className="block font-semibold mb-1">
                Organization Name *
              </label>
              <input
                id="organization"
                name="organization"
                type="text"
                value={formData.organization}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full border ${errors.organization ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none`}
                placeholder="Enter your organization name"
                maxLength={100}
                required
              />
              {errors.organization && (
                <p className="text-red-500 text-sm mt-1">{errors.organization}</p>
              )}
            </div>

            {/* Contact Name */}
            <div>
              <label htmlFor="contactName" className="block font-semibold mb-1">
                Contact Name *
              </label>
              <input
                id="contactName"
                name="contactName"
                type="text"
                value={formData.contactName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full border ${errors.contactName ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none`}
                placeholder="Enter your full name"
                maxLength={100}
                required
              />
              {errors.contactName && (
                <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block font-semibold mb-1">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full border ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none`}
                placeholder="Enter your email address"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block font-semibold mb-1">
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full border ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none`}
                placeholder="Enter your phone number"
                maxLength={15}
                required
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block font-semibold mb-1">
                Website
              </label>
              <input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full border ${errors.website ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none`}
                placeholder="https://example.com (optional)"
                maxLength={200}
              />
              {errors.website && (
                <p className="text-red-500 text-sm mt-1">{errors.website}</p>
              )}
            </div>

            {/* Number of Students */}
            <div>
              <label htmlFor="students" className="block font-semibold mb-1">
                Number of Students You Expect to Serve
              </label>
              <input
                id="students"
                name="students"
                type="number"
                min="1"
                max="1000000"
                value={formData.students}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full border ${errors.students ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none`}
                placeholder="Enter expected number of students (optional)"
              />
              {errors.students && (
                <p className="text-red-500 text-sm mt-1">{errors.students}</p>
              )}
            </div>

            {/* Products Selection */}
            <div>
              <label className="block font-semibold mb-2">
                Desired Products *
              </label>
              <div className={`grid sm:grid-cols-2 gap-2 p-4 rounded-md border ${errors.products ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                {productsList.map((product) => (
                  <label key={product} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={formData.products.includes(product)}
                      onChange={() => handleCheckboxChange(product)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium">{product}</span>
                  </label>
                ))}
              </div>
              {errors.products && (
                <p className="text-red-500 text-sm mt-1">{errors.products}</p>
              )}
            </div>

            {/* Launch Date */}
            <div>
              <label htmlFor="launchDate" className="block font-semibold mb-1">
                Expected Launch Date
              </label>
              <input
                id="launchDate"
                name="launchDate"
                type="date"
                value={formData.launchDate}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full border ${errors.launchDate ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none`}
                min={new Date().toISOString().split('T')[0]} 
              />
              {errors.launchDate && (
                <p className="text-red-500 text-sm mt-1">{errors.launchDate}</p>
              )}
            </div>

            {/* Additional Notes */}
            <div>
              <label htmlFor="notes" className="block font-semibold mb-1">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full border ${errors.notes ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-vertical`}
                rows={4}
                maxLength={1000}
                placeholder="Any additional information about your requirements (optional)"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formData.notes.length}/1000 characters</span>
                {errors.notes && <span className="text-red-500">{errors.notes}</span>}
              </div>
            </div>

            {/* CAPTCHA Section */}
            <div className="border-t pt-4 mt-6">
              <label className="block font-semibold mb-2">
                CAPTCHA Verification *
              </label>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="flex flex-col items-center">
                  {isLoadingCaptcha ? (
                    <div 
                      className="bg-gray-200 animate-pulse rounded flex items-center justify-center border border-gray-300"
                      style={{ width: '280px', height: '90px' }}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-gray-500" />
                        <span className="text-xs text-gray-500">Loading CAPTCHA...</span>
                      </div>
                    </div>
                  ) : captchaImageUrl ? (
                    <img
                      src={captchaImageUrl}
                      alt="CAPTCHA verification"
                      className="border border-gray-300 rounded bg-white shadow-sm"
                      style={{ width: '280px', height: '90px' }}
                      onError={() => {
                        setErrors(prev => ({ ...prev, general: "CAPTCHA image failed to load. Please refresh." }));
                      }}
                    />
                  ) : (
                    <div 
                      className="bg-red-50 border border-red-300 rounded flex items-center justify-center"
                      style={{ width: '280px', height: '90px' }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-red-600 text-sm font-medium">Failed to load CAPTCHA</span>
                        <button
                          type="button"
                          onClick={loadCaptcha}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 disabled:text-gray-400"
                    disabled={isLoadingCaptcha}
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingCaptcha ? 'animate-spin' : ''}`} />
                    Refresh CAPTCHA
                  </button>
                </div>
                
                <div className="flex-1">
                  <input
                    type="text"
                    name="captchaInput"
                    value={formData.captchaInput}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter the text from the image"
                    className={`w-full border ${errors.captchaInput ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none`}
                    autoComplete="off"
                    maxLength={5}
                    required
                  />
                  {errors.captchaInput && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.captchaInput}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the 5-character code shown in the image above
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                type="submit"
                disabled={isSubmitting || isLoadingCaptcha || !captchaId}
                className={`${
                  isSubmitting || isLoadingCaptcha || !captchaId
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#1d99c6] hover:bg-[#1a7f9c]"
                } text-white font-semibold py-3 px-6 rounded-md flex-1 transition-all duration-300 flex items-center justify-center`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
            </div>

          </form>
        </div>
      </section>
    </div>
  );
};

export default WhiteLabelPage;