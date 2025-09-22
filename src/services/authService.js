import axiosInstance from '../lib/axios'

export const authService = {
  // Register user
  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/api/auth/register', userData)
      console.log('AuthService register response:', response.data)
      return response.data
    } catch (error) {
      console.error('AuthService register error:', error)
      
      // Handle 400 errors (validation errors, duplicate email/username)
      if (error.response?.status === 400 && error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      
      // Handle 409 errors (conflict - duplicate data)
      if (error.response?.status === 409 && error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      
      // For other errors, throw them
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', credentials)
      console.log('AuthService login response:', response.data)
      
      if (response.data) {
        return {
          success: true,
          token: response.data.token,
          user: response.data.user,
          message: response.data.message,
          emailSent: response.data.emailSent || false
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Login failed'
        }
      }
    } catch (error) {
      console.error('AuthService login error:', error)
      
      // Handle 400 errors that might contain useful data
      if (error.response?.status === 400 && error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message
        }
      }
      
      // Handle 401 errors (invalid credentials)
      if (error.response?.status === 401 && error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message
        }
      }
      
      // For other errors, throw them
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  },

  // Verify email with OTP
  verifyEmail: async (email, otp) => {
    try {
      const response = await axiosInstance.post('/api/auth/verify-email', { email, otp })
      console.log('Verify email response:', response.data)
      
      if (response.data.message === 'email verified successfully') {
        return {
          success: true,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Verification failed'
        }
      }
    } catch (error) {
      console.error('Verify email error:', error)
      throw new Error(error.response?.data?.message || 'Verification failed')
    }
  },

  // Resend OTP
  resendOtp: async (email) => {
    try {
      const response = await axiosInstance.post('/api/auth/resend-otp', { email })
      console.log('Resend OTP response:', response.data)
      
      if (response.data.message) {
        return {
          success: true,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to resend code'
        }
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      throw new Error(error.response?.data?.message || 'Failed to resend code')
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await axiosInstance.post('/api/auth/forgot-password', { email })
      console.log('Forgot password response:', response.data)
      return response.data
    } catch (error) {
      console.error('Forgot password error:', error)
      throw new Error(error.response?.data?.message || 'Failed to send reset code')
    }
  },

  // Reset password
  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await axiosInstance.post('/api/auth/reset-password', { 
        email, 
        otp, 
        newPassword 
      })
      console.log('Reset password response:', response.data)
      return response.data
    } catch (error) {
      console.error('Reset password error:', error)
      throw new Error(error.response?.data?.message || 'Password reset failed')
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/api/auth/profile')
    return response.data
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('verificationEmail')
    window.location.href = '/login'
  }
}
