import { motion } from "framer-motion";

const StatsCard = ({
  title,
  value,
  color = "blue",
  icon: Icon,
  subtitle,
  trend,
  trendValue,
  delay = 0,
}) => {
  const colorConfig = {
    neutral: {
      bg: "bg-gray-100 dark:bg-[rgba(255,255,255,.1)]",
      text: "text-gray-900 dark:text-gray-100",
      light: "bg-white dark:bg-[rgba(255,255,255,.1)]",
    },
    dark: {
      bg: "bg-gray-900 dark:bg-black",
      text: "text-white",
      light: "bg-gray-800 dark:bg-black/20",
    },
    blue: {
      bg: "bg-gradient-to-br from-blue-500 to-blue-600",
      text: "text-white",
      light: "bg-blue-50 dark:bg-blue-900/20",
    },
    green: {
      bg: "bg-gradient-to-br from-green-500 to-green-600",
      text: "text-white",
      light: "bg-green-50 dark:bg-green-900/20",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-500 to-purple-600",
      text: "text-purple-600 dark:text-purple-400",
      light: "bg-purple-50 dark:bg-purple-900/20",
    },
    red: {
      bg: "bg-gradient-to-br from-red-500 to-red-600",
      text: "text-red-600 dark:text-red-400",
      light: "bg-red-50 dark:bg-red-900/20",
    },
    orange: {
      bg: "bg-gradient-to-br from-[#ff914b] to-[#e8772e]",
      text: "text-white",
      light: "bg-orange-50 dark:bg-orange-900/20",
    },
    cyan: {
      bg: "bg-gradient-to-br from-cyan-500 to-cyan-600",
      text: "text-cyan-600 dark:text-cyan-400",
      light: "bg-cyan-50 dark:bg-cyan-900/20",
    },
  };

  const config = colorConfig[color] || colorConfig.neutral;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`relative overflow-hidden rounded-[25px] border border-gray-300 dark:border-gray-700 ${color === "orange" && "border-none"} ${config.bg}  ${config.light} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group`}
    >
      {/* Background gradient overlay */}
      <div
        className={`absolute inset-0 ${config.bg} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
      />

      <div className="relative p-6">
        {/* Header with icon and title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-between w-full space-x-3">
            <div>
              <h3
                className={`text-sm ${config.text} capitalize line-clamp-1 tracking-wide font-bold`}
              >
                {title}
              </h3>
              {subtitle && (
                <p
                  className={`text-sm ${config.text} capitalize line-clamp-1  tracking-wide font-bold`}
                >
                  {subtitle}
                </p>
              )}
            </div>
            {Icon && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: delay + 0.2,
                  type: "spring",
                  stiffness: 200,
                }}
                className={`
      p-3 rounded-[15px] 
      ${color === "neutral" ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100" : ""}
      ${color === "dark" ? "bg-gray-800 dark:bg-black border-gray-700 dark:border-gray-900 text-white" : ""}
      ${color === "green" ? "dark:border-green-800 text-green-600 bg-white dark:text-green-400" : ""}
      ${color === "orange" ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-white" : ""}
    `}
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
            className={`text-6xl ${config.text} mb-2 font-black`}
          >
            {value}
          </motion.div>

          {trend && trendValue && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + 0.3 }}
              className={`flex items-center space-x-1 px-2 py-1 rounded-[15px] ${
                trend === "up"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                  : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              }`}
            >
              <span className="text-xs font-medium">
                {trend === "up" ? "↗" : "↘"} {trendValue}%
              </span>
            </motion.div>
          )}
        </div>

        {/* Decorative element */}
        <div className="absolute bottom-0 right-0 w-20 h-20 opacity-10">
          <div
            className={`w-full h-full ${config.bg} rounded-[15px] transform translate-x-8 translate-y-8`}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
