import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const userData = localStorage.getItem('userData')
      console.log(token, userData)
      
      if (token && userData) {
        setIsAuthenticated(true)
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      setLoading(true)
      console.log('Login attempt with credentials:', credentials);
      
      const result = await authService.login(credentials)
      console.log('Login result:', result);
      
      if (result.success) {
        // Store in localStorage only if we have a token (successful login)
        if (result.token) {
          localStorage.setItem('authToken', result.token)
          localStorage.setItem('userData', JSON.stringify(result.user))
          
          setUser(result.user)
          setIsAuthenticated(true)
        }
        
        // Return the full result including emailSent flag
        return { 
          success: true, 
          user: result.user, 
          emailSent: result.emailSent,
          message: result.message 
        }
      } else {
        return { success: false, error: result.message || 'Login failed' }
      }
      
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: error.message || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }


  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    setUser(null)
    setIsAuthenticated(false)
  }

  const forgotPassword = async (email) => {
    try {
      setLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return { success: true, message: 'Reset code sent to email' }
    } catch (error) {
      console.error('Forgot password failed:', error)
      return { success: false, error: 'Failed to send reset code' }
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async (otp) => {
    try {
      setLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock OTP verification (accept any 4-digit code)
      if (otp.length === 4) {
        return { success: true, message: 'OTP verified successfully' }
      } else {
        return { success: false, error: 'Invalid OTP' }
      }
    } catch (error) {
      console.error('OTP verification failed:', error)
      return { success: false, error: 'OTP verification failed' }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    forgotPassword,
    verifyOTP
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
