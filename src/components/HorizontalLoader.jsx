import { motion } from "framer-motion"

const HorizontalLoader = ({ 
  message = "Loading...", 
  subMessage = "Please wait", 
  progress = 75,
  className = "",
  showProgress = true 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[200px] ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Progress Bar Container */}
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-gray-500 to-gray-600 rounded-full"
          />
        </div>
        
        {/* Progress Text */}
       
        
        {/* Loading Message */}
      
      </motion.div>
    </div>
  )
}

export default HorizontalLoader
