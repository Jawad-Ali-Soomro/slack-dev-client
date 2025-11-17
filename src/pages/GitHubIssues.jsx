import React, { useState, useEffect } from 'react'
import HorizontalLoader from '../components/HorizontalLoader'
import { githubService } from '../services/githubService'
import { useNavigate } from 'react-router-dom'
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
  Github,
  Info
} from 'lucide-react'
import { toast } from 'sonner'
import GitHubIssuesModal from '../components/GitHubIssuesModal'
import { getAvatarProps } from '../utils/avatarUtils'
import UserDetailsModal from '../components/UserDetailsModal'

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
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
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

  const tableHeadClass = 'sticky top-0 truncate z-30 bg-white px-6 py-4 text-left text-xs uppercase tracking-wider font-semibold text-gray-900 shadow-sm'

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchData()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, statusFilter, repositoryFilter, priorityFilter, typeFilter])

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

  const handleUserAvatarClick = (userId) => {
    if (userId) {
      setSelectedUserId(userId)
      setShowUserDetails(true)
    }
  }

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
        return <CheckCircle className="h-4 w-4 icon text-green-500" />
      case 'closed':
        return <XCircle className="h-4 w-4 icon text-red-500" />
      case 'in-progress':
        return <Clock className="h-4 w-4 icon text-yellow-500" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4 icon text-blue-500" />
      default:
        return <Clock className="h-4 w-4 icon text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-500 text-white dark:bg-green-900 dark:text-green-200'
      case 'closed':
        return 'bg-red-500 text-white dark:bg-red-900 dark:text-red-200'
      case 'in-progress':
        return 'bg-yellow-500 text-white dark:bg-yellow-900 dark:text-yellow-200'
      case 'resolved':
        return 'bg-blue-500 text-white dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-gray-500 text-white dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500 text-white dark:bg-red-900 dark:text-red-200'
      case 'high':
        return 'bg-orange-500 text-white dark:bg-orange-900 dark:text-orange-200'
      case 'medium':
        return 'bg-blue-500 text-white dark:bg-blue-900 dark:text-blue-200'
      case 'low':
        return 'bg-gray-500 text-white dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bug':
        return <Bug className="h-4 w-4 icon text-red-500" />
      case 'feature':
        return <Lightbulb className="h-4 w-4 icon text-green-500" />
      case 'enhancement':
        return <Zap className="h-4 w-4 icon text-blue-500" />
      case 'documentation':
        return <FileText className="h-4 w-4 icon text-purple-500" />
      case 'question':
        return <HelpCircle className="h-4 w-4 icon text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 icon text-gray-500" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'bug':
          return 'bg-red-500 text-white dark:bg-red-900 dark:text-red-200'
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
    <div className='ambient-light pt-10'>
      <div className="mb-6">
      <div className="flex py-6 gap-3 items-center fixed z-10 -top-3 z-10">
        <div className="flex p-2 border-2 items-center gap-2 pr-10 rounded-[50px]">
        <div className="flex p-3 bg-white dark:bg-gray-800 rounded-full">
                  <Info  size={15} />
                  </div>
                  <h1 className="text-2xl font-bold">Your Issues</h1>
                </div>
                </div>
        <div className="flex items-center justify-between mb-4">
          <div>
          <div className="flex gap-4">
          <div className="relative flex-1 max-w-[600px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 icon" />
            <Input
              placeholder="Search issues..."
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
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="open">Open</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="closed">Closed</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="in-progress">In Progress</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={repositoryFilter} onValueChange={setRepositoryFilter}>
            <SelectTrigger className="w-48 px-5 cursor-pointer bg-white dark:bg-[#111827] text-black dark:text-white">
              <SelectValue placeholder="Filter by repository" />
            </SelectTrigger>
            <SelectContent className={'max-h-[400px]'}>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="all">All Repositories</SelectItem>
              {repositories.map((repo) => (
                <SelectItem className={'px-5 h-10 cursor-pointer'} key={repo._id} value={repo._id}>
                  {repo.owner?.username || 'Unknown'}/{repo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-48 px-5 cursor-pointer bg-white dark:bg-[#111827] text-black dark:text-white">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="all">All Priority</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="critical">Critical</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="high">High</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="medium">Medium</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="low">Low</SelectItem>
            </SelectContent>
          </Select>
       
        </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setIsCreateDialogOpen(true)} className={'w-[200px] font-bold'}>
              {/* <Plus className="h-4 w-4 icon mr-2" /> */}
              New Issue
            </Button>
            <Button 
              onClick={() => setIsGitHubIssuesModalOpen(true)} 
              variant="outline"
              className={'w-[200px] font-bold '}
            >
              <Info className="h-4 w-4 icon mr-2" />
              Import from github
            </Button>
          </div>
        </div>

        {/* Custom Create Modal */}
        {isCreateDialogOpen && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsCreateDialogOpen(false)}>
            <div className="bg-white dark:bg-[#111827] rounded-[20px] border p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
             
              <div className="space-y-4">
                <div>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Issue title"
                    className={getInputClasses('default', 'md', 'bg-white dark:bg-transparent text-black dark:text-white' )}
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
                      className={getInputClasses('default', 'md', 'bg-white dark:bg-transparent text-black dark:text-white' )}
                    />
                  </div>
                  <div>
                    <Input
                      id="githubHash"
                      value={formData.githubHash}
                      onChange={(e) => setFormData(prev => ({ ...prev, githubHash: e.target.value }))}
                      placeholder="123"
                      className={getInputClasses('default', 'md', 'bg-white dark:bg-transparent text-black dark:text-white' )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Select value={formData.repository} onValueChange={(value) => setFormData(prev => ({ ...prev, repository: value }))}>
                      <SelectTrigger className={getInputClasses('default', 'md', 'bg-white dark:bg-transparent text-black dark:text-white' )}>
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
                      <SelectTrigger className={getInputClasses('default', 'md', 'bg-white dark:bg-transparent text-black dark:text-white' )}>
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
                      <SelectTrigger className={getInputClasses('default', 'md', 'bg-white dark:bg-transparent text-black dark:text-white' )}>
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
                      className={getInputClasses('default', 'md', 'bg-white dark:bg-transparent text-black dark:text-white' )}
                    />
                  </div>
                  <div>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className={getInputClasses('default', 'md', 'bg-white dark:bg-transparent text-black dark:text-white' )}
                    />
                  </div>
                </div>
                <div>
                  <Select 
                    value={formData.assignedTo} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}
                  >
                    <SelectTrigger className={getInputClasses('default', 'md', 'bg-white dark:bg-transparent text-black dark:text-white' )}>
                      <SelectValue placeholder="Select assigned user" />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      <SelectItem value="none">No one assigned</SelectItem>
                      {friends.map((friend) => (
                        <SelectItem key={friend._id} value={friend._id}>
                          <div className="flex items-center gap-2">
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
                </div>
                <div>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={labelInput}
                      onChange={(e) => setLabelInput(e.target.value)}
                      placeholder="Add a label"
                      onKeyPress={(e) => e.key === 'Enter' && addLabel()}
                      className={getInputClasses('default', 'md', 'flex-1 bg-white dark:bg-transparent text-black dark:text-white' )}
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

      </div>

      {loading ? (
        <HorizontalLoader 
          message="Loading issues..."
          subMessage="Fetching your GitHub issues"
          progress={90}
          className="py-12"
        />
      ) : issues.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg  mb-2">No issues found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'You haven\'t logged any issues yet'}
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 icon mr-2" />
            Add Your First Issue
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-black rounded-[10px] shadow-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            <table className="w-full">
              <thead className="sticky top-0 z-20 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <tr>
                  <th className={tableHeadClass}>
                    Issue
                  </th>
                  <th className={tableHeadClass}>
                    Type
                  </th>
                  <th className={tableHeadClass}>
                    Status
                  </th>
                  <th className={tableHeadClass}>
                    Repository
                  </th>
                  <th className={tableHeadClass}>
                    Assigned To
                  </th>
                  <th className={tableHeadClass}>
                    Priority
                  </th>
                  <th className={tableHeadClass}>
                    Estimated Hours
                  </th>
                  <th className={tableHeadClass}>
                    Tags
                  </th>
                  <th className={`${tableHeadClass} text-right`}>
                    
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {issues.map((issue) => (
                  <tr key={issue._id} className="hover:bg-gray-50 dark:hover:bg-[#111827] dark:bg-[#111827] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                          <div className="text-sm font-semibold  truncate line-clamp-1 max-w-[300px]  text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            {getStatusIcon(issue.status)}
                            {issue.title}
                          </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(issue.type)}
                        <Badge className={getTypeColor(issue.type) + " px-3 py-2"}>
                          {issue.type}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(issue.status) + " px-3 py-2"}>
                        {issue.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate line-clamp-1">
                        {issue.repository?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {issue.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <img
                            {...getAvatarProps(issue.assignedTo?.avatar, issue.assignedTo?.username || 'User')}
                            alt={issue.assignedTo?.username || 'User'}
                            className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleUserAvatarClick(issue.assignedTo?._id || issue.assignedTo?.id)}
                            title={issue.assignedTo?.username ? `View ${issue.assignedTo.username}'s profile` : 'View profile'}
                          />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {issue.assignedTo?.username || 'Unassigned'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getPriorityColor(issue.priority) + " px-3 py-2"}>
                        {issue.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {issue.estimatedHours ? (
                        <span className="text-sm text-gray-900 dark:text-white">{issue.estimatedHours}h</span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {issue.labels && issue.labels.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {issue.labels.slice(0, 2).map((label, index) => (
                            <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                              {label}
                            </Badge>
                          ))}
                          {issue.labels.length > 2 && (
                            <Badge variant="outline" className="text-xs px-2 py-1">
                              +{issue.labels.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(issue.githubUrl, '_blank')}
                          className="hover:bg-blue-100 dark:hover:bg-blue-900/20"
                        >
                          <ExternalLink className="h-4 w-4 icon text-blue-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditIssue(issue)}
                          className="hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit className="h-4 w-4 icon" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteIssue(issue._id)}
                          className="hover:bg-red-100 dark:hover:bg-red-900/20"
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
          <div className="bg-white dark:bg-gray-800 rounded-[30px] border p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl ">Edit Issue</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Update issue information
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                <XCircle className="h-4 w-4 icon" />
              </Button>
            </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={getInputClasses('default', 'md')}
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
                  className={getInputClasses('default', 'md')}
                />
              </div>
              <div>
                <Label htmlFor="edit-githubHash">Issue Number/Hash</Label>
                <Input
                  id="edit-githubHash"
                  value={formData.githubHash}
                  onChange={(e) => setFormData(prev => ({ ...prev, githubHash: e.target.value }))}
                  className={getInputClasses('default', 'md')}
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
                  className={getInputClasses('default', 'md')}
                />
              </div>
              <div>
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className={getInputClasses('default', 'md')}
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
                  className={getInputClasses('default', 'md', 'flex-1')}
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

      {/* User Details Modal */}
      <UserDetailsModal
        userId={selectedUserId}
        isOpen={showUserDetails}
        onClose={() => {
          setShowUserDetails(false)
          setSelectedUserId(null)
        }}
      />
    </div>
  )
}

export default GitHubIssues
