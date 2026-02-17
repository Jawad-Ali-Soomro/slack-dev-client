import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, ArrowLeft, X } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [error, setError] = useState("")
  
  const { login, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError("")
  }

  const handleSubmit = async () => {
    setError("")
    
    try {
      const result = await login(formData)
      
      if (result && result.success) {
        
        if (result.user && result.user.emailVerified) {
          toast.success("Login successful!", {
            description: "Welcome back to your dashboard",
          })
          navigate('/dashboard')
        } else {
          localStorage.setItem('verificationEmail', formData.email)
          
          if (result.emailSent) {
            toast.info("Verification email sent!", {
              description: "Please check your email and verify to continue",
            })
          } else {
            toast.info("Email verification required", {
              description: "Please verify your email to continue",
            })
          }
          
          navigate('/verify-email')
        }
      } else {
        setError(result?.error || 'Login failed')
        toast.error("Login failed", {
          description: result?.error || 'Please check your credentials',
        })
      }
    } catch (error) {
      console.error('Login error caught:', error)
      setError(error.message || 'Login failed')
      toast.error("Login failed", {
        description: error.message || 'Please check your credentials',
      })
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
        className="w-full max-w-md relative z-10 shadow-sm"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Login Card */}
        <motion.div
          variants={itemVariants}
          className="p-5 md:p-8 shadow-2xl md:rounded-[10px] md:dark:border-gray-700"
        >


<motion.div variants={itemVariants} className="mb-6">
            
          </motion.div>
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div variants={itemVariants} className="mb-4" onClick={() => navigate('/')}>
              <img src="/logo.png" alt="logo" className="w-16 h-16 mx-auto cursor-pointer" />
            </motion.div>
            <motion.h1 
              variants={itemVariants}
              className="text-2xl  text-gray-900 dark:text-white mb-2 font-black"
              style={{fontWeight: 700}}
            >
              Welcome Back
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="text-gray-600 dark:text-gray-300 text-sm font-bold"
              style={{fontWeight: 600}}
            >
              Sign in to your account
            </motion.p>
          </div>

          

          {/* Social Login */}
          {/* <motion.div variants={itemVariants} className="space-y-3 mb-6">
            <button className="w-full flex items-center justify-center gap-3 py-3 px-4  border-gray-200 dark:border-gray-700 rounded-[10px] hover:bg-gray-50 dark:hover:bg-black transition-colors">
              <Chrome className="w-5 h-5 icon" />
              <span className="">Continue with Google</span>
            </button>
            <button className="w-full flex items-center justify-center gap-3 py-3 px-4  border-gray-200 dark:border-gray-700 rounded-[10px] hover:bg-gray-50 dark:hover:bg-black transition-colors">
              <Github className="w-5 h-5 icon" />
              <span className="">Continue with GitHub</span>
            </button>
          </motion.div> */}

          {/* Divider */}
        


          {/* Login Form */}
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
            {/* Email Input */}
            <div>
           
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform icon -translate-y-1/2 text-gray-400 w-5 h-5 icon" />
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                 placeholder="Enter your email"
                    className="w-full pl-10 h-12 border-gray-200 dark:border-gray-700   bg-white dark:bg-transparent text-black dark:text-white"s
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
            
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform icon -translate-y-1/2 text-gray-400 w-5 h-5 icon" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 h-12 border-gray-200 dark:border-gray-700   bg-white dark:bg-transparent text-black dark:text-white"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 icon" /> : <Eye className="w-5 h-5 icon" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-end">
              
              <Link to="/forgot-password" className="text-sm text-black hover:text-gray-800 dark:text-white dark:hover:text-gray-200">
                Forgot password?
              </Link>
            </div>


            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white uppercase rounded-[10px] font-bold  hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-gray-200"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? <div className="loader"></div> : "Sign In"}
            </motion.button>
          </form>
          <motion.div variants={itemVariants} className="relative mb-6 mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[rgba(255, 255, 255, 0.1)] dark:bg-black text-gray-500 uppercase">Or</span>
            </div>
          </motion.div>

          {/* Sign Up Link */}
          <motion.div variants={itemVariants} className="text-end mt-6 uppercase">
            <p className="text-gray-600 dark:text-gray-300">
              {/* don't have an account{" "} */}
              <Link to="/signup" className="px-15 dark:bg-white dark:text-black ml-3 py-4 font-bold rounded-[20px] text-white bg-black  text-sm uppercase ">
                Register
              </Link>
            </p>
          </motion.div>
        </motion.div>
         <motion.div className="max-w-[80%] text-center ml-[10%]">
        <p className="text-gray-400 ">By Clicking On <span className="text-black dark:text-white">Login</span> You Agree To Our <span className="text-black dark:text-white">Terms & Conditions!</span></p>
      </motion.div>
        
      </motion.div>
    </div>
  )
}

export default Login
