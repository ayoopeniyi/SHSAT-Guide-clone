import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { verifyCheckoutSuccess, getTransaction } from "@/lib/api";
import { CheckCircle, Clock, XCircle, Package, MapPin, Phone, Mail, User } from "lucide-react";

interface TransactionDetails {
  transaction_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  product_name: string;
  price: number;
  status: "pending" | "completed" | "cancelled";
  stripe_session_id?: string;
  address_id: string;
  created_at: string;
  updated_at: string;
}

interface Address {
  address_id: string;
  user_id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone_number: string;
  is_default: boolean;
  name?: string;
  created_at: string;
  updated_at: string;
}

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://eznnseebbi.execute-api.ap-southeast-2.amazonaws.com/dev";

const getUserAddresses = async (email: string, address_id: string): Promise<Address> => {
  const response = await fetch(`${API_URL}/addresses/${email}/${address_id}`);
  if (!response.ok) throw new Error("Failed to fetch addresses");
  return response.json();
};

// Confetti Component
const Confetti = () => {
  const confettiCount = 50;
  const confettiPieces = Array.from({ length: confettiCount });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {confettiPieces.map((_, i) => {
        const randomLeft = Math.random() * 100;
        const randomDelay = Math.random() * 3;
        const randomDuration = 3 + Math.random() * 2;
        const randomRotation = Math.random() * 360;
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        return (
          <div
            key={i}
            className="absolute w-3 h-3 animate-confetti"
            style={{
              left: `${randomLeft}%`,
              top: '-10px',
              backgroundColor: randomColor,
              animationDelay: `${randomDelay}s`,
              animationDuration: `${randomDuration}s`,
              transform: `rotate(${randomRotation}deg)`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
};

const CheckoutSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [hasVerified, setHasVerified] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // console.log("Transaction:", transaction);

  // Fetch addresses after transaction success
  useEffect(() => {
    if (transaction?.user_email && transaction?.address_id) {
    setAddressLoading(true);
    getUserAddresses(transaction.user_email, transaction.address_id)
      .then((address) => {
        // Wrap single address in array for consistent handling
        setAddresses([address]);
      })
      .catch((error) => {
        // console.error('Error loading address:', error);
        toast({
          title: "Error",
          description: "Could not load delivery address",
          variant: "destructive",
        });
      })
      .finally(() => setAddressLoading(false));
  }
}, [transaction?.user_email, transaction?.address_id, toast]);

  // Payment verification logic
// Payment verification logic
// Payment verification logic
useEffect(() => {
  const checkPaymentStatus = async () => {
    if (hasVerified) return;
    try {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get("session_id");
      const transactionId = params.get("transaction_id");
      const isFree = params.get("free") === "true";
      const productName = params.get("product_name");

      if (!sessionId && !isFree) {
        setLoading(false);
        setHasVerified(true);
        return;
      }

      let formattedTransaction: TransactionDetails;
      
      if (isFree) {
        // Free product - returns TransactionResponse directly
        const result = await getTransaction(transactionId as string);
        // console.log('Free product result:', result);
        
        formattedTransaction = {
          transaction_id: result.transaction_id,
          user_id: result.user_id,
          user_name: result.user_name,
          user_email: result.user_email,
          product_name: result.product_name,
          price: result.price || 0,
          address_id: result.address_id,
          status: result.status as "pending" | "completed" | "cancelled",
          stripe_session_id: result.stripe_session_id || "free",
          created_at: result.created_at,
          updated_at: result.updated_at,
        };
      } else {
        // Paid product - returns VerifyCheckoutResponse with nested transaction
        const result = await verifyCheckoutSuccess(sessionId as string);
        // console.log('Paid product result:', result);
        
        formattedTransaction = {
          transaction_id: result.transaction.transaction_id,
          user_id: result.transaction.user_id,
          user_name: result.transaction.user_name,
          user_email: result.transaction.user_email || result.session.customer_email,
          product_name: result.transaction.product_name,
          price: result.transaction.price || result.session.amount_total,
          address_id: result.transaction.address_id,
          status: result.transaction.status as "pending" | "completed" | "cancelled",
          stripe_session_id: result.transaction.stripe_session_id || sessionId || "",
          created_at: result.transaction.created_at,
          updated_at: result.transaction.updated_at,
        };
      }

      // console.log('Formatted transaction:', formattedTransaction);

      setTransaction(formattedTransaction);
      
      // Show confetti only for completed transactions
      if (formattedTransaction.status === "completed") {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      
      setLoading(false);
      setHasVerified(true);
    } catch (error) {
      // console.error('Error in checkPaymentStatus:', error);
      setLoading(false);
      setHasVerified(true);
    }
  };
  if (loading) checkPaymentStatus();
}, [location, loading, hasVerified]);

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-600 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        </div>
        <p className="mt-6 text-lg text-gray-700 font-medium">Verifying your payment...</p>
        <p className="mt-2 text-sm text-gray-500">Please wait a moment</p>
      </main>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          icon: CheckCircle,
          title: "Payment Successful!",
          subtitle: "Your order has been confirmed",
          bgGradient: "from-green-50 via-emerald-50 to-teal-50",
          iconColor: "text-green-600",
          iconBg: "bg-green-100",
          borderColor: "border-green-200",
          accentColor: "bg-green-600"
        };
      case "pending":
        return {
          icon: Clock,
          title: "Payment Pending",
          subtitle: "We're processing your payment",
          bgGradient: "from-yellow-50 via-orange-50 to-amber-50",
          iconColor: "text-yellow-600",
          iconBg: "bg-yellow-100",
          borderColor: "border-yellow-200",
          accentColor: "bg-yellow-600"
        };
      case "cancelled":
        return {
          icon: XCircle,
          title: "Payment Cancelled",
          subtitle: "Your transaction was not completed",
          bgGradient: "from-red-50 via-pink-50 to-rose-50",
          iconColor: "text-red-600",
          iconBg: "bg-red-100",
          borderColor: "border-red-200",
          accentColor: "bg-red-600"
        };
      default:
        return {
          icon: Package,
          title: "Order Received",
          subtitle: "Thank you for your purchase",
          bgGradient: "from-blue-50 via-indigo-50 to-purple-50",
          iconColor: "text-blue-600",
          iconBg: "bg-blue-100",
          borderColor: "border-blue-200",
          accentColor: "bg-blue-600"
        };
    }
  };

  const statusConfig = transaction ? getStatusConfig(transaction.status) : getStatusConfig("completed");
  const StatusIcon = statusConfig.icon;

  return (
    <>
      {showConfetti && <Confetti />}
      
      <section className={`min-h-screen py-12 px-4 bg-gradient-to-br ${statusConfig.bgGradient}`}>
        <div className="max-w-4xl mx-auto">
          {/* Status Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${statusConfig.iconBg} mb-4 animate-bounce-in`}>
              <StatusIcon className={`w-10 h-10 ${statusConfig.iconColor}`} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {statusConfig.title}
            </h1>
            <p className="text-lg text-gray-600">{statusConfig.subtitle}</p>
          </div>

          {/* Transaction Details */}
          {transaction && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 animate-slide-up">
              <div className={`h-2 ${statusConfig.accentColor}`}></div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Package className="w-6 h-6 text-gray-600" />
                  <h2 className="text-2xl font-semibold text-gray-900">Order Details</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Product Name</p>
                      <p className="text-lg font-semibold text-gray-900">{transaction.product_name}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Amount Paid</p>
                      <p className="text-3xl font-bold text-gray-900">
                        ${transaction.price}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Status</p>
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusConfig.iconBg} ${statusConfig.iconColor}`}>
                        <StatusIcon className="w-4 h-4" />
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Customer</p>
                      <p className="text-sm font-medium text-gray-900">{transaction.user_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{transaction.user_email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className={`h-2 ${statusConfig.accentColor}`}></div>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-gray-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Delivery Address</h2>
              </div>

              {addressLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
                  <p className="ml-3 text-gray-500">Loading addresses...</p>
                </div>
              ) : addresses.length > 0 ? (
                <div className="grid gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.address_id}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        addr.is_default
                          ? `${statusConfig.borderColor} bg-gradient-to-br from-white to-gray-50`
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-lg font-semibold text-gray-900 mb-1">
                            {addr.name || "No name"}
                          </p>
                          {addr.is_default && (
                            <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full ${statusConfig.iconBg} ${statusConfig.iconColor} font-medium`}>
                              <CheckCircle className="w-3 h-3" />
                              Default Address
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-gray-700">
                        <p className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-1 text-gray-400 flex-shrink-0" />
                          <span>
                            {addr.address_line1}
                            {addr.address_line2 && <>, {addr.address_line2}</>}
                          </span>
                        </p>
                        <p className="ml-6">
                          {addr.city}, {addr.state} {addr.postal_code}
                        </p>
                        <p className="ml-6 font-medium">{addr.country}</p>
                        <p className="flex items-center gap-2 ml-6">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {addr.phone_number}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No addresses found</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              to="/"
              className={`px-8 py-4 ${statusConfig.accentColor} text-white rounded-xl font-semibold hover:opacity-90 transition-all transform hover:scale-105 text-center shadow-lg`}
            >
              Return to Homepage
            </Link>

          </div>
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
        
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </>
  );
};

export default CheckoutSuccess;