import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { Link } from "react-router-dom"

const ForgotPassword = () => {
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: Success
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  
  // Refs for OTP inputs
  const otpRefs = [useRef(), useRef(), useRef(), useRef()]

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setStep(2)
    }, 1500)
  }

  const handleOtpChange = (index, value) => {
    // Only allow single digit
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 3) {
      otpRefs[index + 1].current.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus()
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    const otpCode = otp.join("")
    
    if (otpCode.length !== 4) return
    
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setStep(3)
    }, 1500)
  }

  const handleResendOtp = () => {
    setOtp(["", "", "", ""])
    otpRefs[0].current.focus()
    // Simulate resend
    console.log("OTP resent to:", email)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-6">
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
        {/* Forgot Password Card */}
        <motion.div
          variants={itemVariants}
          className="glass-card p-8 rounded-2xl shadow-2xl border border-black dark:border-white"
        >
          {/* Back Button */}
          <motion.div variants={itemVariants} className="mb-6">
            <Link 
              to="/login" 
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              
            </Link>
          </motion.div>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div variants={itemVariants} className="mb-4">
              <img src="/logo.png" alt="logo" className="w-16 h-16 mx-auto" />
            </motion.div>
            <motion.h1 
              variants={itemVariants}
              className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
              style={{ fontWeight: 800 }}
            >
              {step === 1 && "Forgot Password"}
              {step === 2 && "Enter OTP"}
              {step === 3 && "Success!"}
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="text-gray-600 dark:text-gray-300"
              style={{ fontWeight: 800 }}
            >
              {step === 1 && "Enter your email to receive reset instructions"}
              {step === 2 && `We sent a 4-digit code to ${email}`}
              {step === 3 && "Password reset instructions sent successfully"}
            </motion.p>
          </div>

          {/* Step 1: Email Input */}
          {step === 1 && (
            <motion.form variants={itemVariants} onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline focus:outline-1 focus:outline-black focus:border-black dark:focus:outline-white dark:focus:border-white dark:bg-gray-800 dark:text-white"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-gray-200"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? "Sending..." : "Send Reset Code"}
              </motion.button>
            </motion.form>
          )}

          {/* Step 2: OTP Input */}
          {step === 2 && (
            <motion.form variants={itemVariants} onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 text-center">
                  Enter 4-Digit Code
                </label>
                <div className="flex justify-center space-x-4">
                  {otp.map((digit, index) => (
                    <div key={index} className="relative">
                      <input
                        ref={otpRefs[index]}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline focus:outline-1 focus:outline-black focus:border-black dark:focus:outline-white dark:focus:border-white dark:bg-gray-800 dark:text-white"
                        autoComplete="off"
                      />
                      {index < 3 && (
                        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-gray-400 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-sm text-black hover:text-gray-800 font-bold dark:text-white dark:hover:text-gray-200"
                >
                  Didn't receive code? Resend
                </button>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading || otp.join("").length !== 4}
                className="w-full py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-gray-200"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </motion.button>
            </motion.form>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <motion.div variants={itemVariants} className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              </motion.div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Check your email for password reset instructions.
              </p>

              <Link
                to="/login"
                className="inline-block w-full py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors text-center dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                Back to Login
              </Link>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ForgotPassword
