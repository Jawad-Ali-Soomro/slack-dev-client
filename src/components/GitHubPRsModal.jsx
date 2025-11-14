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
  GitPullRequest,
  Calendar,
  Loader,
  Plus,
  CheckCircle,
  XCircle as XCircleIcon,
  Clock,
  GitMerge
} from 'lucide-react'
import { toast } from 'sonner'

const GitHubPRsModal = ({ isOpen, onClose, onCreatePR }) => {
  const [username, setUsername] = useState('')
  const [repoName, setRepoName] = useState('')
  const [userPRs, setUserPRs] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPRs, setSelectedPRs] = useState([])
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '',
    body: '',
    head: '',
    base: 'main',
    labels: [],
    assignees: []
  })
  const [labelInput, setLabelInput] = useState('')

  const fetchUserPRs = async () => {
    if (!username.trim() || !repoName.trim()) {
      toast.error('Please enter both GitHub username and repository name')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`https://api.github.com/repos/${username}/${repoName}/pulls?state=all&per_page=100`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Repository not found')
        }
        throw new Error('Failed to fetch pull requests')
      }

      const prs = await response.json()
      setUserPRs(prs)
      toast.success(`Found ${prs.length} pull requests`)
    } catch (error) {
      console.error('Error fetching PRs:', error)
      toast.error(error.message || 'Failed to fetch pull requests')
      setUserPRs([])
    } finally {
      setLoading(false)
    }
  }

  const createPRToGitHub = async () => {
    if (!createForm.title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (!createForm.head.trim()) {
      toast.error('Please enter a head branch')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`https://api.github.com/repos/${username}/${repoName}/pulls`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${localStorage.getItem('github_token') || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: createForm.title,
          body: createForm.body,
          head: createForm.head,
          base: createForm.base,
          labels: createForm.labels,
          assignees: createForm.assignees
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create pull request on GitHub')
      }

      const newPR = await response.json()
      toast.success('Pull request created successfully on GitHub')
      
      // Add to local database
      const prData = {
        title: newPR.title,
        description: newPR.body || '',
        githubUrl: newPR.html_url,
        githubHash: newPR.number.toString(),
        repository: '', // Will be set by backend
        labels: newPR.labels?.map(label => label.name) || [],
        priority: 'medium'
      }
      
      await onCreatePR(prData)
      setIsCreateMode(false)
      setCreateForm({ title: '', body: '', head: '', base: 'main', labels: [], assignees: [] })
    } catch (error) {
      console.error('Error creating PR:', error)
      toast.error(error.message || 'Failed to create pull request')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSelected = async () => {
    if (selectedPRs.length === 0) {
      toast.error('Please select at least one pull request')
      return
    }

    try {
      for (const pr of selectedPRs) {
        const prData = {
          title: pr.title,
          description: pr.body || '',
          githubUrl: pr.html_url,
          githubHash: pr.number.toString(),
          repository: '' || null, // Will be set by backend
          labels: pr.labels?.map(label => label.name) || [],
          priority: 'medium'
        }
        
        await onCreatePR(prData)
      }
      
      toast.success(`Successfully imported ${selectedPRs.length} pull request(s)`)
      setSelectedPRs([])
      onClose()
    } catch (error) {
      console.error('Error importing PRs:', error)
      toast.error('Failed to import pull requests')
    }
  }

  const togglePRSelection = (pr) => {
    setSelectedPRs(prev => 
      prev.some(p => p.id === pr.id) 
        ? prev.filter(p => p.id !== pr.id)
        : [...prev, pr]
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

  const getStatusIcon = (state, merged) => {
    if (merged) {
      return <GitMerge className="h-4 w-4 icon text-purple-500" />
    }
    switch (state) {
      case 'open':
        return <CheckCircle className="h-4 w-4 icon text-green-500" />
      case 'closed':
        return <XCircleIcon className="h-4 w-4 icon text-red-500" />
      case 'draft':
        return <Clock className="h-4 w-4 icon text-yellow-500" />
      default:
        return <GitPullRequest className="h-4 w-4 icon text-gray-500" />
    }
  }

  const getStatusColor = (state, merged) => {
    if (merged) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    }
    switch (state) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'draft':
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

  const filteredPRs = userPRs.filter(pr =>
    pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pr.body && pr.body.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <Button onClick={fetchUserPRs} disabled={loading || !username.trim() || !repoName.trim()} className={'w-full'}>
            {loading ? 'Fetching...' : <><Search className="h-4 w-4 icon" /> Fetch PRs</>}
          </Button>

        {/* Mode Toggle */}
    

        {isCreateMode ? (
          /* Create PR Form */
          <div className="space-y-4">
            <div>
              <Input
                value={createForm.title}
                onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Pull request title"
              />
            </div>
            <div>
              <Textarea
                value={createForm.body}
                onChange={(e) => setCreateForm(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Pull request description"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  value={createForm.head}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, head: e.target.value }))}
                  placeholder="Head branch (feature branch)"
                />
              </div>
              <div>
                <Input
                  value={createForm.base}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, base: e.target.value }))}
                  placeholder="Base branch (usually main)"
                />
              </div>
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
              <Button onClick={createPRToGitHub} disabled={loading || !createForm.title.trim() || !createForm.head.trim()}>
                {loading ? 'Creating...' : <><Plus className="h-4 w-4 icon mr-2" /> Create PR on GitHub</>}
              </Button>
            </div>
          </div>
        ) : (
          /* Import PRs */
          <>
            {/* Search and Actions */}
            {userPRs.length > 0 && (
              <div className="flex items-center mt-5 justify-between mb-4 gap-4">
                <div className="flex-1">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search pull requests..."
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={handleCreateSelected}
                    disabled={selectedPRs.length === 0}
                    className="bg-green-600 hover:bg-green-700 w-[200px]"
                  >
                    <Plus className="h-4 w-4 icon mr-2" />
                    Import Selected ({selectedPRs.length})
                  </Button>
                </div>
              </div>
            )}

            {/* PRs List */}
            <div className="flex-1 overflow-y-auto">
              {userPRs.length === 0 && !loading && (
                <div className="text-center py-12">
                  <GitPullRequest className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg  mb-2">No pull requests found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter a GitHub username and repository to fetch pull requests
                  </p>
                </div>
              )}

              {filteredPRs.length === 0 && userPRs.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    No pull requests match your search
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {filteredPRs.map((pr) => {
                  const isSelected = selectedPRs.some(p => p.id === pr.id)
                  
                  return (
                    <Card 
                      key={pr.id} 
                      className={`cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => togglePRSelection(pr)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(pr.state, pr.merged)}
                              <h3 className=" text-gray-900 dark:text-white">
                                #{pr.number} {pr.title}
                              </h3>
                              <Badge className={getStatusColor(pr.state, pr.merged)}>
                                {pr.merged ? 'merged' : pr.state}
                              </Badge>
                            </div>
                            
                            {pr.body && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                {pr.body}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 icon" />
                                {formatDate(pr.created_at)}
                              </div>
                              {pr.user && (
                                <div className="flex items-center gap-1">
                                  <img 
                                    src={pr.user.avatar_url} 
                                    alt={pr.user.login}
                                    className="w-4 h-4 icon rounded-full"
                                  />
                                  {pr.user.login}
                                </div>
                              )}
                              <div className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {pr.head.ref} → {pr.base.ref}
                              </div>
                            </div>

                            {pr.labels && pr.labels.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {pr.labels.slice(0, 5).map((label, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs" style={{ backgroundColor: `#${label.color}20`, color: `#${label.color}` }}>
                                    {label.name}
                                  </Badge>
                                ))}
                                {pr.labels.length > 5 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{pr.labels.length - 5} more
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
                                window.open(pr.html_url, '_blank')
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

export default GitHubPRsModal
