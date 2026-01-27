import axios from '../lib/axios'

const subscriptionService = {

  getSubscription: async () => {
    try {
      const response = await axios.get('/api/subscriptions/me')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getPlans: async () => {
    try {
      const response = await axios.get('/api/subscriptions/plans')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getUsage: async () => {
    try {
      const response = await axios.get('/api/subscriptions/usage')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  checkFeatureAccess: async (feature, currentCount = 0) => {
    try {
      const response = await axios.post('/api/subscriptions/check-access', {
        feature,
        currentCount
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  startTrial: async (plan) => {
    try {
      const response = await axios.post('/api/subscriptions/trial', { plan })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  updateUsage: async (feature, increment = 1) => {
    try {
      const response = await axios.post('/api/subscriptions/update-usage', {
        feature,
        increment
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  createCheckoutSession: async (plan, billingCycle = 'monthly') => {
    try {
      const response = await axios.post('/api/payments/checkout', {
        plan,
        billingCycle
      })
      console.log(plan, billingCycle);
      
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  cancelSubscription: async () => {
    try {
      const response = await axios.post('/api/subscriptions/cancel')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  reactivateSubscription: async () => {
    try {
      const response = await axios.post('/api/subscriptions/reactivate')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
}

export default subscriptionService

