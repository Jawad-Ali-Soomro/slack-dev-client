import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Settings, LogOut, Camera, X, RefreshCw, Menu, BookOpen, Store, BookHeart, Book } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import profileService from '../services/profileService'
import { getAvatarProps } from '../utils/avatarUtils'
import NotificationDropdown from './NotificationDropdown'
import { useSidebar } from '../contexts/SidebarContext'
import { RiMenu3Fill } from "react-icons/ri";
import { ThemeToggle } from './ThemeToggle'
import { PiUserDuotone } from 'react-icons/pi'
import { Link } from 'react-router-dom'

const DashboardHeader = () => {
  const { user, logout } = useAuth()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    userLocation: '',
    website: '',
    phone: ''
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [loading, setLoading] = useState(false)

  // Initialize profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        bio: user.bio || '',
        userLocation: user.userLocation || '',
        website: user.website || '',
        phone: user.phone || ''
      })
      setAvatarPreview(user.avatar || '')
    }
  }, [user])

  // Fetch real-time profile data when modal opens
  const fetchProfileData = async () => {
    try {
      setLoading(true)
      const response = await profileService.getProfile()
      const profileUser = response.user
      
      setProfileData({
        username: profileUser.username || '',
        bio: profileUser.bio || '',
        userLocation: profileUser.userLocation || '',
        website: profileUser.website || '',
        phone: profileUser.phone || ''
      })
      setAvatarPreview(profileUser.avatar || '')
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  // Handle modal open
  const handleOpenProfileModal = () => {
    setShowProfileModal(true)
    fetchProfileData()
  }

  const handleProfileUpdate = async () => {
    try {
      setLoading(true)
      
      // Update profile data
      const response = await profileService.updateProfile(profileData)
      
      // Update user data in context/localStorage
      const updatedUser = { ...user, ...response.user }
      localStorage.setItem('userData', JSON.stringify(updatedUser))
      
      toast.success('Profile updated successfully!')
      setIsEditing(false)
      setShowProfileModal(false)
      
      // Reload page to update user context
      window.location.reload()
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    try {
      setLoading(true)
      
      // Upload avatar to server
      const response = await profileService.uploadAvatar(file)
      
      // Update avatar preview with full URL
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const avatarUrl = response.user.avatar.startsWith('http') 
        ? response.user.avatar 
        : `${apiUrl}${response.user.avatar}`
      
      setAvatarPreview(avatarUrl)
      setAvatarFile(file)
      
      // Update user data in context/localStorage
      const updatedUser = { ...user, avatar: response.user.avatar }
      localStorage.setItem('userData', JSON.stringify(updatedUser))
      
      toast.success('Avatar uploaded successfully!')
      
      // Reload page to update user context
      window.location.reload()
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast.error(error.message || 'Failed to upload avatar')
    } finally {
      setLoading(false)
    }
  }


    const { toggleSidebar, isOpen } = useSidebar();

  

  return (
    <>
      {/* Dashboard Header */}
      <header className="bg-[#eee] dark:bg-[#111827] z-5 icon  border-gray-300 dark:border-gray-700 px-6 py-4 border-b fixed w-full">
        <div className={`flex items-center justify-between `}>

          <div className="flex justify-center items-center gap-4">
              <div
          className={`flex left-2 top-20 p-3 hover:bg-gray-100 cursor-pointer rounded-sm hover:text-black z-10`}
          onClick={() => toggleSidebar()}
        >
          <RiMenu3Fill />
            </div>
            <img 
              src="/logo.png" 
              className={`w-[50px] transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
              alt="" 
            />
      </div>
          <div className="flex items-center gap-2">

          
        <div className="flex gap-2">
         <Link to="/learn-point" className="flex w-12 h-12 flex items-center justify-center  bg-transparent hover:bg-white dark:hover:bg-[rgba(255,255,255,.1)] cursor-pointer rounded-[20px]">
         <Book className='w-4 h-4 icon' />
         </Link>
         <Link to="/store" className="flex w-12 h-12 flex items-center justify-center  bg-transparent hover:bg-white dark:hover:bg-[rgba(255,255,255,.1)] cursor-pointer rounded-[20px]">
         <Store className='w-4 h-4 icon' />
         </Link> 
         <ThemeToggle className="flex w-12 h-12  hidden md:flex items-center justify-center border-none  bg-transparent hover:bg-white dark:hover:bg-[rgba(255,255,255,.1)] dark:hover:text-white hover:text-black cursor-pointer rounded-[20px]" />
         
        </div>
            <NotificationDropdown />

            {/* User Info */}
            <div className="flex items-center gap-3 ">
              <div className="text-right hidden md:block">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.username || 'User'}
                </div>
              </div>
              
              {/* Avatar Button */}
              <button
                onClick={handleOpenProfileModal}
                className="relative group"
              >
                <div className="w-12 h-12 p-1 overflow-hidden rounded-[20px] border border-gray-200 dark:border-gray-700 group-hover:border-black dark:group-hover:border-white transition-colors">
                  <img
                    {...getAvatarProps(avatarPreview || user?.avatar, user?.username)}
                    alt={user?.username || 'User'}
                    className="w-full h-full rounded-[15px]"
                  />
                </div>
              
              </button>
            </div>

            {/* Logout Button */}
            
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfileModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bg-black/20 inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-60 icon"
          onClick={() => setShowProfileModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-black rounded-[20px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  Profile Settings
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {user?.email} • {user?.role}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchProfileData}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                  disabled={loading}
                  title="Refresh profile data"
                >
                  <RefreshCw className={`w-5 h-5 icon ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative group mb-4">
                <div className="w-20 h-20 rounded-full p-2 overflow-hidden border-1 border-gray-200 dark:border-gray-700 group-hover:border-black dark:group-hover:border-white transition-colors">
                  <img
                    {...getAvatarProps(avatarPreview || user?.avatar, user?.username)}
                    alt={user?.username || 'User'}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <label className="absolute -bottom-1 rounded-full bg-black dark:bg-white text-white dark:text-black -right-1 w-6 h-6 flex items-center justify-center cursor-pointer transition-colors">
                  <Camera className="w-3 h-3 icon" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {loading ? 'Uploading...' : 'Click the camera icon to upload a new avatar'}
              </p>
              
              {/* User Stats */}
              <div className="flex gap-4 mt-4 text-center">
                
                <div className="px-5 py-2 bg-gray-100 dark:bg-black rounded-sm">
                  <div className="text-sm font-medium text-green-600 dark:text-green-400">
                    {user?.emailVerified ? 'Verified' : 'Pending'}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-sm h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-500">Loading profile...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                 
                  <Input
                    value={profileData.username}
                    onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>

              <div>
               
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  disabled={!isEditing}
                  className="w-full"
                  rows="3"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
              
                <Input
                  value={profileData.userLocation}
                  onChange={(e) => setProfileData({...profileData, userLocation: e.target.value})}
                  disabled={!isEditing}
                  className="w-full"
                  placeholder="Your location"
                />
              </div>

              <div>
              
                <Input
                  value={profileData.website}
                  onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                  disabled={!isEditing}
                  className="w-full"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
              
                <Input
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  disabled={!isEditing}
                  className="w-full"
                  placeholder="Your phone number"
                />
              </div>
            </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex-1"
                  disabled={loading}
                >
                  <PiUserDuotone className="w-4 h-4 icon mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setProfileData({
                        username: user?.username || '',
                        bio: user?.bio || '',
                        userLocation: user?.userLocation || '',
                        website: user?.website || '',
                        phone: user?.phone || ''
                      })
                      setAvatarFile(null)
                      setAvatarPreview(user?.avatar || '')
                    }}
                    className="flex-1"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleProfileUpdate}
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

export default DashboardHeader
