import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

const ComingSoon = () => {
  const location = useLocation();

  useEffect(() => {
    /* console.log(
      "Coming Soon: User attempted to access route:",
      location.pathname,
    ); */
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-100">
      <div className="text-center px-4 max-w-2xl">
        <div className="mb-8">
          <Clock className="w-16 h-16 mx-auto text-brand-blue animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Coming Soon</h1>
        <p className="text-xl text-gray-600 mb-6">
          We're working hard to bring you this feature. Stay tuned for updates!
        </p>
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
