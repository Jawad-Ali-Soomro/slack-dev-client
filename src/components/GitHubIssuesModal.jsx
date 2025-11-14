import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { 
  XCircle, 
  Search, 
  Github, 
  ExternalLink, 
  AlertCircle,
  Calendar,
  Loader,
  Plus,
  Bug,
  Lightbulb,
  FileText,
  HelpCircle,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

const GitHubIssuesModal = ({ isOpen, onClose, onCreateIssue }) => {
  const [username, setUsername] = useState('')
  const [repoName, setRepoName] = useState('')
  const [userIssues, setUserIssues] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIssues, setSelectedIssues] = useState([])
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '',
    body: '',
    labels: [],
    assignees: []
  })
  const [labelInput, setLabelInput] = useState('')

  const fetchUserIssues = async () => {
    if (!username.trim() || !repoName.trim()) {
      toast.error('Please enter both GitHub username and repository name')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`https://api.github.com/repos/${username}/${repoName}/issues?state=all&per_page=100`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Repository not found')
        }
        throw new Error('Failed to fetch issues')
      }

      const issues = await response.json()
      setUserIssues(issues)
      toast.success(`Found ${issues.length} issues`)
    } catch (error) {
      console.error('Error fetching issues:', error)
      toast.error(error.message || 'Failed to fetch issues')
      setUserIssues([])
    } finally {
      setLoading(false)
    }
  }

  const createIssueToGitHub = async () => {
    if (!createForm.title.trim()) {
      toast.error('Please enter a title')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`https://api.github.com/repos/${username}/${repoName}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${localStorage.getItem('github_token') || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: createForm.title,
          body: createForm.body,
          labels: createForm.labels,
          assignees: createForm.assignees
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create issue on GitHub')
      }

      const newIssue = await response.json()
      toast.success('Issue created successfully on GitHub')
      
      // Add to local database
      const issueData = {
        title: newIssue.title,
        description: newIssue.body || '',
        githubUrl: newIssue.html_url,
        githubHash: newIssue.number.toString(),
        repository: '', // Will be set by backend
        labels: newIssue.labels?.map(label => label.name) || [],
        priority: 'medium',
        type: 'bug'
      }
      
      await onCreateIssue(issueData)
      setIsCreateMode(false)
      setCreateForm({ title: '', body: '', labels: [], assignees: [] })
    } catch (error) {
      console.error('Error creating issue:', error)
      toast.error(error.message || 'Failed to create issue')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSelected = async () => {
    if (selectedIssues.length === 0) {
      toast.error('Please select at least one issue')
      return
    }

    try {
      for (const issue of selectedIssues) {
        const issueData = {
          title: issue.title,
          description: issue.body || '',
          githubUrl: issue.html_url,
          githubHash: issue.number.toString(),
          repository: '' || null, // Will be set by backend
          labels: issue.labels?.map(label => label.name) || [],
          priority: 'medium',
          type: issue.labels?.some(label => label.name.toLowerCase().includes('bug')) ? 'bug' : 'feature'
        }
        
        await onCreateIssue(issueData)
      }
      
      toast.success(`Successfully imported ${selectedIssues.length} issue(s)`)
      setSelectedIssues([])
      onClose()
    } catch (error) {
      console.error('Error importing issues:', error)
      toast.error('Failed to import issues')
    }
  }

  const toggleIssueSelection = (issue) => {
    setSelectedIssues(prev => 
      prev.some(i => i.id === issue.id) 
        ? prev.filter(i => i.id !== issue.id)
        : [...prev, issue]
    )
  }

  const addLabel = () => {
    if (labelInput.trim() && !createForm.labels.includes(labelInput.trim())) {
      setCreateForm(prev => ({
        ...prev,
        labels: [...prev.labels, labelInput.trim()]
      }))
      setLabelInput('')
    }
  }

  const removeLabel = (labelToRemove) => {
    setCreateForm(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label !== labelToRemove)
    }))
  }

  const getIssueIcon = (labels) => {
    if (labels?.some(label => label.name.toLowerCase().includes('bug'))) {
      return <Bug className="h-4 w-4 icon text-red-500" />
    } else if (labels?.some(label => label.name.toLowerCase().includes('feature'))) {
      return <Lightbulb className="h-4 w-4 icon text-green-500" />
    } else if (labels?.some(label => label.name.toLowerCase().includes('enhancement'))) {
      return <Zap className="h-4 w-4 icon text-blue-500" />
    } else if (labels?.some(label => label.name.toLowerCase().includes('documentation'))) {
      return <FileText className="h-4 w-4 icon text-purple-500" />
    } else if (labels?.some(label => label.name.toLowerCase().includes('question'))) {
      return <HelpCircle className="h-4 w-4 icon text-yellow-500" />
    }
    return <AlertCircle className="h-4 w-4 icon text-gray-500" />
  }

  const getStatusColor = (state) => {
    switch (state) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
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

  const filteredIssues = userIssues.filter(issue =>
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (issue.body && issue.body.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-black rounded-[20px] border p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
    

        {/* Repository Input */}
        <div className="flex gap-4 mb-6 items-center">
          <div className="flex-1">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="GitHub username (e.g., octocat)"
            />
          </div>
          /
          <div className="flex-1">
            <Input
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="Repository name (e.g., Hello-World)"
            />
          </div>
        </div>
          <Button onClick={fetchUserIssues} disabled={loading || !username.trim() || !repoName.trim()} className={'w-full'}>
            {loading ? 'Fetching...' : <><Search className="h-4 w-4 icon" /> Fetch Issues</>}
          </Button>

        {/* Mode Toggle */}
   

        {isCreateMode ? (
          /* Create Issue Form */
          <div className="space-y-4">
            <div>
              <Input
                value={createForm.title}
                onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Issue title"
              />
            </div>
            <div>
              <Textarea
                value={createForm.body}
                onChange={(e) => setCreateForm(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Issue description"
                rows={4}
              />
            </div>
            <div>
              <div className="flex gap-2 mb-2">
                <Input
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  placeholder="Add a label"
                  onKeyPress={(e) => e.key === 'Enter' && addLabel()}
                />
                <Button type="button" onClick={addLabel}><Plus /></Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {createForm.labels.map((label, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeLabel(label)}>
                    {label} ×
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateMode(false)}>
                Cancel
              </Button>
              <Button onClick={createIssueToGitHub} disabled={loading || !createForm.title.trim()}>
                {loading ? 'Creating...' : <><Plus className="h-4 w-4 icon mr-2" /> Create Issue on GitHub</>}
              </Button>
            </div>
          </div>
        ) : (
          /* Import Issues */
          <>
            {/* Search and Actions */}
            {userIssues.length > 0 && (
              <div className="flex items-center justify-between mb-4 gap-4 mt-5">
                <div className="flex-1">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search issues..."
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={handleCreateSelected}
                    disabled={selectedIssues.length === 0}
                    className="bg-green-600 hover:bg-green-700 w-[200px]"
                  >
                    <Plus className="h-4 w-4 icon mr-2" />
                    Import Selected ({selectedIssues.length})
                  </Button>
                </div>
              </div>
            )}

            {/* Issues List */}
            <div className="flex-1 overflow-y-auto">
              {userIssues.length === 0 && !loading && (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg  mb-2">No issues found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter a GitHub username and repository to fetch issues
                  </p>
                </div>
              )}

              {filteredIssues.length === 0 && userIssues.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    No issues match your search
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {filteredIssues.map((issue) => {
                  const isSelected = selectedIssues.some(i => i.id === issue.id)
                  
                  return (
                    <Card 
                      key={issue.id} 
                      className={`cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => toggleIssueSelection(issue)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getIssueIcon(issue.labels)}
                              <h3 className=" text-gray-900 dark:text-white">
                                #{issue.number} {issue.title}
                              </h3>
                              <Badge className={getStatusColor(issue.state)}>
                                {issue.state}
                              </Badge>
                            </div>
                            
                            {issue.body && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                {issue.body}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 icon" />
                                {formatDate(issue.created_at)}
                              </div>
                              {issue.user && (
                                <div className="flex items-center gap-1">
                                  <img 
                                    src={issue.user.avatar_url} 
                                    alt={issue.user.login}
                                    className="w-4 h-4 icon rounded-full"
                                  />
                                  {issue.user.login}
                                </div>
                              )}
                            </div>

                            {issue.labels && issue.labels.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {issue.labels.slice(0, 5).map((label, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs" style={{ backgroundColor: `#${label.color}20`, color: `#${label.color}` }}>
                                    {label.name}
                                  </Badge>
                                ))}
                                {issue.labels.length > 5 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{issue.labels.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(issue.html_url, '_blank')
                              }}
                              className="w-8 h-8 p-0"
                            >
                              <ExternalLink className="h-4 w-4 icon" />
                            </Button>
                            <div className={`w-4 h-4 icon rounded  ${
                              isSelected 
                                ? 'bg-blue-500 border-blue-500' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {isSelected && (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default GitHubIssuesModal


