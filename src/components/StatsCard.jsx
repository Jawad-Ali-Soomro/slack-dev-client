import { motion } from 'framer-motion'

const StatsCard = ({ title, value, color = 'blue' }) => {
  const headerBgByColor = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500'
  }

  const headerBg = headerBgByColor[color] || headerBgByColor.blue

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className=" rounded-none border bg-gray-50 dark:bg-[rgba(255,255,255,.1)] shadow-sm p-6 dark:text-white"
    >
    
      <div className="text-center">
        <div className={`${headerBg} text-white py-2 px-4 -mx-6 -mt-6 mb-4`}>
          <span className="text-[12px] font-bold uppercase">{title}</span>
        </div>
        <div className="text-6xl font-bold text-gray-900 dark:text-white mt-8">{value}</div>
      </div>
    </motion.div>
  )
}

export default StatsCard


