import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { usePostHogAnalytics } from "../lib/posthog-analytics";
import { TrackedButton } from "../components/TrackedButton";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const analytics = usePostHogAnalytics();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password);
      
      // Track successful login with analytics
      analytics.trackUserLogin('email_password', {
        login_page: 'login',
        login_method: 'email_password'
      });
      
      toast.success("Login successful!");
      navigate("/teachers");
    } catch (err) {
      // Track login error
      analytics.trackError('login_failed', error || "Failed to login", {
        email_provided: !!email,
        password_provided: !!password
      });
      
      toast.error(error || "Failed to login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-start">
          <TrackedButton
            trackingName="login_back_button"
            trackingContext={{
              page: 'login',
              action: 'navigate_back',
              destination: 'home'
            }}
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </TrackedButton>
        </div>

        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/signup"
              className="font-medium text-brand-blue hover:text-brand-blue-dark"
            >
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <TrackedButton
              trackingName="login_submit_button"
              trackingContext={{
                page: 'login',
                action: 'form_submit',
                form_type: 'login',
                email_provided: !!email,
                password_provided: !!password
              }}
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </TrackedButton>
          </div>
        </form>
      </div>
    </div>
  );
}
