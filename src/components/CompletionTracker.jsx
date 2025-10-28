import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, AlertCircle, Trophy, Star } from 'lucide-react'
import { Button } from './ui/button'
import { toast } from 'sonner'
import completionService from '../services/completionService'

const CompletionTracker = ({ 
  itemId, 
  itemType, 
  onCompletionChange, 
  showBadge = true,
  showButton = true,
  className = '' 
}) => {
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [completionData, setCompletionData] = useState(null)

  useEffect(() => {
    checkCompletionStatus()
  }, [itemId, itemType])

  const checkCompletionStatus = async () => {
    try {
      let response
      switch (itemType) {
        case 'task':
          response = await completionService.isTaskCompleted(itemId)
          break
        case 'meeting':
          response = await completionService.isMeetingCompleted(itemId)
          break
        default:
          return
      }
      
      setIsCompleted(response.completed)
      setCompletionData(response)
    } catch (error) {
      console.error('Error checking completion status:', error)
    }
  }

  const handleMarkCompleted = async () => {
    if (isCompleted) return

    try {
      setIsLoading(true)
      let response
      
      switch (itemType) {
        case 'task':
          response = await completionService.markTaskCompleted(itemId)
          break
        case 'meeting':
          response = await completionService.markMeetingCompleted(itemId)
          break
        default:
          return
      }

      setIsCompleted(true)
      setCompletionData(response)
      
      if (onCompletionChange) {
        onCompletionChange(true, response)
      }
      
      toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} marked as completed!`)
    } catch (error) {
      console.error('Error marking as completed:', error)
      toast.error(`Failed to mark ${itemType} as completed`)
    } finally {
      setIsLoading(false)
    }
  }

  const getCompletionIcon = () => {
    if (isCompleted) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    return <Clock className="w-4 h-4 text-gray-400" />
  }

  const getCompletionBadge = () => {
    if (!showBadge) return null

    if (isCompleted) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-[10px] text-xs font-medium"
        >
          <CheckCircle className="w-3 h-3" />
          Completed
        </motion.div>
      )
    }

    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-[10px] text-xs font-medium">
        <Clock className="w-3 h-3" />
        Pending
      </div>
    )
  }

  const getCompletionButton = () => {
    if (!showButton) return null

    if (isCompleted) {
      return (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="flex items-center gap-2 text-green-600 border-green-200 bg-green-50 dark:bg-green-900 dark:border-green-700"
        >
          <CheckCircle className="w-4 h-4" />
          Completed
        </Button>
      )
    }

    return (
      <Button
        onClick={handleMarkCompleted}
        disabled={isLoading}
        size="sm"
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-[10px] animate-spin" />
        ) : (
          <CheckCircle className="w-4 h-4" />
        )}
        Mark Complete
      </Button>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {getCompletionIcon()}
      {getCompletionBadge()}
      {getCompletionButton()}
    </div>
  )
}

export default CompletionTracker


