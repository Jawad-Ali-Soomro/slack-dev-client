import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Calendar, User, Flag, FileText, Clock, MapPin, Link, Users, Tag } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { toast } from 'sonner'
import enhancedMeetingService from '../services/enhancedMeetingService'
import { getAvatarProps } from '../utils/avatarUtils'
import meetingService from '../services/meetingService'

const MeetingEditModal = ({ meeting, isOpen, onClose, onMeetingUpdated, users = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'in_person',
    status: 'scheduled',
    assignedTo: '',
    attendees: [],
    startDate: '',
    endDate: '',
    location: '',
    meetingLink: '',
    tags: []
  })
  const [newTag, setNewTag] = useState('')
  const [attendeeSearch, setAttendeeSearch] = useState('')
  const [loading, setLoading] = useState(false)

  // Initialize form data when meeting changes
  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title || '',
        description: meeting.description || '',
        type: meeting.type || 'in_person',
        status: meeting.status || 'scheduled',
        assignedTo: meeting.assignedTo?.id || meeting.assignedTo || 'unassigned',
        attendees: meeting.attendees?.map(attendee => 
          typeof attendee === 'string' ? attendee : attendee.id
        ) || [],
        startDate: meeting.startDate ? new Date(meeting.startDate).toISOString().slice(0, 16) : '',
        endDate: meeting.endDate ? new Date(meeting.endDate).toISOString().slice(0, 16) : '',
        location: meeting.location || '',
        meetingLink: meeting.meetingLink || '',
        tags: meeting.tags || []
      })
    }
  }, [meeting])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleAddAttendee = (userId) => {
    if (!formData.attendees.includes(userId)) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, userId]
      }))
    }
    setAttendeeSearch('')
  }

  const handleRemoveAttendee = (userId) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(id => id !== userId)
    }))
  }

  const getFilteredUsers = () => {
    if (!attendeeSearch.trim()) return users.slice(0, 5)
    return users
      .filter(user => 
        user.username.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(attendeeSearch.toLowerCase())
      )
      .slice(0, 5)
  }

  const getAttendeeUser = (userId) => {
    return users.find(user => user._id === userId)
  }

  const getAssignedUser = () => {
    if (!formData.assignedTo || formData.assignedTo === 'unassigned') return null
    return users.find(user => user._id === formData.assignedTo)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }

    if (!formData.startDate) {
      toast.error('Start date is required')
      return
    }

    if (formData.type === 'virtual' && !formData.meetingLink) {
      toast.error('Meeting link is required for virtual meetings')
      return
    }

    try {
      setLoading(true)
      
      const updateData = {
        ...formData,
        assignedTo: formData.assignedTo === 'unassigned' ? null : formData.assignedTo,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
      }

      const response = await meetingService.updateMeeting(meeting.id, updateData)
      
      toast.success('Meeting updated successfully!')
      onMeetingUpdated(response.meeting)
      onClose()
    } catch (error) {
      console.error('Meeting update error:', error)
      toast.error(error.message || 'Failed to update meeting')
    } finally {
      setLoading(false)
    }
  }

  const handleReschedule = async () => {
    if (!formData.startDate) {
      toast.error('Please select a new start date')
      return
    }

    try {
      setLoading(true)
      
      const rescheduleData = {
        assignedTo: formData.assignedTo === 'unassigned' ? null : formData.assignedTo,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
      }

      const response = await meetingService.updateMeeting(meeting.id, rescheduleData)
      
      toast.success('Meeting rescheduled successfully!')
      onMeetingUpdated(response.meeting)
      onClose()
    } catch (error) {
      console.error('Meeting reschedule error:', error)
      toast.error(error.message || 'Failed to reschedule meeting')
    } finally {
      setLoading(false)
    }
  }

  const assignedUser = getAssignedUser()

  if (!isOpen || !meeting) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl border-2 border-gray-200 dark:border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-black dark:text-white">
                Edit Meeting
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Update meeting details, attendees, and schedule
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title and Description */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter meeting title *"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter meeting description"
                  className="w-full"
                  rows="3"
                />
              </div>
            </div>

            {/* Type, Status, and Assigned To */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder="Select meeting type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="in-person">In Person</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="postponed">Postponed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange('assignedTo', value)}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder="Select assigned user">
                      {assignedUser && (
                        <div className="flex items-center gap-2">
                          <img
                            {...getAvatarProps(assignedUser.avatar, assignedUser.username)}
                            alt={assignedUser.username}
                            className="w-5 h-5 rounded-full"
                          />
                          <span>{assignedUser.username}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <img
                            {...getAvatarProps(user.avatar, user.username)}
                            alt={user.username}
                            className="w-5 h-5 rounded-full"
                          />
                          <span>{user.username}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  placeholder="Select start date & time *"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <Input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  placeholder="Select end date & time"
                  className="w-full"
                />
              </div>
            </div>

            {/* Location and Meeting Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Meeting location"
                  className="w-full"
                />
              </div>

              <div>
                <Input
                  value={formData.meetingLink}
                  onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                  placeholder={formData.type === 'virtual' ? "Meeting link *" : "Meeting link (optional)"}
                  className="w-full"
                  required={formData.type === 'virtual'}
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-green-600 dark:hover:text-green-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReschedule}
                className="flex-1"
                disabled={loading}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Reschedule Only
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default MeetingEditModal