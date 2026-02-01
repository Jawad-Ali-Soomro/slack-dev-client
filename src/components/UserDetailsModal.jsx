import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Mail, 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock,
  User as UserIcon,
  Building,
  MapPin,
  Globe,
  Phone,
  Briefcase,
  Award,
  FileText,
  Heart,
  MessageCircle,
  UserCircle,
  UsersRoundIcon,
  UsersRound
} from 'lucide-react'
import { Button } from './ui/button'
import { getAvatarProps } from '../utils/avatarUtils'
import { userService } from '../services/userService'
import { exploreService } from '../services/exploreService'
import { PiUserDuotone, PiUsersDuotone } from "react-icons/pi";

const UserDetailsModal = ({ userId, isOpen, onClose }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [publicProjects, setPublicProjects] = useState([])
  const [loadingPublicProjects, setLoadingPublicProjects] = useState(false)

  useEffect(() => {
    if (isOpen && userId) {
      loadUserDetails()
    }
  }, [isOpen, userId])

  useEffect(() => {
    setPublicProjects([])
  }, [userId])

  useEffect(() => {
    if (activeTab === 'projects' && userId) {
      loadPublicProjects()
    }
  }, [activeTab, userId])

  const loadUserDetails = async () => {
    try {
      setLoading(true)
      const response = await userService.getUserDetails(userId)
      setUser(response.user)
    } catch (error) {
      console.error('Failed to load user details:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadPublicProjects()
    }
  }, [user])

  const loadPublicProjects = async () => {
    try {
      setLoadingPublicProjects(true)

      const response = await exploreService.getPublicProjects({ page: 1, limit: 100, createdBy: userId })
      if (response.projects) {

        const userPublicProjects = response.projects.filter(project => {
          const projectCreatorId = project.createdBy?.id || project.createdBy?._id || project.createdBy
          const currentUserId = userId?.toString() || userId
          return projectCreatorId?.toString() === currentUserId?.toString()
        })
        setPublicProjects(userPublicProjects.map(project => ({
          project,
          type: 'created'
        })))
      }
    } catch (error) {
      console.error('Failed to load public projects:', error)
      setPublicProjects([])
    } finally {
      setLoadingPublicProjects(false)
    }
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'overview', label: 'Overview', icon: PiUserDuotone },
    { id: 'projects', label: 'Projects', icon: Briefcase },
  ]

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 uppercase'
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-black dark:text-gray-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-black dark:text-gray-200'
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'moderator': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'user': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-black dark:text-gray-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 icon flex items-center backdrop-blur-sm justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-black rounded-[20px] shadow-2xl border border-gray-200/50 dark:border-gray-700/50 max-w-5xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <span className="loader w-12 h-12"></span>
          </div>
        ) : user ? (
          <>
            {/* Header */}
            <div className="relative p-8  border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-100 dark:bg-black tex-white dark:text-black">
              <div className="absolute bg-black dark:bg-white"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center justify-center gap-6">
                  <div className="relative group flex ">
                    <div className="absolute -inset-1 rounded-full opacity-75 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                    <img
                      {...getAvatarProps(user.avatar, user.username)}
                      alt={user.username}
                      className="relative w-20 h-20 border-4 border-gray-200 dark:border-gray-900 shadow-lg rounded-round"
                      
                    />
                    {/* <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-[20px] border-3 border-white dark:border-gray-900 shadow-lg ${
                      user.isActive ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}></div> */}
                  </div>
                    <h2 className="text-3xl  text-black dark:text-white font-bold">
                      {user.username}
                    </h2>
                    {/* <p className=" text-black dark:text-white text-lg mb-3">{user.email}</p> */}
                   
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-2 hover:bg-gray-100 dark:hover:bg-black rounded-[20px]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b icon border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-black/50">
              <nav className="flex space-x-1 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-4 border-b-2 icon  text-sm transition-all duration-200 rounded-t-lg ${
                      activeTab === tab.id
                        ? 'border-b-black dark:border-b-white border-b shadow-sm'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 icon icon" />
                    {/* {tab.label} */}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto h-96">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-black rounded-[20px]">
                          <Mail className="w-5 h-5 icon icon text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                            <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
                          </div>
                        </div>
                        
                        {user.phone && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-black rounded-[20px]">
                            <Phone className="w-5 h-5 icon icon text-green-500" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                              <p className="text-gray-900 dark:text-white font-medium">{user.phone}</p>
                            </div>
                          </div>
                        )}

                        {user.userLocation && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-black rounded-[20px]">
                            <MapPin className="w-5 h-5 icon icon text-red-500" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                              <p className="text-gray-900 dark:text-white font-medium">{user.userLocation}</p>
                            </div>
                          </div>
                        )}

                      
                      </div>

                      {/* Social Links */}
                      {(user.socialLinks && Object.keys(user.socialLinks).length > 0) && (
                        <div className="space-y-4">
                          <h4 className="text-md  text-gray-900 dark:text-white">Social Links</h4>
                          <div className="space-y-3">
                            {user.socialLinks.website && (
                              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-black rounded-[20px]">
                                <Globe className="w-5 h-5 icon icon text-purple-500" />
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Website</p>
                                  <a href={user.socialLinks.website} target="_blank" rel="noopener noreferrer" 
                                     className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                    {user.socialLinks.website}
                                  </a>
                                </div>
                              </div>
                            )}
                            {user.socialLinks.linkedin && (
                              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-black rounded-[20px]">
                                <Building className="w-5 h-5 icon icon text-blue-600" />
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">LinkedIn</p>
                                  <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" 
                                     className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                    LinkedIn Profile
                                  </a>
                                </div>
                              </div>
                            )}
                            {user.socialLinks.github && (
                              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-black rounded-[20px]">
                                <Building className="w-5 h-5 icon icon text-gray-700" />
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">GitHub</p>
                                  <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" 
                                     className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                    GitHub Profile
                                  </a>
                                </div>
                              </div>
                            )}
                            {user.socialLinks.twitter && (
                              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-black rounded-[20px]">
                                <Globe className="w-5 h-5 icon icon text-blue-400" />
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Twitter</p>
                                  <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" 
                                     className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                    @{user.socialLinks.twitter.replace('https://twitter.com/', '')}
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-4">
                        {/* <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-black rounded-[20px]">
                          <Calendar className="w-5 h-5 icon icon text-orange-500" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Joined</p>
                            <p className="text-gray-900 dark:text-white font-medium">{formatDate(user.createdAt)}</p>
                          </div>
                        </div> */}
                        
                        {user.dateOfBirth && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-black rounded-[20px]">
                            <Calendar className="w-5 h-5 icon icon text-pink-500" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                              <p className="text-gray-900 dark:text-white font-medium">{formatDate(user.dateOfBirth)}</p>
                            </div>
                          </div>
                        )}

                        {user.emailVerified !== undefined && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-black rounded-[20px]">
                            <Mail className="w-5 h-5 icon icon text-emerald-500" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Email Status</p>
                              <p className={`font-medium ${user.emailVerified ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                {user.emailVerified ? 'Verified' : 'Unverified'}
                              </p>
                            </div>
                          </div>
                        )}

{user.website && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-black rounded-[20px]">
                            <Globe className="w-5 h-5 icon icon text-indigo-500" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Website</p>
                              <a href={user.website} target="_blank" rel="noopener noreferrer" 
                                 className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                {user.website}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bio Section */}
                      
                    </div>
                  </div>

                  {/* Statistics Section */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-[20px] border border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-3">
                          <div className="p-2 bg-blue-500/10 rounded-[20px]">
                            <Briefcase className="w-5 h-5 icon icon" />
                          </div>
                        </div>
                        <p className="text-3xl  text-blue-700 dark:text-blue-300 font-bold">
                          {publicProjects?.length || 0}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-[20px] border border-purple-200/50 dark:border-purple-700/50 hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 mb-3">
                          <div className="p-2 bg-purple-500/10 rounded-[20px]">
                            <PiUsersDuotone className="w-5 h-5 icon icon" />
                          </div>
                          <span className="">Teams</span>
                        </div>
                        <p className="text-3xl  text-purple-700 dark:text-purple-300 font-bold">
                          {user.teams?.length || 0}
                        </p>
                      </div>
                    </div>
                    
                    {/* Awards and Points Section */}
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-500" />
                        Challenge Achievements
                      </h4>
                      
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-[20px] border border-yellow-200/50 dark:border-yellow-700/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Points</p>
                            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                              {user.totalChallengePoints !== undefined && user.totalChallengePoints !== null 
                                ? user.totalChallengePoints 
                                : 0}
                            </p>
                          </div>
                          <Award className="w-8 h-8 text-yellow-500" />
                        </div>
                      </div>
                      
                      {user.awards && user.awards.length > 0 ? (
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Awards Earned ({user.awards.length})
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {user.awards.map((award, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col items-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-all duration-200"
                                title={award.description}
                              >
                                <div className="text-4xl mb-2">{award.icon}</div>
                                <div className="text-xs font-bold text-gray-700 dark:text-gray-300 text-center">
                                  {award.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                                  {award.pointsRequired} Points
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 dark:bg-black p-4 rounded-[20px] border border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400">No awards earned yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-4">
                  {loadingPublicProjects ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (() => {

                    const ownedProjects = (user.projects || []).filter(project => project.role === 'creator')

                    const allProjects = [
                      ...ownedProjects.map(project => ({
                        ...project,
                        type: 'owned',
                        isPublic: false
                      })),
                      ...publicProjects.map(item => {
                        const project = item.project || item
                        return {
                          id: project._id || project.id,
                          name: project.title,
                          description: project.description,
                          logo: project.previewImages?.[0] || null,
                          status: project.isActive ? 'active' : 'inactive',
                          role: item.type === 'created' ? 'creator' : 'purchased',
                          progress: 0,
                          type: item.type,
                          isPublic: true,
                          price: project.price,
                          category: project.category
                        }
                      })
                    ]

                    return allProjects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {allProjects.map((project, index) => (
                          <div key={project.id || index} className="bg-white dark:bg-black p-5 rounded-[20px] border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600">
                            <div className="flex items-start gap-4">
                              {project.logo && (
                                <div className="relative">
                                  <img
                                    src={project.logo.startsWith('http') 
                                      ? project.logo 
                                      : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${project.logo}`}
                                    alt={project.name}
                                    className="w-12 h-12 rounded-[20px] object-cover border-gray-200 dark:border-gray-700 shadow-sm"
                                  />
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-[20px]"></div>
                                </div>
                              )}
                              <div className="flex-1">
                                <h4 className="text-gray-900 dark:text-white text-lg mb-2 font-bold">{project.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                                  {project.description}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {project.isPublic ? (
                                    <>
                                      {project.price && (
                                        <span className="px-3 py-1 rounded-[20px] text-xs shadow-sm bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                          ${project.price}
                                        </span>
                                      )}
                                      <span className={`px-3 py-1 rounded-[20px] text-xs shadow-sm uppercase font-bold ${
                                        project.type === 'created' 
                                          ? 'bg-blue-600 text-white' 
                                          : 'bg-purple-600 text-white'
                                      }`}>
                                        {project.type === 'created' ? 'Created' : 'Purchased'}
                                      </span>
                                      {project.category && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-[20px] uppercase font-bold">
                                          {project.category}
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <span className={`px-3 py-1 rounded-[20px] text-xs shadow-sm ${
                                        project.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300' :
                                        project.status === 'completed' ? 'bg-green-600 text-white uppercase font-bold text-gray-800 dark:bg-black dark:text-gray-200' :
                                        'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
                                      }`}>
                                        {project.status}
                                      </span>
                                      <span className={`px-3 py-1 rounded-[20px] text-xs shadow-sm uppercase font-bold bg-blue-600 text-white`}>
                                        {project.role}
                                      </span>
                                      {project.progress !== undefined && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-[20px] uppercase font-bold">
                                          {project.progress}% 
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No projects found</p>
                      </div>
                    )
                  })()}
                </div>
              )}

        

              

       
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">User not found</p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default UserDetailsModal
