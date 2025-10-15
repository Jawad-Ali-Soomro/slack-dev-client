import React, { useState, useEffect } from 'react'
import { githubService } from '../services/githubService'
import { Button } from '../components/ui/button'
import  {useNavigate} from 'react-router-dom'
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
  GitPullRequest, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Tag,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

const GitHubPullRequests = () => {
  const [pullRequests, setPullRequests] = useState([])
  const [repositories, setRepositories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [repositoryFilter, setRepositoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPR, setEditingPR] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    githubUrl: '',
    githubHash: '',
    repository: '',
    assignedTo: '',
    team: '',
    labels: [],
    priority: 'medium',
    estimatedHours: '',
    dueDate: ''
  })
  const [labelInput, setLabelInput] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [prsResponse, reposResponse] = await Promise.all([
        githubService.getPullRequests({
          search: searchTerm,
          status: statusFilter === 'all' ? undefined : statusFilter,
          repository: repositoryFilter === 'all' ? undefined : repositoryFilter,
          priority: priorityFilter === 'all' ? undefined : priorityFilter
        }),
        githubService.getRepositories()
      ])
      setPullRequests(prsResponse.pullRequests || [])
      setRepositories(reposResponse.repositories || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchData()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, statusFilter, repositoryFilter, priorityFilter])

  const handleCreatePullRequest = async () => {
    try {
      const prData = {
        ...formData,
        labels: formData.labels.filter(label => label.trim() !== ''),
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined
      }
      
      await githubService.createPullRequest(prData)
      toast.success('Pull request created successfully')
      setIsCreateDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error creating pull request:', error)
      toast.error(error.message || 'Failed to create pull request')
    }
  }

  const handleUpdatePullRequest = async () => {
    try {
      const updateData = {
        ...formData,
        labels: formData.labels.filter(label => label.trim() !== ''),
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined
      }
      
      await githubService.updatePullRequest(editingPR._id, updateData)
      toast.success('Pull request updated successfully')
      setIsEditDialogOpen(false)
      setEditingPR(null)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error updating pull request:', error)
      toast.error(error.message || 'Failed to update pull request')
    }
  }

  const handleDeletePullRequest = async (id) => {
    if (!confirm('Are you sure you want to delete this pull request?')) {
      return
    }

    try {
      await githubService.deletePullRequest(id)
      toast.success('Pull request deleted successfully')
      fetchData()
    } catch (error) {
      console.error('Error deleting pull request:', error)
      toast.error(error.message || 'Failed to delete pull request')
    }
  }

  const handleEditPullRequest = (pr) => {
    setEditingPR(pr)
    setFormData({
      title: pr.title,
      description: pr.description || '',
      githubUrl: pr.githubUrl,
      githubHash: pr.githubHash,
      repository: pr.repository._id,
      assignedTo: pr.assignedTo?._id || '',
      team: pr.team?._id || '',
      labels: pr.labels || [],
      priority: pr.priority,
      estimatedHours: pr.estimatedHours?.toString() || '',
      dueDate: pr.dueDate ? new Date(pr.dueDate).toISOString().split('T')[0] : ''
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      githubUrl: '',
      githubHash: '',
      repository: '',
      assignedTo: '',
      team: '',
      labels: [],
      priority: 'medium',
      estimatedHours: '',
      dueDate: ''
    })
    setLabelInput('')
  }

  const addLabel = () => {
    if (labelInput.trim() && !formData.labels.includes(labelInput.trim())) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, labelInput.trim()]
      }))
      setLabelInput('')
    }
  }

  const removeLabel = (labelToRemove) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label !== labelToRemove)
    }))
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'closed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'merged':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'merged':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Pull Requests</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and manage your GitHub pull requests
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Pull Request
          </Button>
        </div>

        {/* Custom Create Modal */}
        {isCreateDialogOpen && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsCreateDialogOpen(false)}>
            <div className="bg-white dark:bg-black border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Add New Pull Request</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Log a new GitHub pull request for tracking
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Pull request title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Pull request description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="githubUrl">GitHub URL</Label>
                    <Input
                      id="githubUrl"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                      placeholder="https://github.com/owner/repo/pull/123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="githubHash">PR Number/Hash</Label>
                    <Input
                      id="githubHash"
                      value={formData.githubHash}
                      onChange={(e) => setFormData(prev => ({ ...prev, githubHash: e.target.value }))}
                      placeholder="123"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="repository">Repository</Label>
                    <Select value={formData.repository} onValueChange={(value) => setFormData(prev => ({ ...prev, repository: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select repository" />
                      </SelectTrigger>
                      <SelectContent className="z-[60]">
                        {repositories.map((repo) => (
                          <SelectItem key={repo._id} value={repo._id}>
                            {repo.owner?.username || 'Unknown'}/{repo.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[60]">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estimatedHours">Estimated Hours</Label>
                    <Input
                      id="estimatedHours"
                      type="number"
                      value={formData.estimatedHours}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Labels</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={labelInput}
                      onChange={(e) => setLabelInput(e.target.value)}
                      placeholder="Add a label"
                      onKeyPress={(e) => e.key === 'Enter' && addLabel()}
                    />
                    <Button type="button" onClick={addLabel}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.labels.map((label, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeLabel(label)}>
                        {label} ×
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePullRequest}>
                    Create Pull Request
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search pull requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="merged">Merged</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={repositoryFilter} onValueChange={setRepositoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Repository" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Repositories</SelectItem>
              {repositories.map((repo) => (
                <SelectItem key={repo._id} value={repo._id}>
                  {repo.owner?.username || 'Unknown'}/{repo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <Card key={index} className="p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : pullRequests.length === 0 ? (
        <div className="text-center py-12">
          <GitPullRequest className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No pull requests found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'You haven\'t logged any pull requests yet'}
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Pull Request
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pull Request</TableHead>
                  <TableHead>Repository</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pullRequests.map((pr) => (
                  <TableRow key={pr._id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                            {pr.title?.charAt(0)?.toUpperCase() || 'P'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            {getStatusIcon(pr.status)}
                            {pr.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            #{pr.githubHash}
                          </div>
                          {pr.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {pr.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {pr.repository?.owner?.username || 'Unknown'}/{pr.repository?.name || 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(pr.status)}>
                        {pr.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(pr.priority)}>
                        {pr.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {pr.assignedTo?.slice(0, 3).map((user, index) => (
                          <div key={index} className="relative">
                            {user.avatar ? (
                              <img className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800" src={`http://localhost:4000${user.avatar}`} alt={user.username} />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-semibold text-xs border-2 border-white dark:border-gray-800">
                                {user.username?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                            )}
                          </div>
                        ))}
                        {pr.assignedTo?.length > 3 && (
                          <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-800">
                            +{pr.assignedTo.length - 3}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {pr.dueDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(pr.dueDate)}
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(pr.githubUrl, '_blank')}
                          className="hover:bg-blue-100 dark:hover:bg-blue-900/20"
                        >
                          <ExternalLink className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditPullRequest(pr)}
                          className="hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeletePullRequest(pr._id)}
                          className="hover:bg-red-100 dark:hover:bg-red-900/20"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Edit Pull Request</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Update pull request information
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
                <Label htmlFor="edit-githubUrl">GitHub URL</Label>
                <Input
                  id="edit-githubUrl"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-githubHash">PR Number/Hash</Label>
                <Input
                  id="edit-githubHash"
                  value={formData.githubHash}
                  onChange={(e) => setFormData(prev => ({ ...prev, githubHash: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-repository">Repository</Label>
                <Select value={formData.repository} onValueChange={(value) => setFormData(prev => ({ ...prev, repository: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select repository" />
                  </SelectTrigger>
                  <SelectContent className="z-[60]">
                    {repositories.map((repo) => (
                      <SelectItem key={repo._id} value={repo._id}>
                        {repo.owner?.username || 'Unknown'}/{repo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[60]">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-estimatedHours">Estimated Hours</Label>
                <Input
                  id="edit-estimatedHours"
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Labels</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  placeholder="Add a label"
                  onKeyPress={(e) => e.key === 'Enter' && addLabel()}
                />
                <Button type="button" onClick={addLabel}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.labels.map((label, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeLabel(label)}>
                    {label} ×
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePullRequest}>
                Update Pull Request
              </Button>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GitHubPullRequests
