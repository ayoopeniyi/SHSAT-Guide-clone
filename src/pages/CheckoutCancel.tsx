import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { verifyCheckoutSuccess } from "@/lib/api";
import { XCircle, ShoppingBag, Home, RotateCcw, AlertCircle } from "lucide-react";

interface ProductDetails {
  name: string;
  description: string;
  amount: number;
  currency: string;
  images: string[];
}

// Sad Animation Component
const SadFaceAnimation = () => {
  return (
    <div className="relative">
      <div className="w-32 h-32 mx-auto mb-6 animate-shake">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Face circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="#FEF3C7"
            stroke="#F59E0B"
            strokeWidth="3"
            className="animate-pulse-soft"
          />
          
          {/* Left eye */}
          <circle cx="35" cy="40" r="4" fill="#F59E0B" className="animate-blink" />
          
          {/* Right eye */}
          <circle cx="65" cy="40" r="4" fill="#F59E0B" className="animate-blink" />
          
          {/* Sad mouth */}
          <path
            d="M 30 65 Q 50 55 70 65"
            stroke="#F59E0B"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Tear drop */}
          <ellipse
            cx="35"
            cy="50"
            rx="3"
            ry="8"
            fill="#3B82F6"
            opacity="0.6"
            className="animate-tear"
          />
        </svg>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        
        @keyframes tear {
          0% { transform: translateY(0); opacity: 0.6; }
          100% { transform: translateY(15px); opacity: 0; }
        }
        
        @keyframes pulse-soft {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        .animate-shake {
          animation: shake 2s ease-in-out infinite;
        }
        
        .animate-blink {
          animation: blink 4s ease-in-out infinite;
        }
        
        .animate-tear {
          animation: tear 2s ease-in-out infinite;
        }
        
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Floating particles for background
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 });
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((_, i) => {
        const randomLeft = Math.random() * 100;
        const randomDelay = Math.random() * 5;
        const randomDuration = 10 + Math.random() * 10;
        const randomSize = 4 + Math.random() * 8;
        
        return (
          <div
            key={i}
            className="absolute rounded-full bg-yellow-200 opacity-20 animate-float"
            style={{
              left: `${randomLeft}%`,
              bottom: '-10px',
              width: `${randomSize}px`,
              height: `${randomSize}px`,
              animationDelay: `${randomDelay}s`,
              animationDuration: `${randomDuration}s`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.2;
          }
          90% {
            opacity: 0.2;
          }
          100% {
            transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
};

const CheckoutCancel = () => {
  const location = useLocation();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isFree = params.get("free") === "true";
    const sessionId = params.get("session_id");

    const loadProductDetails = async () => {
      try {
        if (isFree) {
          const productName = params.get("product_name");
          const productDescription = params.get("product_description");
          const unitAmount = params.get("unit_amount");
          const currency = params.get("currency");
          const productImages = params.get("product_images");

          if (productName) {
            setProduct({
              name: decodeURIComponent(productName),
              description: productDescription
                ? decodeURIComponent(productDescription)
                : "",
              amount: unitAmount ? parseInt(unitAmount) / 100 : 0,
              currency: currency || "usd",
              images: productImages ? JSON.parse(productImages) : [],
            });
          }
        } else if (sessionId) {
          const result = await verifyCheckoutSuccess(sessionId);
          // Set product from result if available
        }
      } catch (err) {
        console.error("Error loading product details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProductDetails();
  }, [location]);

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-200 border-t-yellow-600"></div>
        <p className="mt-6 text-lg text-gray-700 font-medium">Loading...</p>
      </main>
    );
  }

  return (
    <>
      <FloatingParticles />
      
      <section className="relative min-h-screen py-12 px-4 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Animated Icon */}
          <div className="text-center mb-8 animate-fade-in">
            <SadFaceAnimation />
            
            <h1 className="text-4xl font-bold text-gray-900 mb-3 animate-slide-down">
              Payment Cancelled
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto animate-slide-down" style={{ animationDelay: '0.1s' }}>
              Don't worry! You haven't been charged. Your cart is still waiting for you.
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 animate-slide-up">
            <div className="h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"></div>
            <div className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    What happened?
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    Your checkout session was cancelled. This could be because you clicked the back button, 
                    closed the payment window, or chose to cancel the transaction. No payment has been processed.
                  </p>
                </div>
              </div>

              {/* Product Details */}
              {product && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-gray-600" />
                    Product You Were Purchasing
                  </h3>
                  
                  <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {product.images.length > 0 && (
                        <div className="flex-shrink-0">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-32 h-32 object-cover rounded-xl shadow-md"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">
                          {product.name}
                        </h4>
                        {product.description && (
                          <p className="text-gray-600 mb-4">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-gray-900">
                            ${product.amount.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 uppercase">
                            {product.currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Tips */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  💡 Quick Tips
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Make sure you have sufficient funds in your account</li>
                  <li>• Check that your card details are correct</li>
                  <li>• Try using a different payment method</li>
                  <li>• Contact your bank if the issue persists</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              to="/products"
              className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 text-center shadow-lg flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              Try Again
            </Link>
            <Link
              to="/"
              className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 text-center shadow-lg flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Back to Homepage
            </Link>
          </div>

          {/* Support Section */}
          {/* <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <p className="text-gray-600 mb-2">Need help with your purchase?</p>
            <Link
              to="/contact"
              className="text-orange-600 hover:text-orange-700 font-medium underline decoration-2 underline-offset-4"
            >
              Contact our support team
            </Link>
          </div> */}
        </div>
      </section>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </>
  );
};

export default CheckoutCancel;