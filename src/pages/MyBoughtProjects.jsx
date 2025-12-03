import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, Search, Eye, DollarSign, Calendar, User, Package, X, Trash2, Edit } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { exploreService } from '../services/exploreService'
import { useAuth } from '../contexts/AuthContext'
import { getAvatarProps } from '../utils/avatarUtils'

const MyBoughtProjects = () => {
  document.title = "My Projects"

  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })

  const loadProjects = async () => {
    try {
      setLoading(true)
      const response = await exploreService.getMyPurchases({
        page: pagination.page,
        limit: pagination.limit
      })
      setProjects(response.projects || [])
      setPagination(response.pagination || pagination)
    } catch (error) {
      console.error('Failed to load projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [pagination.page])

  const handleDownload = async (projectId) => {
    try {
      await exploreService.downloadProject(projectId)
      toast.success('Download started!')
    } catch (error) {
      toast.error(error.message || 'Failed to download project')
    }
  }

  const handleDownloadFromItem = async (item) => {
    const projectId = item.project?._id || item.project?.id || item._id || item.id
    await handleDownload(projectId)
  }

  const handleViewProject = async (item) => {
    try {
      const projectId = item.project?._id || item.project?.id || item._id || item.id
      const response = await exploreService.getPublicProject(projectId)
      setSelectedProject({ ...response.project, type: item.type })
      setShowProjectModal(true)
    } catch (error) {
      toast.error('Failed to load project details')
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    try {
      const projectId = item.project?._id || item.project?.id || item._id || item.id
      await exploreService.deletePublicProject(projectId)
      toast.success('Project deleted successfully')
      loadProjects()
    } catch (error) {
      toast.error(error.message || 'Failed to delete project')
    }
  }

  const renderPreviewImages = (images = []) => {
    if (!images.length) {
      return (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
          No preview images provided
        </div>
      )
    }

    if (images.length === 1) {
      return (
        <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
          <img
            src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${images[0]}`}
            alt={`${selectedProject?.title || 'Project'} preview`}
            className="w-full  object-cover"
          />
        </div>
      )
    }

    if (images.length === 2) {
      return (
        <div className="flex flex-col gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
              <img
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${img}`}
                alt={`${selectedProject?.title || 'Project'} preview ${idx + 1}`}
                className="w-full h-55 object-cover"
              />
            </div>
          ))}
        </div>
      )
    }

    

    return (
      <div className="grid grid-cols-2 gap-4">
        {images.map((img, idx) => (
          <div key={idx} className="relative group rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
            <img
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${img}`}
              alt={`${selectedProject?.title || 'Project'} preview ${idx + 1}`}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <span className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">#{idx + 1}</span>
          </div>
        ))}
      </div>
    )
  }

  const filteredProjects = projects.filter(item => {
    const project = item.project || item
    if (!project) return false
    return project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  return (
    <div className="overflow-hidden pt-10">
      <motion.div
        className="mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="flex py-6 gap-3 items-center fixed z-10 md:-top-3 -top-30 z-10">
          <div className="flex p-2 border-2 items-center gap-2 pr-10 rounded-[50px]">
            <div className="flex p-3 bg-white dark:bg-gray-800 rounded-full">
              <Package size={15} />
            </div>
            <h1 className="text-2xl font-bold">My Projects</h1>
          </div>
        </div>

        {/* Search */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 icon" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:w-[500px] w-full pl-10 pr-4 py-3 border border-gray-200 h-13 dark:border-gray-700 bg-white dark:bg-[#111827] text-black dark:text-white"
            />
          </div>
        </motion.div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl text-gray-900 dark:text-white mb-2">No projects found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't purchased or created any projects yet</p>
            <Button onClick={() => window.location.href = '/dashboard/explore'}>
              Explore Projects
            </Button>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[78vh] pb-5vh overflow-scroll"
          >
            {filteredProjects.map((item) => {
              const project = item.project || item
              const isCreated = item.type === 'created'
              const projectId = project._id || project.id
              if (!project) return null

              return (
                <motion.div
                  key={item._id || item.id || projectId}
                  variants={itemVariants}
                  className="group relative bg-white dark:bg-[rgba(255,255,255,.1)] rounded-[20px] overflow-hidden border dark:border-none shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => handleViewProject(item)}
                >
                  {/* Preview Image */}
                  {project.previewImages && project.previewImages.length > 0 ? (
                    <div className="relative w-full h-[350px] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <img
                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${project.previewImages[0]}`}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Status Badge - Top Right */}
                      <div className="absolute top-2 right-2">
                        <Badge className={isCreated ? "bg-blue-500/80 text-white border-none backdrop-blur-sm" : "bg-green-500/80 text-white border-none backdrop-blur-sm"}>
                          {isCreated ? 'Created' : 'Purchased'}
                        </Badge>
                      </div>
                      {/* Price Badge - Top Left */}
                      {project.price && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-black/70 text-white border-none backdrop-blur-sm">
                            ${project.price}
                          </Badge>
                        </div>
                      )}
                      {/* Title - Bottom Left (shown on hover) */}
                      <div className="absolute bottom-0 left-0 right-0 h-full flex items-end bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-lg font-bold text-white line-clamp-2">
                          {project.title}
                        </h3>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-400 dark:text-gray-500">No Image</span>
                      {/* Status Badge - Top Right */}
                      <div className="absolute top-2 right-2">
                        <Badge className={isCreated ? "bg-blue-500/80 text-white border-none backdrop-blur-sm" : "bg-green-500/80 text-white border-none backdrop-blur-sm"}>
                          {isCreated ? 'Created' : 'Purchased'}
                        </Badge>
                      </div>
                      {/* Price Badge - Top Left */}
                      {project.price && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-black/70 text-white border-none backdrop-blur-sm">
                            ${project.price}
                          </Badge>
                        </div>
                      )}
                      {/* Title - Bottom Left (shown on hover) */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-lg font-bold text-white line-clamp-2">
                          {project.title}
                        </h3>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
            >
              Next
            </Button>
          </div>
        )}
      </motion.div>

      {/* Project Detail Modal */}
      {showProjectModal && selectedProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm icon flex items-center justify-center p-4 z-50" onClick={() => setShowProjectModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-[32px] p-6 md:p-8 max-w-5xl w-full flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
              <div className="flex gap-4 md:flex-row flex-col items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedProject.title}</h2>
                 
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-xs font-semibold capitalize">
                    {selectedProject.category || 'General'}
                  </Badge>
                  {selectedProject.type === 'created' ? (
                    <Badge className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">Your project</Badge>
                  ) : (
                    <Badge className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">Purchased</Badge>
                  )}
                </div>
              </div>
            
            </div>

<div className="flex">
{
    selectedProject.description
}
</div>
            {/* Content */}
            <div className="flex-1 overflow-hidden mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                <div className="lg:col-span-2 flex flex-col gap-6 h-full overflow-hidden">
                  {/* Gallery */}
                  {renderPreviewImages(selectedProject.previewImages)}

                  {/* Description & Tags */}
                </div>

                {/* Sidebar */}
                <div className="space-y-5 h-full overflow-auto pr-1">
                  <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/60 shadow-sm p-6">
                    {/* <p className="text-sm text-gray-500 dark:text-gray-400">Price</p> */}
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">${selectedProject.price}</span>
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center justify-between">
                        <span>Category</span>
                        <span className="font-semibold text-gray-900 dark:text-white capitalize">{selectedProject.category || 'General'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Purchases</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{selectedProject.purchaseCount || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{selectedProject.type === 'created' ? 'Created' : 'Purchased'}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {new Date(selectedProject.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/60 shadow-sm p-6">
                    {/* <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Creator</h4> */}
                    <div className="flex items-center gap-3">
                      {selectedProject.createdBy?.avatar ? (
                        <img
                          {...getAvatarProps(selectedProject.createdBy.avatar, selectedProject.createdBy.username)}
                          alt={selectedProject.createdBy.username}
                          className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg font-semibold text-gray-500">
                          {selectedProject.createdBy?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedProject.createdBy?.username || 'Unknown creator'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{selectedProject.createdBy?.email || 'Private email'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex">
                    {
                        selectedProject.tags && selectedProject.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {selectedProject.tags.map((tag, idx) => (
                                    <Badge key={idx} className="rounded-full px-3 py-1 text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )
                    }
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => handleDownload(selectedProject._id || selectedProject.id)}
                      className="w-full h-12 text-base font-semibold"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download project
                    </Button>

                    {selectedProject.type === 'created' && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleDelete({ project: selectedProject, type: 'created' })
                          setShowProjectModal(false)
                        }}
                        className="w-full h-12 text-base font-semibold text-red-600 hover:text-red-700 hover:border-red-600"
                      >
                        <Trash2 className="w-5 h-5 mr-2" />
                        Delete project
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default MyBoughtProjects

