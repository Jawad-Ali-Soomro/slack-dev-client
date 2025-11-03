// Standardized UI constants for consistent styling across the application

export const BUTTON_SIZES = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg'
}

export const BUTTON_VARIANTS = {
  primary: 'bg-black text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-black dark:text-gray-100 dark:hover:bg-gray-700',
  outline: ' border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-black',
  ghost: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-black',
  danger: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'
}

export const INPUT_SIZES = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
}

export const INPUT_VARIANTS = {
  default: 'border border-gray-200  dark:border-gray-700  bg-white dark:bg-black text-black dark:text-white',
  error: 'border border-red-500 focus:border-red-600 dark:border-red-600 dark:focus:border-red-500 bg-white dark:bg-black text-black dark:text-white'
}

export const ICON_SIZES = {
  xs: 'w-3 h-3 icon',
  sm: 'w-4 h-4 icon',
  md: 'w-5 h-5 icon',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
}

// Remove all blue-based colors and replace with black/white theme
export const COLOR_THEME = {
  // Status colors - using black/white theme
  success: 'bg-green-500 text-white border-green-500',
  warning: 'bg-yellow-500 text-white border-yellow-500',
  error: 'bg-red-500 text-white border-red-500',
  info: 'bg-gray-500 text-white border-gray-500',
  
  // Priority colors
  high: 'bg-red-500 text-white border-red-500',
  medium: 'bg-yellow-500 text-white border-yellow-500',
  low: 'bg-green-500 text-white border-green-500',
  
  // Status indicators
  completed: 'bg-green-500 text-white border-green-500',
  in_progress: 'bg-gray-500 text-white border-gray-500', // Changed from blue
  pending: 'bg-yellow-500 text-white border-yellow-500',
  cancelled: 'bg-red-500 text-white border-red-500',
  planning: 'bg-gray-500 text-white border-gray-500', // Changed from blue
  active: 'bg-green-500 text-white border-green-500',
  on_hold: 'bg-yellow-500 text-white border-yellow-500'
}

// Standard button classes
export const getButtonClasses = (variant = 'primary', size = 'md', additionalClasses = '') => {
  const baseClasses = 'inline-flex items-center justify-center rounded-[10px] font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none'
  const variantClasses = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary
  const sizeClasses = BUTTON_SIZES[size] || BUTTON_SIZES.md
  
  return `${baseClasses} ${variantClasses} ${sizeClasses} ${additionalClasses}`
}

// Standard input classes
export const getInputClasses = (variant = 'default', size = 'md', additionalClasses = '') => {
  const baseClasses = 'w-full rounded-[10px] transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1'
  const variantClasses = INPUT_VARIANTS[variant] || INPUT_VARIANTS.default
  const sizeClasses = INPUT_SIZES[size] || INPUT_SIZES.md
  
  return `${baseClasses} ${variantClasses} ${sizeClasses} ${additionalClasses}`
}

