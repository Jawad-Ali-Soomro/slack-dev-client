import { motion } from 'framer-motion'

const StatsCard = ({ 
  title, 
  value, 
  color = 'blue', 
  icon: Icon, 
  subtitle, 
  trend, 
  trendValue, 
  delay = 0 
}) => {
  const colorConfig = {
    neutral: {
      bg: 'bg-gray-100 dark:bg-[rgba(255,255,255,.1)] backdrop-blur-sm',
      text: 'text-black dark:text-white',
      light: 'bg-white dark:bg-[rgba(0,0,0,.1)]',
      border: 'border-gray-200 dark:border-[rgba(255,255,255,.5)]'
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      text: 'text-blue-600 dark:text-blue-400',
      light: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800'
    },
    green: {
      bg: 'bg-gradient-to-br from-green-500 to-green-600',
      text: 'text-green-600 dark:text-green-400',
      light: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      text: 'text-purple-600 dark:text-purple-400',
      light: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800'
    },
    red: {
      bg: 'bg-gradient-to-br from-red-500 to-red-600',
      text: 'text-red-600 dark:text-red-400',
      light: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800'
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
      text: 'text-orange-600 dark:text-orange-400',
      light: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800'
    },
    cyan: {
      bg: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      text: 'text-cyan-600 dark:text-cyan-400',
      light: 'bg-cyan-50 dark:bg-cyan-900/20',
      border: 'border-cyan-200 dark:border-cyan-800'
    }
  }

  const config = colorConfig[color] || colorConfig.neutral

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`relative overflow-hidden rounded-[30px] border ${config.border} border-l-10  ${config.light} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group`}
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 ${config.bg} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
      
      <div className="relative p-6">
        {/* Header with icon and title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-between w-full space-x-3">
           
            <div>
              <h3 className="text-sm  text-gray-600 dark:text-gray-400 tracking-wide">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {Icon && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
                className={`p-3 border rounded-full bg-gray-100 dark:bg-gray-800`}
              >
                <Icon className="w-5 h-5 icon" />
              </motion.div>
            )}
          </div>
          
          {/* Trend indicator */}
        
        </div>

        {/* Main value */}
       <div className="flex justify-between items-center">
       <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.1 }}
          className={`text-4xl  ${config.text} mb-2 font-bold`}
        >
          {value}
        </motion.div>

        {trend && trendValue && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + 0.3 }}
              className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                trend === 'up' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              }`}
            >
              <span className="text-xs font-medium">
                {trend === 'up' ? '↗' : '↘'} {trendValue}%
              </span>
            </motion.div>
          )}
       </div>

        {/* Decorative element */}
        <div className="absolute bottom-0 right-0 w-20 h-20 opacity-10">
          <div className={`w-full h-full ${config.bg} rounded-full transform translate-x-8 translate-y-8`} />
        </div>
      </div>
    </motion.div>
  )
}

export default StatsCard


