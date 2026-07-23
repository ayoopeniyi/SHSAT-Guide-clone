import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { usePostHogAnalytics } from "../lib/posthog-analytics";
import { TrackedButton } from "../components/TrackedButton";

const getPasswordStrength = (password: string) => {
  let strength = 0;

  // Length check
  if (password.length >= 8) strength += 1;

  // Contains number
  if (/\d/.test(password)) strength += 1;

  // Contains lowercase
  if (/[a-z]/.test(password)) strength += 1;

  // Contains uppercase
  if (/[A-Z]/.test(password)) strength += 1;

  // Contains special character
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;

  return strength;
};

const getStrengthColor = (strength: number) => {
  switch (strength) {
    case 0:
    case 1:
      return "bg-red-500";
    case 2:
      return "bg-orange-500";
    case 3:
      return "bg-yellow-500";
    case 4:
      return "bg-green-500";
    case 5:
      return "bg-emerald-500";
    default:
      return "bg-gray-200";
  }
};

const getStrengthText = (strength: number) => {
  switch (strength) {
    case 0:
    case 1:
      return "Very Weak";
    case 2:
      return "Weak";
    case 3:
      return "Medium";
    case 4:
      return "Strong";
    case 5:
      return "Very Strong";
    default:
      return "";
  }
};

export default function Signup() {
  const navigate = useNavigate();
  const { signup, isLoading, error } = useAuthStore();
  const analytics = usePostHogAnalytics();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");

  const passwordStrength = getPasswordStrength(password);
  const strengthColor = getStrengthColor(passwordStrength);
  const strengthText = getStrengthText(passwordStrength);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (passwordStrength < 3) {
      toast.error("Please choose a stronger password");
      return;
    }

    try {
      await signup(email, password, name);
      
      // Track successful signup with analytics
      analytics.trackUserSignup('email_password', {
        signup_page: 'signup',
        password_strength: passwordStrength,
        name_provided: !!name
      });
      
      toast.success(
        "Account created successfully! Please check your email to verify your account.",
      );
      navigate("/login");
    } catch (err) {
      // Track signup error
      analytics.trackError('signup_failed', error || "Failed to create account", {
        email_provided: !!email,
        name_provided: !!name,
        password_strength: passwordStrength
      });
      
      toast.error(error || "Failed to create account");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Back Button */}
        <div className="flex justify-start">
          <TrackedButton
            trackingName="signup_back_button"
            trackingContext={{
              page: 'signup',
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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-brand-blue hover:text-brand-blue-dark"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                placeholder="Enter your full name"
              />
            </div>
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
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 pr-10"
                  placeholder="Create a password"
                  minLength={6}
                />
                <TrackedButton
                  trackingName="signup_password_visibility_toggle"
                  trackingContext={{
                    page: 'signup',
                    action: 'toggle_password_visibility',
                    field: 'password'
                  }}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center mt-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </TrackedButton>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strengthColor} transition-all duration-300`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 min-w-[80px]">
                      {strengthText}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Password must contain at least 8 characters, including
                    uppercase, lowercase, numbers, and special characters
                  </div>
                </div>
              )}
            </div>
            <div className="mb-4">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 pr-10"
                  placeholder="Confirm your password"
                  minLength={6}
                />
                <TrackedButton
                  trackingName="signup_confirm_password_visibility_toggle"
                  trackingContext={{
                    page: 'signup',
                    action: 'toggle_password_visibility',
                    field: 'confirm_password'
                  }}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center mt-1"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </TrackedButton>
              </div>
            </div>
          </div>

          <div>
            <TrackedButton
              trackingName="signup_submit_button"
              trackingContext={{
                page: 'signup',
                action: 'form_submit',
                form_type: 'signup',
                name_provided: !!name,
                email_provided: !!email,
                password_strength: passwordStrength
              }}
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Creating account...
                </div>
              ) : (
                "Create account"
              )}
            </TrackedButton>
          </div>
        </form>
      </div>
    </div>
  );
}
