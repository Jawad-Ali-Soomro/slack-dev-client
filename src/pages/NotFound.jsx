import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <motion.div
        className="text-center max-w-2xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 404 Number */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-bold text-gray-300 dark:text-gray-600 mb-4">
            404
          </h1>
        </motion.div>

        {/* Error Message */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 px-4">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </motion.div>

        {/* Loader animation */}
        <motion.div 
          variants={itemVariants} 
          className="mb-8 flex justify-center"
        >
          <span className="loader w-8 h-8"></span>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4"
        >
          <Button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Button>
          
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </motion.div>

        {/* Additional Help */}
        <motion.div variants={itemVariants} className="mt-8 sm:mt-12 px-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help? Try searching for what you're looking for or{' '}
            <button
              onClick={() => navigate('/contact')}
              className="text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:underline"
            >
              contact support
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
