import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mail, ArrowLeft, RefreshCw } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { authService } from "../services/authService"

const VerifyEmail = () => {
  const [otp, setOtp] = useState(['', '', '', ''])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    // Get email from localStorage or URL params
    const storedEmail = localStorage.getItem('verificationEmail')
    const urlEmail = searchParams.get('email')
    const token = searchParams.get('token')
    
    if (storedEmail) {
      setEmail(storedEmail)
    } else if (urlEmail) {
      setEmail(urlEmail)
      localStorage.setItem('verificationEmail', urlEmail)
    } else if (token) {
      // If token is in URL, we can verify directly
      handleVerifyWithToken(token)
    } else {
      // No email found, redirect to login
      toast.error('No verification email found')
      navigate('/login')
    }
  }, [searchParams, navigate])

  const handleVerifyWithToken = async (token) => {
    try {
      setLoading(true)
      const result = await authService.verifyEmail(email, token)
      if (result.success) {
        toast.success('Email verified successfully!')
        localStorage.removeItem('verificationEmail')
        navigate('/dashboard')
      } else {
        toast.error(result.message || 'Verification failed')
      }
    } catch (error) {
      console.error('Token verification error:', error)
      toast.error('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return // Prevent multiple characters
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleVerify = async () => {
    if (!email) {
      toast.error('No email found for verification')
      return
    }

    const otpCode = otp.join('')
    if (otpCode.length !== 4) {
      toast.error('Please enter the complete 4-digit code')
      return
    }

    try {
      setLoading(true)
      console.log('Verifying email:', email, 'with OTP:', otpCode)
      
      const result = await authService.verifyEmail(email, otpCode)
      console.log('Verification result:', result)
      
      if (result.success) {
        toast.success('Email verified successfully!')
        localStorage.removeItem('verificationEmail')
        navigate('/dashboard')
      } else {
        toast.error(result.message || 'Invalid verification code')
      }
    } catch (error) {
      console.error('Verification error:', error)
      toast.error(error.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!email) {
      toast.error('No email found for resending OTP')
      return
    }

    try {
      setResendLoading(true)
      const result = await authService.resendOtp(email)
      if (result.success) {
        toast.success('Verification code sent to your email')
      } else {
        toast.error(result.message || 'Failed to resend code')
      }
    } catch (error) {
      console.error('Resend error:', error)
      toast.error('Failed to resend verification code')
    } finally {
      setResendLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-orb w-96 h-96 top-10 left-10 opacity-20"></div>
        <div className="floating-orb w-64 h-64 top-1/3 right-20 opacity-15" style={{animationDelay: '2s'}}></div>
        <div className="floating-orb w-80 h-80 bottom-20 left-1/4 opacity-20" style={{animationDelay: '4s'}}></div>
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Verification Card */}
        <motion.div
          variants={itemVariants}
          className="p-5 md:p-8 md:shadow-2xl md:border-gray-300 md:rounded-[20px] md:dark:border-gray-700 md:border"
        >
          {/* Back Button */}
          <motion.div variants={itemVariants} className="mb-6">
            <Link 
              to="/login" 
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4 icon" />
            </Link>
          </motion.div>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div variants={itemVariants} className="mb-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-white rounded-[10px] flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-black" />
              </div>
            </motion.div>
            <motion.h1 
              variants={itemVariants}
              className="text-3xl  text-gray-900 dark:text-white mb-2"
              style={{ fontWeight: 800 }}
            >
              Verify Your Email
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="text-gray-600 dark:text-gray-300"
              style={{ fontWeight: 600 }}
            >
              We've sent a 4-digit code to
            </motion.p>
            <motion.p 
              variants={itemVariants}
              className="text-orange-500 dark:text-orange-400 "
              style={{ fontWeight: 800 }}
            >
              {email}
            </motion.p>
          </div>

          {/* OTP Input */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-20 h-20 text-center text-xl  border border-gray-200 dark:border-gray-700 rounded-[10px] focus:outline-none focus:border-blue-500 dark:bg-[#111827] dark:text-white"
                />
              ))}
            </div>

            {/* Verify Button */}
            <motion.button
              onClick={handleVerify}
              disabled={loading || otp.join('').length !== 4}
                className="w-full py-3 bg-black dark:bg-white font-bold text-white dark:text-black rounded-[10px]  transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </motion.button>

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResendOtp}
                disabled={resendLoading}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300  text-sm disabled:opacity-50"
              >
                {resendLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 icon animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Resend Code"
                )}
              </button>
            </div>
          </motion.div>

          {/* Help Text */}
          <motion.div variants={itemVariants} className="mt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Check your spam folder if you don't see the email
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default VerifyEmail
