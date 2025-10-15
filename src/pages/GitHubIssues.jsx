import React, { useState, useEffect } from 'react'
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
  AlertCircle, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Tag,
  Bug,
  Lightbulb,
  FileText,
  HelpCircle,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

const GitHubIssues = () => {
  const [issues, setIssues] = useState([])
  const [repositories, setRepositories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [repositoryFilter, setRepositoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingIssue, setEditingIssue] = useState(null)
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
    type: 'bug',
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
      const [issuesResponse, reposResponse] = await Promise.all([
        githubService.getIssues({
          search: searchTerm,
          status: statusFilter === 'all' ? undefined : statusFilter,
          repository: repositoryFilter === 'all' ? undefined : repositoryFilter,
          priority: priorityFilter === 'all' ? undefined : priorityFilter,
          type: typeFilter === 'all' ? undefined : typeFilter
        }),
        githubService.getRepositories()
      ])
      setIssues(issuesResponse.issues || [])
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
  }, [searchTerm, statusFilter, repositoryFilter, priorityFilter, typeFilter])

  const handleCreateIssue = async () => {
    try {
      const issueData = {
        ...formData,
        labels: formData.labels.filter(label => label.trim() !== ''),
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined
      }
      
      await githubService.createIssue(issueData)
      toast.success('Issue created successfully')
      setIsCreateDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error creating issue:', error)
      toast.error(error.message || 'Failed to create issue')
    }
  }

  const handleUpdateIssue = async () => {
    try {
      const updateData = {
        ...formData,
        labels: formData.labels.filter(label => label.trim() !== ''),
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined
      }
      
      await githubService.updateIssue(editingIssue._id, updateData)
      toast.success('Issue updated successfully')
      setIsEditDialogOpen(false)
      setEditingIssue(null)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error updating issue:', error)
      toast.error(error.message || 'Failed to update issue')
    }
  }

  const handleDeleteIssue = async (id) => {
    if (!confirm('Are you sure you want to delete this issue?')) {
      return
    }

    try {
      await githubService.deleteIssue(id)
      toast.success('Issue deleted successfully')
      fetchData()
    } catch (error) {
      console.error('Error deleting issue:', error)
      toast.error(error.message || 'Failed to delete issue')
    }
  }

  const handleEditIssue = (issue) => {
    setEditingIssue(issue)
    setFormData({
      title: issue.title,
      description: issue.description || '',
      githubUrl: issue.githubUrl,
      githubHash: issue.githubHash,
      repository: issue.repository._id,
      assignedTo: issue.assignedTo?._id || '',
      team: issue.team?._id || '',
      labels: issue.labels || [],
      priority: issue.priority,
      type: issue.type,
      estimatedHours: issue.estimatedHours?.toString() || '',
      dueDate: issue.dueDate ? new Date(issue.dueDate).toISOString().split('T')[0] : ''
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
      type: 'bug',
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
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
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
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'resolved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bug':
        return <Bug className="h-4 w-4 text-red-500" />
      case 'feature':
        return <Lightbulb className="h-4 w-4 text-green-500" />
      case 'enhancement':
        return <Zap className="h-4 w-4 text-blue-500" />
      case 'documentation':
        return <FileText className="h-4 w-4 text-purple-500" />
      case 'question':
        return <HelpCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'bug':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'feature':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'enhancement':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'documentation':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'question':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
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
            <h1 className="text-3xl font-bold mb-2">Issues</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and manage your GitHub issues
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Issue
          </Button>
        </div>

        {/* Custom Create Modal */}
        {isCreateDialogOpen && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsCreateDialogOpen(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Add New Issue</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Log a new GitHub issue for tracking
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
                    placeholder="Issue title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Issue description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="githubUrl">GitHub URL</Label>
                    <Input
                      id="githubUrl"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                      placeholder="https://github.com/owner/repo/issues/123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="githubHash">Issue Number/Hash</Label>
                    <Input
                      id="githubHash"
                      value={formData.githubHash}
                      onChange={(e) => setFormData(prev => ({ ...prev, githubHash: e.target.value }))}
                      placeholder="123"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
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
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[60]">
                        <SelectItem value="bug">Bug</SelectItem>
                        <SelectItem value="feature">Feature</SelectItem>
                        <SelectItem value="enhancement">Enhancement</SelectItem>
                        <SelectItem value="documentation">Documentation</SelectItem>
                        <SelectItem value="question">Question</SelectItem>
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
                  <Button onClick={handleCreateIssue}>
                    Create Issue
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
              placeholder="Search issues..."
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
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
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
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="feature">Feature</SelectItem>
              <SelectItem value="enhancement">Enhancement</SelectItem>
              <SelectItem value="documentation">Documentation</SelectItem>
              <SelectItem value="question">Question</SelectItem>
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
      ) : issues.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No issues found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'You haven\'t logged any issues yet'}
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Issue
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issue</TableHead>
                  <TableHead>Repository</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issues.map((issue) => (
                  <TableRow key={issue._id}>
                    <TableCell>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(issue.status)}
                      <h3 className="font-semibold text-lg">{issue.title}</h3>
                      <Badge className={getStatusColor(issue.status)}>
                        {issue.status}
                      </Badge>
                      <Badge className={getPriorityColor(issue.priority)}>
                        {issue.priority}
                      </Badge>
                      <Badge className={getTypeColor(issue.type)}>
                        {getTypeIcon(issue.type)}
                        <span className="ml-1">{issue.type}</span>
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {issue.repository?.owner}/{issue.repository?.name} • #{issue.githubHash}
                    </p>
                    {issue.description && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {issue.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      {issue.estimatedHours && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{issue.estimatedHours}h estimated</span>
                        </div>
                      )}
                      {issue.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due {formatDate(issue.dueDate)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>Created {formatDate(issue.createdAt)}</span>
                      </div>
                    </div>
                    {issue.labels && issue.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {issue.labels.map((label, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {label}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 ml-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditIssue(issue)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteIssue(issue._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(issue.githubUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
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
                <h2 className="text-xl font-semibold">Edit Issue</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Update issue information
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
                <Label htmlFor="edit-githubHash">Issue Number/Hash</Label>
                <Input
                  id="edit-githubHash"
                  value={formData.githubHash}
                  onChange={(e) => setFormData(prev => ({ ...prev, githubHash: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
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
                <Label htmlFor="edit-type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[60]">
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="enhancement">Enhancement</SelectItem>
                    <SelectItem value="documentation">Documentation</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
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
              <Button onClick={handleUpdateIssue}>
                Update Issue
              </Button>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GitHubIssues
