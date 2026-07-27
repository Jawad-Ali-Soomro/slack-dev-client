import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "../services/authService";
import { PiUserDuotone } from "react-icons/pi";
import {
  AuthLayout,
  AuthButton,
  AuthDivider,
  AuthAltLink,
  AuthField,
  AuthInput,
} from "../components/auth/AuthLayout";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  document.title = "Hello There! Please Register";

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const result = await authService.register(formData);

      if (result.message === "user registered successfully") {
        localStorage.setItem("verificationEmail", formData.email);
        toast.info("Account created successfully!", {
          description: "Please check your email for verification code",
        });
        navigate("/verify-email");
      } else {
        toast.error("Registration failed", {
          description: result.message || "Please try again",
        });
      }
    } catch (error) {
      toast.error("Registration failed", {
        description: error.message || "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Get On Board"
      subtitle="Join thousands of developers building better"
      backTo="/login"
      backLabel="Sign In"
      badge="Register"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          type="text"
          name="username"
          icon={PiUserDuotone}
          value={formData.username}
          onChange={handleInputChange}
          placeholder="Choose a username"
          required
        />

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
            placeholder="Create a password"
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

        <AuthButton type="submit" loading={loading}>
          Create Account
        </AuthButton>
      </form>

      <AuthDivider />
      <AuthAltLink
        text="Already have an account?"
        linkText="Sign In"
        to="/login"
      />
    </AuthLayout>
  );
};

export default Signup;
