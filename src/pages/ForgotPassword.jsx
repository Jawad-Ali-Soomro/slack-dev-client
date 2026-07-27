import { useState, useRef } from "react";
import { Mail, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "../services/authService";
import {
  AuthLayout,
  AuthButton,
  AuthField,
  AuthInput,
  AuthOtpInput,
} from "../components/auth/AuthLayout";

const STEP_TITLES = {
  1: "Forgot Password",
  2: "Enter OTP",
  3: "New Password",
  4: "All Done!",
};

const STEP_SUBTITLES = {
  1: "Enter your email to receive reset instructions",
  2: (email) => `We sent a 4-digit code to ${email}`,
  3: "Create a strong new password for your account",
  4: "Your password has been reset successfully",
};

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await authService.forgotPassword(email);

      if (result.message === "password reset code sent to email") {
        toast.success("Reset code sent!", {
          description: "Please check your email for the reset code",
        });
        setStep(2);
      } else {
        toast.error("Failed to send reset code", {
          description: result.message || "Please try again",
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Failed to send reset code", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, "");
    setOtp(newOtp);

    if (value && index < 3) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 4) {
      toast.error("Please enter the complete 4-digit code");
      return;
    }

    setIsLoading(true);

    try {
      toast.success("OTP verified!", {
        description: "Now enter your new password",
      });
      setStep(3);
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error("Verification failed", {
        description: error.message || "Please check your code and try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const result = await authService.forgotPassword(email);
      if (result.message === "password reset code sent to email") {
        toast.success("Reset code resent!", {
          description: "Please check your email for the new code",
        });
        setOtp(["", "", "", ""]);
        otpRefs[0].current.focus();
      } else {
        toast.error("Failed to resend code", {
          description: result.message || "Please try again",
        });
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("Failed to resend code", {
        description: error.message || "Please try again",
      });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure both passwords are the same",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password too short", {
        description: "Password must be at least 6 characters",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.resetPassword(
        email,
        otp.join(""),
        newPassword,
      );

      if (result.message === "password reset successfully") {
        toast.success("Password reset successful!", {
          description: "You can now login with your new password",
        });
        setStep(4);
      } else {
        toast.error("Password reset failed", {
          description: result.message || "Please try again",
        });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Password reset failed", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subtitle = step === 2 ? STEP_SUBTITLES[2](email) : STEP_SUBTITLES[step];

  return (
    <AuthLayout
      title={STEP_TITLES[step]}
      subtitle={subtitle}
      backTo="/login"
      backLabel="Sign In"
      badge="Reset Password"
      showBrand={step !== 5}
      steps={4}
      currentStep={step - 1}
    >
      {step === 1 && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <AuthInput
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          <AuthButton type="submit" loading={isLoading}>
            Send Reset Code
          </AuthButton>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <AuthOtpInput
                key={index}
                inputRef={otpRefs[index]}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
              />
            ))}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              className="text-xs font-bold uppercase tracking-wide text-theme-muted hover:underline"
            >
              Didn't receive code? Resend
            </button>
          </div>

          <AuthButton
            type="submit"
            loading={isLoading}
            disabled={otp.join("").length !== 4}
          >
            Verify Code
          </AuthButton>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <AuthField icon={Lock}>
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="auth-input w-full h-12 pl-10 pr-11 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400"
              placeholder="Enter new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </AuthField>

          <AuthField icon={Lock}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input w-full h-12 pl-10 pr-11 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400"
              placeholder="Confirm new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </AuthField>

          <AuthButton
            type="submit"
            loading={isLoading}
            disabled={!newPassword || !confirmPassword}
          >
            Reset Password
          </AuthButton>
        </form>
      )}

      {step === 4 && (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            You can now sign in with your new password.
          </p>

          <Link
            to="/login"
            className="auth-btn-primary inline-block w-full py-3.5 rounded-xl font-bold uppercase text-sm tracking-wide text-center"
          >
            Back to Sign In
          </Link>
        </div>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
