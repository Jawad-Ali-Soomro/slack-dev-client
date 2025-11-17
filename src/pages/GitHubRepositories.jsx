import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HorizontalLoader from '../components/HorizontalLoader'
import { githubService } from '../services/githubService'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { getInputClasses } from '../utils/uiConstants'
// Removed Dialog import - using custom modal
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { 
  Plus, 
  Search, 
  Github, 
  ExternalLink, 
  Edit, 
  Trash2, 
  FolderOpen,
  Code,
  Lock,
  Globe,
  Calendar,
  Tag,
  User,
  XCircle,
  Loader,
  Import,
  Folder
} from 'lucide-react'
import { toast } from 'sonner'
import GitHubUserReposModal from '../components/GitHubUserReposModal'

const GitHubRepositories = () => {
  const [repositories, setRepositories] = useState([])
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isGitHubUserModalOpen, setIsGitHubUserModalOpen] = useState(false)
  const [editingRepo, setEditingRepo] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    githubUrl: '',
    language: '',
    isPrivate: false,
    tags: [],
    contributors: []
  })
  const [tagInput, setTagInput] = useState('')
  const navigate = useNavigate()

  const tableHeadClass = 'sticky top-0 z-30 bg-white dark:text-black px-6 py-4 text-left text-xs uppercase tracking-wider font-semibold text-gray-900 shadow-sm'

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchData()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, statusFilter])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [reposResponse, friendsResponse] = await Promise.all([
        githubService.getRepositories({
          search: searchTerm,
          status: statusFilter === 'all' ? undefined : statusFilter
        }),
        githubService.getFriends()
      ])
      setRepositories(reposResponse.repositories || [])
      setFriends(friendsResponse.friends || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRepository = async () => {
    try {
      const repositoryData = {
        ...formData,
        tags: formData.tags.filter(tag => tag.trim() !== '')
      }
      
      await githubService.createRepository(repositoryData)
      toast.success('Repository created successfully')
      setIsCreateDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error creating repository:', error)
      toast.error(error.message || 'Failed to create repository')
    }
  }

  const handleCreateFromGitHub = async (repoData) => {
    try {
      await githubService.createRepository(repoData)
      toast.success('Repository imported successfully')
      fetchData()
    } catch (error) {
      console.error('Error importing repository:', error)
      toast.error(error.message || 'Failed to import repository')
      throw error
    }
  }

  const handleUpdateRepository = async () => {
    try {
      const updateData = {
        ...formData,
        tags: formData.tags.filter(tag => tag.trim() !== '')
      }
      
      await githubService.updateRepository(editingRepo._id, updateData)
      toast.success('Repository updated successfully')
      setIsEditDialogOpen(false)
      setEditingRepo(null)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error updating repository:', error)
      toast.error(error.message || 'Failed to update repository')
    }
  }

  const handleDeleteRepository = async (id) => {
    if (!confirm('Are you sure you want to delete this repository? This will also delete all associated PRs and issues.')) {
      return
    }

    try {
      await githubService.deleteRepository(id)
      toast.success('Repository deleted successfully')
      fetchData()
    } catch (error) {
      console.error('Error deleting repository:', error)
      toast.error(error.message || 'Failed to delete repository')
    }
  }

  const handleEditRepository = (repo) => {
    setEditingRepo(repo)
    setFormData({
      name: repo.name,
      description: repo.description || '',
      githubUrl: repo.githubUrl,
      language: repo.language || '',
      isPrivate: repo.isPrivate,
      tags: repo.tags || [],
      contributors: repo.contributors?.map(c => c._id) || []
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      githubUrl: '',
      language: '',
      isPrivate: false,
      tags: [],
      contributors: []
    })
    setTagInput('')
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredRepositories = repositories.filter(repo =>
    repo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.owner?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="ambient-light pt-10">
      <div className="flex py-6 gap-3 items-center fixed z-10 -top-3 z-10">
        <div className="flex p-2 border-2 items-center gap-2 pr-10 rounded-[50px]">
        <div className="flex p-3 bg-white dark:bg-gray-800 rounded-full">
                  <Github  size={15} />
                  </div>
                  <h1 className="text-2xl font-bold">Your Repositories</h1>
                  </div>
                </div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
          <div className="flex gap-4">
          <div className="relative flex-1 max-w-[600px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 icon" />
            <Input
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={getInputClasses('default', 'md', 'pl-10 w-full sm:w-[500px] bg-white dark:bg-[#111827] text-black dark:text-white')}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 px-5 cursor-pointer bg-white dark:bg-[#111827] text-black dark:text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="all">All Status</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="active">Active</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="archived">Archived</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="deprecated">Deprecated</SelectItem>
            </SelectContent>
          </Select>
        </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setIsCreateDialogOpen(true)} className={'w-[200px] font-bold'}>
              {/* <Plus className="h-4 w-4 icon mr-2" /> */}
              New Repository
            </Button>
            <Button 
              onClick={() => setIsGitHubUserModalOpen(true)} 
              variant="outline"
              className={'w-[200px] font-bold'}
            >
              <Import className="h-4 w-4 icon mr-2" />
              Import from github
            </Button>
          </div>
        </div>

        {/* Custom Create Modal */}
        {isCreateDialogOpen && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsCreateDialogOpen(false)}>
            <div className="bg-white dark:bg-[#111827] rounded-[20px] border p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
           
              <div className="space-y-4">
                <div>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Repository Name"
                    className={getInputClasses('default', 'md', 'bg-white dark:bg-transparent text-black dark:text-white')}
                  />
                </div>
                <div>
                  <Input
                    value={formData.githubUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                    placeholder="GitHub URL (https://github.com/owner/repo)"
                    className={getInputClasses('default', 'md', 'bg-white dark:bg-transparent text-black dark:text-white')}
                  />
                </div>
                <div>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Repository Description"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Input
                      value={formData.language}
                      onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                      placeholder="Language (JavaScript, Python, etc.)"
                      className={getInputClasses('default', 'md', 'bg-white dark:bg-transparent text-black dark:text-white')}
                    />
                  </div>
                  
                </div>
                <div>
                  <Select 
                    value="" 
                    onValueChange={(value) => {
                      if (value && !formData.contributors.includes(value)) {
                        setFormData(prev => ({
                          ...prev,
                          contributors: [...prev.contributors, value]
                        }))
                      }
                    }}
                  >
                    <SelectTrigger className={getInputClasses('default', 'md', 'bg-white dark:bg-transparent text-black dark:text-white')}>
                      <SelectValue placeholder="Select contributors from friends" />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      {friends.map((friend) => (
                        <SelectItem key={friend._id} value={friend._id}>
                          <div className="flex items-center gap-2 rounded-full">
                            {friend.avatar ? (
                              <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${friend.avatar}`} alt={friend.username} className="w-5 h-5 icon rounded-full" />
                            ) : (
                              <div className="w-5 h-5 icon rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white  text-xs">
                                {friend.username?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                            )}
                            <span>{friend.username} ({friend.email})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.contributors.map((contributorId) => {
                      const contributor = friends.find(f => f._id === contributorId)
                      return (
                        <Badge key={contributorId} variant="secondary" className="cursor-pointer flex items-center gap-1" onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            contributors: prev.contributors.filter(id => id !== contributorId)
                          }))
                        }}>
                          {contributor?.avatar ? (
                            <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${contributor.avatar}`} alt={contributor.username} className="w-4 h-4 icon rounded-full" />
                          ) : (
                            <div className="w-4 h-4 icon rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white  text-xs">
                              {contributor?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                          {contributor?.username} ×
                        </Badge>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className={getInputClasses('default', 'md', 'flex-1 bg-white dark:bg-transparent text-black dark:text-white')}
                    />
                    <Button type="button" className={'w-12'} onClick={addTag}><Plus /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRepository}>
                    Create Repository
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

       
      </div>

      {loading ? (
        <HorizontalLoader 
          message="Loading repositories..."
          subMessage="Fetching your GitHub repositories"
          progress={80}
          className="py-12"
        />
      ) : filteredRepositories.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg  mb-2">No repositories found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'You haven\'t registered any repositories yet'}
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 icon mr-2" />
            Add Your First Repository
          </Button>
        </div>
      ) : (
        <div className="bg-whitedark:bg-[#111827] rounded-[10px] shadow-xl overflow-hidden">
          <div className="overflow-x-auto max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            <table className="w-full">
              <thead className="sticky top-0 z-20 bg-white dark:bg-[white] border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <tr>
                  <th className={tableHeadClass}>
                    Repository
                  </th>
                  <th className={tableHeadClass}>
                    Owner
                  </th>
                  <th className={tableHeadClass}>
                    Contributors
                  </th>
                  <th className={tableHeadClass}>
                    Language
                  </th>
                  <th className={tableHeadClass}>
                    Status
                  </th>
                  <th className={tableHeadClass}>
                    Last Updated
                  </th>
                  <th className={tableHeadClass}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRepositories.map((repo) => (
                  <tr key={repo._id} className="hover:bg-gray-50 dark:hover:bg-[#111827] bg-white dark:bg-[#111827] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        
                          <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2 font-semibold">
                            <Folder className="h-4 w-4 icon text-gray-500" />
                            {repo.name}
                          </div>
                          
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          {repo.owner?.avatar ? (
                            <img className="h-8 w-8 rounded-full" src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${repo.owner.avatar}`} alt={repo.owner.username} />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white  text-xs">
                              {repo.owner?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {repo.owner?.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {repo.contributors?.slice(0, 3).map((contributor, index) => (
                          <div key={index} className="relative">
                            {contributor.avatar ? (
                                <img className="h-8 w-8 rounded-full  border-white dark:border-gray-800" src={`http://localhost:4000${contributor.avatar}`} alt={contributor.username} />
                                ) : (
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white  text-xs  border-white dark:border-gray-800">
                                {contributor.username?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                            )}
                          </div>
                        ))}
                        {repo.contributors?.length > 3 && (
                          <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300  border-white dark:border-gray-800">
                            +{repo.contributors.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {repo.language ? (
                        <Badge variant="secondary" className="bg-blue-500 text-white dark:bg-blue-900 dark:text-white px-3 py-2">
                          {repo.language}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Badge 
                          // variant={repo.isPrivate ? "destructive" : "outline"}
                          className={repo.isPrivate ? "bg-red-500 text-white dark:bg-red-900 dark:text-white px-3 py-2" : "bg-green-500 text-white dark:bg-green-900 dark:text-white px-3 py-2"}
                        >
                          {repo.isPrivate ? (
                            <>
                              <Lock className="h-3 w-3 icon mr-1" />
                              Private
                            </>
                          ) : (
                            <>
                              <Globe className="h-3 w-3 icon mr-1" />
                              Public
                            </>
                          )}
                        </Badge>
                        <Badge variant="outline" className="bg-gray-100 text-black dark:bg-gray-900 dark:text-white px-3 py-2">
                          {repo.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 icon" />
                        {formatDate(repo.updatedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditRepository(repo)}
                          className="w-12 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit className="h-4 w-4 icon" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(repo.githubUrl, '_blank')}
                          className="w-12 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                        >
                          <ExternalLink className="h-4 w-4 icon text-blue-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteRepository(repo._id)}
                          className="w-12 hover:bg-red-100 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4 icon text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Custom Edit Modal */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsEditDialogOpen(false)}>
          <div className="bg-whitedark:bg-[#111827] border rounded-[10px] border p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl ">Edit Repository</h2>
              
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditDialogOpen(false)}
                className="cursor-pointer w-12"
              >
                <XCircle className="h-4 w-4 icon" />
              </Button>
            </div>
          <div className="space-y-4">
            <div>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={getInputClasses('default', 'md')}
              />
            </div>
            <div>
              <Input
                id="edit-githubUrl"
                value={formData.githubUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                className={getInputClasses('default', 'md')}
              />
            </div>
            <div>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 items-center justify-center">
              <div>
                <Input
                  id="edit-language"
                  value={formData.language}
                  onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                  className={getInputClasses('default', 'md')}
                />
              </div>
              <div className="flex items-center py-5 justify-end gap-2 h-full">
             
                <Badge
                  variant={formData.isPrivate ? "outline" : "default"}
                  className={`cursor-pointer select-none w-1/2 h-12 ${!formData.isPrivate ? 'bg-green-500 text-white' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, isPrivate: false }))}
                >
                  <Globe className="w-3 h-3 icon" /> Public
                </Badge>
                <Badge
                  variant={formData.isPrivate ? "default" : "outline"}
                  className={`cursor-pointer select-none w-1/2 h-12 ${formData.isPrivate ? 'bg-red-500 text-white' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, isPrivate: true }))}
                >
                  <Lock className="w-3 h-3 icon" /> Private
                </Badge>
              </div>
            </div>
            <div>
              <Select 
                value="" 
                onValueChange={(value) => {
                  if (value && !formData.contributors.includes(value)) {
                    setFormData(prev => ({
                      ...prev,
                      contributors: [...prev.contributors, value]
                    }))
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contributors from friends" />
                </SelectTrigger>
                <SelectContent className="z-[60]">
                  {friends.map((friend) => (
                    <SelectItem key={friend._id} value={friend._id}>
                      <div className="flex items-center gap-2">
                        {friend.avatar ? (
                          <img src={`http://localhost:4000${friend.avatar}`} alt={friend.username} className="w-5 h-5 icon rounded-full" />
                        ) : (
                          <div className="w-5 h-5 icon rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white  text-xs">
                            {friend.username?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <span>{friend.username} ({friend.email})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.contributors.map((contributorId) => {
                  const contributor = friends.find(f => f._id === contributorId)
                  return (
                    <Badge key={contributorId} variant="secondary" className="cursor-pointer flex items-center gap-1" onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        contributors: prev.contributors.filter(id => id !== contributorId)
                      }))
                    }}>
                      {contributor?.avatar ? (
                        <img src={`http://localhost:4000${contributor.avatar}`} alt={contributor.username} className="w-4 h-4 icon rounded-full" />
                      ) : (
                        <div className="w-4 h-4 icon rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white  text-xs">
                          {contributor?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                      {contributor?.username} ×
                    </Badge>
                  )
                })}
              </div>
            </div>
            <div>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className={getInputClasses('default', 'md', 'flex-1')}
                />
                <Button type="button" className="w-12" onClick={addTag}><Plus /></Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateRepository}>
                Update Repository
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* GitHub User Repos Modal */}
      <GitHubUserReposModal
        isOpen={isGitHubUserModalOpen}
        onClose={() => setIsGitHubUserModalOpen(false)}
        onCreateRepository={handleCreateFromGitHub}
        existingRepositories={repositories}
      />
    </div>
  )
}

export default GitHubRepositories
