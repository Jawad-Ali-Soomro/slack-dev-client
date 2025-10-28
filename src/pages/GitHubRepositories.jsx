import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HorizontalLoader from '../components/HorizontalLoader'
import { githubService } from '../services/githubService'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
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
  Loader
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
    <div className='mt-10 ambient-light'>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
          <div className="flex gap-4">
          <div className="relative flex-1 max-w-[600px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-[500px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 px-5 cursor-pointer">
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
            <Button onClick={() => setIsCreateDialogOpen(true)} className={'w-[200px]'}>
              <Plus className="h-4 w-4 mr-2" />
              Add Repository
            </Button>
            <Button 
              onClick={() => setIsGitHubUserModalOpen(true)} 
              variant="outline"
              className={'w-[200px]'}
            >
              <Github className="h-4 w-4 mr-2" />
              Import from GitHub
            </Button>
          </div>
        </div>

        {/* Custom Create Modal */}
        {isCreateDialogOpen && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsCreateDialogOpen(false)}>
            <div className="bg-white dark:bg-black rounded-[30px] border p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Add New Repository</h2>
                 
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className={'w-12'}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Repository Name"
                  />
                </div>
                <div>
                  <Input
                    value={formData.githubUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                    placeholder="GitHub URL (https://github.com/owner/repo)"
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
                    <SelectTrigger>
                      <SelectValue placeholder="Select contributors from friends" />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      {friends.map((friend) => (
                        <SelectItem key={friend._id} value={friend._id}>
                          <div className="flex items-center gap-2">
                            {friend.avatar ? (
                              <img src={`http://localhost:4000${friend.avatar}`} alt={friend.username} className="w-5 h-5 rounded-full" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
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
                            <img src={`http://localhost:4000${contributor.avatar}`} alt={contributor.username} className="w-4 h-4 rounded-full" />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
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
          <h3 className="text-lg font-semibold mb-2">No repositories found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'You haven\'t registered any repositories yet'}
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Repository
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-black rounded-[10px] shadow-xl overflow-hidden">
          <div className="overflow-x-auto max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            <Table>
              <TableHeader className="bg-gray-100 text-black dark:border-gray-700 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="px-6 py-4 text-left dark:text-black text-xs font-bold  uppercase tracking-wider">
                    Repository
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left dark:text-black text-xs font-bold  uppercase tracking-wider">
                    Owner
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left dark:text-black text-xs font-bold  uppercase tracking-wider">
                    Contributors
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left dark:text-black text-xs font-bold  uppercase tracking-wider">
                    Language
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left dark:text-black text-xs font-bold  uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left dark:text-black text-xs font-bold  uppercase tracking-wider">
                    Updated
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left dark:text-black text-xs font-bold  uppercase tracking-wider">
                    
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRepositories.map((repo) => (
                  <TableRow key={repo._id} className="hover:bg-gray-50 dark:hover:bg-black transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center">
                        
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            {/* <Code className="h-4 w-4 text-gray-500" /> */}
                            {repo.name}
                          </div>
                          
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          {repo.owner?.avatar ? (
                            <img className="h-8 w-8 rounded-full" src={`http://localhost:4000${repo.owner.avatar}`} alt={repo.owner.username} />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-semibold text-xs">
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
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {repo.contributors?.slice(0, 3).map((contributor, index) => (
                          <div key={index} className="relative">
                            {contributor.avatar ? (
                                <img className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800" src={`http://localhost:4000${contributor.avatar}`} alt={contributor.username} />
                                ) : (
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-semibold text-xs border-2 border-white dark:border-gray-800">
                                {contributor.username?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                            )}
                          </div>
                        ))}
                        {repo.contributors?.length > 3 && (
                          <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-800">
                            +{repo.contributors.length - 3}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {repo.language ? (
                        <Badge variant="secondary" className="bg-blue-200 text-black dark:bg-blue-900 dark:text-white px-3 py-2">
                          {repo.language}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={repo.isPrivate ? "destructive" : "outline"}
                          className={repo.isPrivate ? "bg-red-200 text-black dark:bg-red-900 dark:text-white px-3 py-2" : "bg-green-200 text-black dark:bg-green-900 dark:text-white px-3 py-2"}
                        >
                          {repo.isPrivate ? (
                            <>
                              <Lock className="h-3 w-3 mr-1" />
                              Private
                            </>
                          ) : (
                            <>
                              <Globe className="h-3 w-3 mr-1" />
                              Public
                            </>
                          )}
                        </Badge>
                        <Badge variant="outline" className="bg-gray-100 text-black dark:bg-gray-900 dark:text-white px-3 py-2">
                          {repo.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(repo.updatedAt)}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditRepository(repo)}
                          className="w-12 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(repo.githubUrl, '_blank')}
                          className="w-12 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                        >
                          <ExternalLink className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteRepository(repo._id)}
                          className="w-12 hover:bg-red-100 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Custom Edit Modal */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsEditDialogOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-[30px] border p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Edit Repository</h2>
              
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditDialogOpen(false)}
                className="cursor-pointer w-12"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          <div className="space-y-4">
            <div>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Input
                id="edit-githubUrl"
                value={formData.githubUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-language">Language</Label>
                <Input
                  id="edit-language"
                  value={formData.language}
                  onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isPrivate"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                />
                <Label htmlFor="edit-isPrivate">Private Repository</Label>
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
                          <img src={`http://localhost:4000${friend.avatar}`} alt={friend.username} className="w-5 h-5 rounded-full" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
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
                        <img src={`http://localhost:4000${contributor.avatar}`} alt={contributor.username} className="w-4 h-4 rounded-full" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
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
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" onClick={addTag}><Plus /></Button>
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
