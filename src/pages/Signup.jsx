import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { authService } from "../services/authService"
import { Input } from "../components/ui/input"

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user"
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    
    try {
      setLoading(true)
      const result = await authService.register(formData)
      console.log('Registration result:', result)
      
      if (result.message === 'user registered successfully') {
        localStorage.setItem('verificationEmail', formData.email)
        toast.info('Account created successfully!', {
          description: 'Please check your email for verification code',
        })
        navigate('/verify-email')
      } else {
        setError(result.message || 'Registration failed')
        toast.error('Registration failed', {
          description: result.message || 'Please try again',
        })
      }
    } catch (error) {
      setError(error.message || 'Registration failed')
      toast.error('Registration failed', {
        description: error.message || 'Please try again',
      })
    } finally {
      setLoading(false)
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
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-6">
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
        {/* Signup Card */}
        <motion.div
          variants={itemVariants}
          className="p-5 md:p-8 md:shadow-2xl md:border-gray-300 md:rounded-[10px] md:dark:border-gray-700 md:border"
        >
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
              Register
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="text-gray-600 dark:text-gray-300"
              style={{ fontWeight: 800 }}
            >
              Join thousands of developers
            </motion.p>
          </div>

          {/* Error Message */}
        

          {/* Signup Form */}
          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 icon" />
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute icon left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-[10px] focus:outline focus:outline-1 focus:outline-gray-300 focus:border-gray-100 dark:focus:outline-[rgba(255,255,255,.2)] dark:focus:border-[rgba(255,255,255,.1)] dark:bg-black dark:text-white"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 icon transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-[10px] focus:outline focus:outline-1 focus:outline-gray-300 focus:border-gray-100 dark:focus:outline-[rgba(255,255,255,.2)] dark:focus:border-[rgba(255,255,255,.1)] dark:bg-black dark:text-white"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Signup Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-[10px] font-bold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-gray-200"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? "Registering Account..." : "Register"}
            </motion.button>
          </motion.form>

          <motion.div variants={itemVariants} className="relative mb-6 mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[rgba(255, 255, 255, 0.1)] dark:bg-black text-gray-500 uppercase">Or</span>
            </div>
          </motion.div>

          {/* Login Link */}
          <motion.div variants={itemVariants} className="text-center mt-6">
            <p className="text-gray-600 dark:text-gray-300">
              Already have an account?{" "}
              <Link to="/login" className="text-black hover:text-gray-800 font-bold dark:text-white dark:hover:text-gray-200">
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.div>


      </motion.div>
    </div>
  )
}

export default Signup
