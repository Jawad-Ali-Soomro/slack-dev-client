import { createContext, useContext, useState, useEffect } from 'react'

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
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is logged in on app start
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
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUser = {
        id: 1,
        username: credentials.username || 'user',
        email: credentials.email,
        name: credentials.name || 'User'
      }
      
      const mockToken = 'mock-jwt-token-' + Date.now()
      
      // Store in localStorage
      localStorage.setItem('authToken', mockToken)
      localStorage.setItem('userData', JSON.stringify(mockUser))
      
      setUser(mockUser)
      setIsAuthenticated(true)
      
      return { success: true, user: mockUser }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock successful registration
      const mockUser = {
        id: Date.now(),
        username: userData.username,
        email: userData.email,
        name: userData.username
      }
      
      const mockToken = 'mock-jwt-token-' + Date.now()
      
      // Store in localStorage
      localStorage.setItem('authToken', mockToken)
      localStorage.setItem('userData', JSON.stringify(mockUser))
      
      setUser(mockUser)
      setIsAuthenticated(true)
      
      return { success: true, user: mockUser }
    } catch (error) {
      console.error('Registration failed:', error)
      return { success: false, error: 'Registration failed' }
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
    register,
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
