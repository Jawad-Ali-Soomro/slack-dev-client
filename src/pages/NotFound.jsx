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
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4">
      <motion.div
        className="text-center max-w-2xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        <img src="/not.png" alt="" />
        {/* 404 Number */}
    

        {/* Error Message */}
        <motion.div variants={itemVariants} className="mb-8 mt-10">
        
          <p className="text-base sm:text-lg font-bold text-gray-600 dark:text-gray-400 mb-6 px-4">
            Oops! the page you're looking for doesn't exist or has been moved.
          </p>
        </motion.div>

        {/* Loader animation */}
     

        {/* Action Buttons */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col  gap-3 sm:gap-4 justify-center items-center px-4 w-full"
        >
        
          
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex font-black items-center w-[300px] justify-center gap-2 px-6 py-3  border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-black transition-colors"
          >
            <ArrowLeft /> 
          </Button>
        </motion.div>

        {/* Additional Help */}
        <motion.div variants={itemVariants} className="mt-8 sm:mt-12 px-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">
            Need help? Try searching for what you're looking for or{' '}
            <button
              onClick={() => navigate('/contact')}
              className="text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:underline"
            >
              Contact Support
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
