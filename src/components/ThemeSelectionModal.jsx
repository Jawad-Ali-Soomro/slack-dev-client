import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const ThemeSelectionModal = ({ onClose }) => {
  const { theme, setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState(theme || 'light')

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleThemeSelect = (newTheme) => {
    setSelectedTheme(newTheme)
  }

  const handleConfirm = () => {
    setTheme(selectedTheme)
    localStorage.setItem('themeSelected', 'true')
    document.body.style.overflow = 'unset'
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white dark:bg-black rounded-[20px] p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold text-black dark:text-white mb-2 text-center"
          >
            Choose Your Theme
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center"
          >
            Select your preferred theme to get started
          </motion.p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Light Theme Option */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleThemeSelect('light')}
              className={`p-6 rounded-[15px] border-2 transition-all ${
                selectedTheme === 'light'
                  ? 'border-black dark:border-white bg-gray-100 dark:bg-gray-900'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-black'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  animate={selectedTheme === 'light' ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Sun className="w-12 h-12 text-yellow-500" />
                </motion.div>
                <span className="text-sm font-semibold text-black dark:text-white">
                  Light
                </span>
                {selectedTheme === 'light' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full bg-black dark:bg-white flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 rounded-full bg-white dark:bg-black"
                    />
                  </motion.div>
                )}
              </div>
            </motion.button>

            {/* Dark Theme Option */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleThemeSelect('dark')}
              className={`p-6 rounded-[15px] border-2 transition-all ${
                selectedTheme === 'dark'
                  ? 'border-black dark:border-white bg-gray-100 dark:bg-gray-900'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-black'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  animate={selectedTheme === 'dark' ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Moon className="w-12 h-12 text-indigo-500" />
                </motion.div>
                <span className="text-sm font-semibold text-black dark:text-white">
                  Dark
                </span>
                {selectedTheme === 'dark' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full bg-black dark:bg-white flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 rounded-full bg-white dark:bg-black"
                    />
                  </motion.div>
                )}
              </div>
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            className="w-full py-4 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-900 transition-colors dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Continue
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ThemeSelectionModal

