import { useEffect, useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import {
  AuthLayout,
  AuthButton,
  AuthDivider,
  AuthAltLink,
  AuthField,
  AuthInput,
} from "../components/auth/AuthLayout";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  document.title = "Welcome Back! Please Login";

  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await login(formData);

      if (result && result.success) {
        if (result.user && result.user.emailVerified) {
          toast.success(`Welcome Back ${result?.user?.username}!`);
          navigate("/dashboard");
        } else {
          localStorage.setItem("verificationEmail", formData.email);

          if (result.emailSent) {
            toast.info("Verification email sent!", {
              description: "Please check your email and verify to continue",
            });
          } else {
            toast.info("Email verification required", {
              description: "Please verify your email to continue",
            });
          }

          navigate("/verify-email");
        }
      } else {
        toast.error("Login failed", {
          description: result?.error || "Please check your credentials",
        });
      }
    } catch (error) {
      console.error("Login error caught:", error);
      toast.error("Login failed", {
        description: error.message || "Please check your credentials",
      });
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account"
      backTo="/"
      backLabel="Home"
      badge="Sign In"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          type="email"
          name="email"
          icon={Mail}
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
          required
        />

        <AuthField icon={Lock}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="auth-input w-full h-12 pl-10 pr-11 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </AuthField>

        <div className="flex items-center justify-end pt-1">
          <Link
            to="/forgot-password"
            className="text-xs font-bold uppercase tracking-wide text-theme-muted hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <AuthButton type="submit" loading={loading}>
          Sign In
        </AuthButton>
      </form>

      <AuthDivider />
      <AuthAltLink
        text="Don't have an account?"
        linkText="Register"
        to="/signup"
      />
    </AuthLayout>
  );
};

export default Login;
