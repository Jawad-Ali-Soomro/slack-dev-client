import { useState, useEffect } from "react"
import { Mail, RefreshCw } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { authService } from "../services/authService"
import {
  AuthLayout,
  AuthButton,
  AuthOtpInput,
} from "../components/auth/AuthLayout"

const VerifyEmail = () => {
  const [otp, setOtp] = useState(["", "", "", ""])
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const storedEmail = localStorage.getItem("verificationEmail")
    const urlEmail = searchParams.get("email")
    const token = searchParams.get("token")

    if (storedEmail) {
      setEmail(storedEmail)
    } else if (urlEmail) {
      setEmail(urlEmail)
      localStorage.setItem("verificationEmail", urlEmail)
    } else if (token) {
      handleVerifyWithToken(token)
    } else {
      toast.error("No verification email found")
      navigate("/login")
    }
  }, [searchParams, navigate])

  const handleVerifyWithToken = async (token) => {
    try {
      setLoading(true)
      const result = await authService.verifyEmail(email, token)
      if (result.success) {
        toast.success("Email verified successfully!")
        localStorage.removeItem("verificationEmail")
        navigate("/dashboard")
      } else {
        toast.error(result.message || "Verification failed")
      }
    } catch (error) {
      console.error("Token verification error:", error)
      toast.error("Verification failed")
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value.replace(/\D/g, "")
    setOtp(newOtp)

    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleVerify = async () => {
    if (!email) {
      toast.error("No email found for verification")
      return
    }

    const otpCode = otp.join("")
    if (otpCode.length !== 4) {
      toast.error("Please enter the complete 4-digit code")
      return
    }

    try {
      setLoading(true)
      const result = await authService.verifyEmail(email, otpCode)

      if (result.success) {
        toast.success("Email verified successfully!")
        localStorage.removeItem("verificationEmail")
        navigate("/dashboard")
      } else {
        toast.error(result.message || "Invalid verification code")
      }
    } catch (error) {
      console.error("Verification error:", error)
      toast.error(error.message || "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!email) {
      toast.error("No email found for resending OTP")
      return
    }

    try {
      setResendLoading(true)
      const result = await authService.resendOtp(email)
      if (result.success) {
        toast.success("Verification code sent to your email")
      } else {
        toast.error(result.message || "Failed to resend code")
      }
    } catch (error) {
      console.error("Resend error:", error)
      toast.error("Failed to resend verification code")
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle={
        <>
          We sent a 4-digit code to{" "}
          <span className="text-theme-muted font-bold">
            {email}
          </span>
        </>
      }
      backTo="/login"
      backLabel="Back"
      badge="Verification"
      showBrand={true}
    >
      <div className="flex justify-center mb-2">
        <div className="w-14 h-14 rounded-2xl bg-theme-subtle border border-theme-subtle flex items-center justify-center">
          <Mail className="w-7 h-7 text-theme" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <AuthOtpInput
              key={index}
              id={`otp-${index}`}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
            />
          ))}
        </div>

        <AuthButton
          onClick={handleVerify}
          loading={loading}
          disabled={otp.join("").length !== 4}
        >
          Verify Email
        </AuthButton>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Didn't receive the code?
          </p>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendLoading}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-theme-muted hover:underline disabled:opacity-50"
          >
            {resendLoading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Sending...
              </>
            ) : (
              "Resend Code"
            )}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">
          Check your spam folder if you don't see the email
        </p>
      </div>
    </AuthLayout>
  )
}

export default VerifyEmail
