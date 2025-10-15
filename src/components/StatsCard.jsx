import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const StatsCard = ({ title, value, icon: Icon, color = 'gray' }) => {
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const iconColorClasses = {
    gray: 'text-gray-600 dark:text-gray-400',
    green: 'text-green-600 dark:text-green-400',
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red: 'text-red-600 dark:text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-black rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={cn("p-3 rounded-lg", colorClasses[color])}>
          {Icon && <Icon className={cn("w-6 h-6", iconColorClasses[color])} />}
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;


