import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { 
  XCircle, 
  Search, 
  Github, 
  ExternalLink, 
  Star, 
  GitFork, 
  Eye,
  Calendar,
  Code,
  Lock,
  Globe,
  Loader,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'

const GitHubUserReposModal = ({ isOpen, onClose, onCreateRepository, existingRepositories = [] }) => {
  const [username, setUsername] = useState('')
  const [userRepos, setUserRepos] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRepos, setSelectedRepos] = useState([])

  // Check if repository already exists in database
  const isRepoExists = (repoName) => {
    return existingRepositories.some(existingRepo => 
      existingRepo.name.toLowerCase() === repoName.toLowerCase()
    )
  }

  const fetchUserRepos = async () => {
    if (!username.trim()) {
      toast.error('Please enter a GitHub username')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found')
        }
        throw new Error('Failed to fetch repositories')
      }

      const repos = await response.json()
      setUserRepos(repos)
      
      const existingCount = repos.filter(repo => isRepoExists(repo.name)).length
      const availableCount = repos.length - existingCount
      
      if (existingCount > 0) {
        toast.success(`Found ${repos.length} repositories (${availableCount} available, ${existingCount} already exist)`)
      } else {
        toast.success(`Found ${repos.length} repositories`)
      }
    } catch (error) {
      console.error('Error fetching user repos:', error)
      toast.error(error.message || 'Failed to fetch repositories')
      setUserRepos([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSelected = async () => {
    if (selectedRepos.length === 0) {
      toast.error('Please select at least one repository')
      return
    }

    try {
      for (const repo of selectedRepos) {
        const repoData = {
          name: repo.name,
          description: repo.description || '',
          githubUrl: repo.html_url,
          language: repo.language || '',
          isPrivate: repo.private,
          tags: repo.topics || [],
          contributors: []
        }
        
        await onCreateRepository(repoData)
      }
      
      toast.success(`Successfully created ${selectedRepos.length} repository(ies)`)
      setSelectedRepos([])
      onClose()
    } catch (error) {
      console.error('Error creating repositories:', error)
      toast.error('Failed to create repositories')
    }
  }

  const toggleRepoSelection = (repo) => {
    setSelectedRepos(prev => 
      prev.some(r => r.id === repo.id) 
        ? prev.filter(r => r.id !== repo.id)
        : [...prev, repo]
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredRepos = userRepos.filter(repo =>
    (repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    !isRepoExists(repo.name)
  )

  const existingRepos = userRepos.filter(repo => isRepoExists(repo.name))

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
      

        {/* Username Input */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GitHub username (e.g., octocat)"
              onKeyPress={(e) => e.key === 'Enter' && fetchUserRepos()}
            />
          </div>
          <Button onClick={fetchUserRepos} disabled={loading || !username.trim()} className={'w-[200px]'}>
            {loading ? <Loader className="h-4 w-4 icon animate-spin" /> : <Search className="h-4 w-4 icon" />}
            {loading ? 'Fetching...' : 'Fetch Repos'}
          </Button>
        </div>

        {/* Search and Actions */}
        {userRepos.length > 0 && (
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex-1">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search repositories..."
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 icon" />
            </div>
            <div className="flex items-center gap-4">
              
              <Button 
                onClick={handleCreateSelected}
                disabled={selectedRepos.length === 0}
                className="bg-green-600 hover:bg-green-700 w-[200px]"
              >
                <Plus className="h-4 w-4 icon mr-2" />
                Create Selected ({selectedRepos.length})
              </Button>
            </div>
          </div>
        )}

            {/* Existing Repositories Section */}
            {/* {existingRepos.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                  Already in your database ({existingRepos.length})
                </h4>
                <div className="space-y-2">
                  {existingRepos.slice(0, 3).map((repo) => (
                    <div key={repo.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-[10px]">
                      <Github className="h-4 w-4 icon text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{repo.name}</span>
                      <Badge variant="secondary" className="text-xs">Already exists</Badge>
                    </div>
                  ))}
                  {existingRepos.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{existingRepos.length - 3} more repositories already exist
                    </div>
                  )}
                </div>
              </div>
            )} */}

            {/* Repositories List */}
            <div className="flex-1 overflow-y-auto">
              {userRepos.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Github className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg  mb-2">No repositories found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter a GitHub username to fetch their public repositories
                  </p>
                </div>
              )}

              {filteredRepos.length === 0 && userRepos.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    {existingRepos.length > 0 
                      ? 'All repositories already exist in your database' 
                      : 'No repositories match your search'
                    }
                  </p>
                </div>
              )}

          <div className="space-y-3">
            {filteredRepos.map((repo) => {
              const isSelected = selectedRepos.some(r => r.id === repo.id)
              
              return (
                <Card 
                  key={repo.id} 
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => toggleRepoSelection(repo)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className=" text-gray-900 dark:text-white">
                            {repo.name}
                          </h3>
                          {repo.private ? (
                            <Lock className="h-4 w-4 icon text-gray-500" />
                          ) : (
                            <Globe className="h-4 w-4 icon text-gray-500" />
                          )}
                        </div>
                        
                        {repo.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {repo.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {repo.language && (
                            <div className="flex items-center gap-1">
                              <Code className="h-4 w-4 icon" />
                              {repo.language}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 icon" />
                            {repo.stargazers_count}
                          </div>
                          <div className="flex items-center gap-1">
                            <GitFork className="h-4 w-4 icon" />
                            {repo.forks_count}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4 icon" />
                            {repo.watchers_count}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 icon" />
                            {formatDate(repo.updated_at)}
                          </div>
                        </div>

                        {repo.topics && repo.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {repo.topics.slice(0, 5).map((topic, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                            {repo.topics.length > 5 && (
                              <Badge variant="secondary" className="text-xs">
                                +{repo.topics.length - 5} more
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
                            window.open(repo.html_url, '_blank')
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
      </motion.div>
    </div>
  )
}

export default GitHubUserReposModal
