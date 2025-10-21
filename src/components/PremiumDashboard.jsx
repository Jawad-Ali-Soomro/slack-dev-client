import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Crown, 
  TrendingUp, 
  Users, 
  FolderOpen, 
  CheckSquare, 
  Calendar, 
  Code, 
  HardDrive,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Shield,
  BarChart3,
  Settings,
  CreditCard,
  Calendar as CalendarIcon
} from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { usePremium } from '../contexts/PremiumContext'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const PremiumDashboard = () => {
  const { 
    subscription, 
    usage, 
    plans, 
    loading, 
    loadSubscription, 
    loadUsage, 
    startTrial,
    getUsagePercentage,
    isOnTrial,
    isPremium,
    getPlanName
  } = usePremium()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isStartingTrial, setIsStartingTrial] = useState(false)

  const featureIcons = {
    teams: Users,
    projects: FolderOpen,
    members: Users,
    tasks: CheckSquare,
    meetings: Calendar,
    codeSessions: Code,
    storage: HardDrive
  }

  const handleStartTrial = async (plan) => {
    try {
      setIsStartingTrial(true)
      await startTrial(plan)
      // Redirect to premium page
      navigate('/premium')
    } catch (error) {
      console.error('Failed to start trial:', error)
    } finally {
      setIsStartingTrial(false)
    }
  }

  const handleUpgrade = () => {
    navigate('/premium')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-none h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Loading subscription data...</p>
      </div>
    )
  }

  const currentPlan = plans.find(plan => plan.id === subscription.plan)
  const isTrial = isOnTrial()
  const isPremiumUser = isPremium()

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-none flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {getPlanName()} Plan
                  {isTrial && (
                    <Badge className="ml-2 bg-yellow-500 text-white">
                      Trial
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {isTrial ? 'Trial ends in 14 days' : 
                   isPremiumUser ? 'Active subscription' : 
                   'Free plan with limited features'}
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              {isPremiumUser ? 'Manage Plan' : 'Upgrade Now'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(usage || {}).map(([feature, data]) => {
              const Icon = featureIcons[feature]
              const percentage = getUsagePercentage(feature)
              const isNearLimit = percentage >= 80
              const isAtLimit = percentage >= 100

              return (
                <Card key={feature} className={`${
                  isAtLimit ? 'border-red-200 dark:border-red-800' : 
                  isNearLimit ? 'border-yellow-200 dark:border-yellow-800' : 
                  'border-gray-200 dark:border-gray-700'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                        <span className="font-medium capitalize">
                          {feature.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                      {isAtLimit && <XCircle className="w-4 h-4 text-red-500" />}
                      {isNearLimit && !isAtLimit && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Used</span>
                        <span className="font-medium">
                          {data.used} / {data.limit === -1 ? '∞' : data.limit}
                        </span>
                      </div>
                      
                      <Progress value={percentage} className="h-2" />
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{Math.round(percentage)}% used</span>
                        {data.limit !== -1 && (
                          <span>{data.limit - data.used} remaining</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(subscription.features).map(([feature, value]) => {
              const isBoolean = typeof value === 'boolean'
              const isEnabled = isBoolean ? value : value > 0 || value === -1
              
              return (
                <Card key={feature} className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isEnabled ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                          <h4 className="font-medium capitalize">
                            {feature.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {isBoolean ? 
                              (value ? 'Enabled' : 'Disabled') :
                              (value === -1 ? 'Unlimited' : `Up to ${value}`)
                            }
                          </p>
                        </div>
                      </div>
                      {!isEnabled && (
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          Premium
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Current Plan</span>
                <span className="font-medium">{getPlanName()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <Badge className={
                  subscription.status === 'active' ? 'bg-green-500' :
                  subscription.status === 'trial' ? 'bg-yellow-500' :
                  'bg-gray-500'
                }>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </Badge>
              </div>
              
              {subscription.startDate && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Start Date</span>
                  <span className="font-medium">
                    {new Date(subscription.startDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {subscription.endDate && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Next Billing</span>
                  <span className="font-medium">
                    {new Date(subscription.endDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {isTrial && subscription.trialEndDate && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Trial Ends</span>
                  <span className="font-medium text-yellow-600">
                    {new Date(subscription.trialEndDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Plans */}
          <Card>
            <CardHeader>
              <CardTitle>Available Plans</CardTitle>
              <CardDescription>
                Choose the plan that best fits your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <Card key={plan.id} className={`${
                    plan.id === subscription.plan ? 'border-orange-200 dark:border-orange-700' : 
                    'border-gray-200 dark:border-gray-700'
                  }`}>
                    <CardHeader className="text-center">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <div className="text-2xl font-bold">
                        ${plan.price}
                        <span className="text-sm font-normal text-gray-500">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {Object.entries(plan.features).slice(0, 5).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}: 
                              {typeof value === 'boolean' ? (value ? ' Yes' : ' No') :
                               value === -1 ? ' Unlimited' : ` ${value}`}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {plan.id !== subscription.plan && (
                        <Button 
                          className="w-full"
                          variant={plan.id === 'free' ? 'outline' : 'default'}
                          onClick={() => {
                            if (plan.id === 'free') return
                            if (subscription.plan === 'free') {
                              handleStartTrial(plan.id)
                            } else {
                              handleUpgrade()
                            }
                          }}
                          disabled={isStartingTrial}
                        >
                          {plan.id === 'free' ? 'Current Plan' : 
                           subscription.plan === 'free' ? 'Start Trial' : 'Upgrade'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PremiumDashboard

