import axiosInstance from '../lib/axios'

export const authService = {

  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/api/auth/register', userData)
      console.log('AuthService register response:', response.data)
      return response.data
    } catch (error) {
      console.error('AuthService register error:', error)

      if (error.response?.status === 400 && error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }

      if (error.response?.status === 409 && error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }

      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  },

  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', credentials)
      
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

      if (error.response?.status === 400 && error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message
        }
      }

      if (error.response?.status === 401 && error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message
        }
      }

      throw new Error(error.response?.data?.message || 'Login failed')
    }
  },

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

  getCurrentUser: async () => {
    const response = await axiosInstance.get('/api/auth/profile')
    return response.data
  },

  logout: async () => {
    try {
      const response = await axiosInstance.post('/api/auth/logout')
      return response.data
    } catch (error) {
      console.error('Logout error:', error)
      throw new Error(error.response?.data?.message || 'Logout failed')
    }
  },

  createUser: async (userData) => {
    try {
      const response = await axiosInstance.post('/api/auth/register', userData)
      return response.data
    } catch (error) {
      console.error('AuthService createUser error:', error)
      throw new Error(error.response?.data?.message || 'Failed to create user')
    }
  }
}
