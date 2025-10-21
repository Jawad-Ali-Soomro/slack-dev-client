import React, { useState, useEffect } from 'react'
import { githubService } from '../services/githubService'
import { useNavigate } from 'react-router-dom'
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
  Zap,
  Github
} from 'lucide-react'
import { toast } from 'sonner'
import GitHubIssuesModal from '../components/GitHubIssuesModal'

const GitHubIssues = () => {
  const [issues, setIssues] = useState([])
  const [repositories, setRepositories] = useState([])
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [repositoryFilter, setRepositoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isGitHubIssuesModalOpen, setIsGitHubIssuesModalOpen] = useState(false)
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
      const [issuesResponse, reposResponse, friendsResponse] = await Promise.all([
        githubService.getIssues({
          search: searchTerm,
          status: statusFilter === 'all' ? undefined : statusFilter,
          repository: repositoryFilter === 'all' ? undefined : repositoryFilter,
          priority: priorityFilter === 'all' ? undefined : priorityFilter,
          type: typeFilter === 'all' ? undefined : typeFilter
        }),
        githubService.getRepositories(),
        githubService.getFriends()
      ])
      setIssues(issuesResponse.issues || [])
      setRepositories(reposResponse.repositories || [])
      setFriends(friendsResponse.friends || [])
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
        assignedTo: formData.assignedTo === 'none' ? undefined : formData.assignedTo,
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

  const handleCreateFromGitHub = async (issueData) => {
    try {
      await githubService.createIssue(issueData)
      toast.success('Issue imported successfully')
      fetchData()
    } catch (error) {
      console.error('Error importing issue:', error)
      toast.error(error.message || 'Failed to import issue')
      throw error
    }
  }

  const handleUpdateIssue = async () => {
    try {
      const updateData = {
        ...formData,
        assignedTo: formData.assignedTo === 'none' ? undefined : formData.assignedTo,
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
          <div className="flex gap-3">
            <Button onClick={() => setIsCreateDialogOpen(true)} className={'w-[200px]'}>
              <Plus className="h-4 w-4 mr-2" />
              New Issue
            </Button>
            <Button 
              onClick={() => setIsGitHubIssuesModalOpen(true)} 
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
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsCreateDialogOpen(false)}>
            <div className="bg-white dark:bg-black rounded-none border p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
                  className={'w-12'}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Issue title"
                  />
                </div>
                <div>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Issue description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      id="githubUrl"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                      placeholder="https://github.com/owner/repo/issues/123"
                    />
                  </div>
                  <div>
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
                    <Input
                      id="estimatedHours"
                      type="number"
                      value={formData.estimatedHours}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Select 
                    value={formData.assignedTo} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assigned user" />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      <SelectItem value="none">No one assigned</SelectItem>
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
                </div>
                <div>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={labelInput}
                      onChange={(e) => setLabelInput(e.target.value)}
                      placeholder="Add a label"
                      onKeyPress={(e) => e.key === 'Enter' && addLabel()}
                    />
                    <Button type="button" onClick={addLabel} className={'w-12'}><Plus /></Button>
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
          <div className="relative flex-1 max-w-[600px]">
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

      {loading ? null : issues.length === 0 ? (
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
        <div className="bg-white dark:bg-black rounded-none shadow-xl overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            <Table>
              <TableHeader className="bg-gray-100 dark:bg-gray-900 dark:border-gray-700 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Issue
                      </TableHead>
                      <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Issue Hash
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Repository
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Priority
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Assigned To
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Due Date
                  </TableHead>
                  <TableHead className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                {issues.map((issue) => (
                  <TableRow key={issue._id} className="hover:bg-gray-50 dark:hover:bg-black transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center">
                       
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            {getStatusIcon(issue.status)}
                            {issue.title}
                          </div>
                         
                         
                      </div>
                    </TableCell>
                    <TableCell className={'px-6 py-4'}>
                       <div className="text-sm text-gray-500 dark:text-gray-400">
                            #{issue.githubHash}
                          </div>
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {issue.repository?.name}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge className={getStatusColor(issue.status) + " px-3 py-2"}>
                        {issue.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge className={getPriorityColor(issue.priority) + " px-3 py-2"}>
                        {issue.priority}
                      </Badge>
                    </TableCell>
                  <TableCell className="px-6 py-4">
  <div className="flex -space-x-2">
    {issue?.assignedTo ? (
      issue.assignedTo.avatar ? (
        <img
          className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800"
          src={`http://localhost:4000${issue.assignedTo.avatar}`}
          alt={issue.assignedTo.username}
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-semibold text-xs border-2 border-white dark:border-gray-800">
          {issue.assignedTo.username?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      )
    ) : (
      <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-white font-semibold text-xs border-2 border-white dark:border-gray-800">
        U
      </div>
    )}
  </div>
</TableCell>

                    <TableCell className="px-6 py-4">
                      {issue.dueDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(issue.dueDate)}
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(issue.githubUrl, '_blank')}
                          className="hover:bg-blue-100 dark:hover:bg-blue-900/20"
                        >
                          <ExternalLink className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditIssue(issue)}
                          className="hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteIssue(issue._id)}
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
          <div className="bg-white dark:bg-gray-800 rounded-none border p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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

      {/* GitHub Issues Modal */}
      <GitHubIssuesModal
        isOpen={isGitHubIssuesModalOpen}
        onClose={() => setIsGitHubIssuesModalOpen(false)}
        onCreateIssue={handleCreateFromGitHub}
      />
    </div>
  )
}

export default GitHubIssues
