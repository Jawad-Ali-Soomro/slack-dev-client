import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { githubService } from '../services/githubService'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { 
  Plus, 
  Github, 
  GitPullRequest, 
  AlertCircle, 
  FolderOpen, 
  ExternalLink,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'

const GitHubDashboard = () => {
  const [stats, setStats] = useState(null)
  const [repositories, setRepositories] = useState([])
  const [recentPRs, setRecentPRs] = useState([])
  const [recentIssues, setRecentIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsResponse, reposResponse, prsResponse, issuesResponse] = await Promise.all([
        githubService.getStats(),
        githubService.getRepositories({ limit: 5 }),
        githubService.getPullRequests({ limit: 5 }),
        githubService.getIssues({ limit: 5 })
      ])

      setStats(statsResponse.stats)
      setRepositories(reposResponse.repositories || [])
      setRecentPRs(prsResponse.pullRequests || [])
      setRecentIssues(issuesResponse.issues || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'closed':
      case 'merged':
        return <XCircle className="h-4 w-4 text-gray-500" />
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
      case 'merged':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">GitHub Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your GitHub repositories, pull requests, and issues
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className={'dark:bg-[rgba(255,255,255,.1)]'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Repositories</p>
                <p className="text-2xl font-bold">{stats?.repositories || 0}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={'dark:bg-[rgba(255,255,255,.1)]'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pull Requests</p>
                <p className="text-2xl font-bold">{stats?.pullRequests?.total || 0}</p>
                <p className="text-xs text-gray-500">
                  {stats?.pullRequests?.open || 0} open, {stats?.pullRequests?.closed || 0} closed
                </p>
              </div>
              <GitPullRequest className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={'dark:bg-[rgba(255,255,255,.1)]'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Issues</p>
                <p className="text-2xl font-bold">{stats?.issues?.total || 0}</p>
                <p className="text-xs text-gray-500">
                  {stats?.issues?.open || 0} open, {stats?.issues?.resolved || 0} resolved
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        {/* <Card className={'dark:bg-[rgba(255,255,255,.1)]'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Activity</p>
                <p className="text-2xl font-bold">
                  {(stats?.pullRequests?.total || 0) + (stats?.issues?.total || 0)}
                </p>
                <p className="text-xs text-gray-500">Total items</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="cursor-pointer hover:shadow-lg dark:bg-[rgba(255,255,255,.1)] transition-shadow" onClick={() => navigate('/dashboard/github/repositories')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <FolderOpen className="h-12 w-12 text-blue-500" />
              <div>
                <h3 className="font-semibold text-lg">Repositories</h3>
                <p className="text-gray-600 dark:text-gray-400">Manage your GitHub repositories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg dark:bg-[rgba(255,255,255,.1)] transition-shadow" onClick={() => navigate('/dashboard/github/pull-requests')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <GitPullRequest className="h-12 w-12 text-green-500" />
              <div>
                <h3 className="font-semibold text-lg">Pull Requests</h3>
                <p className="text-gray-600 dark:text-gray-400">Track your PRs and progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg dark:bg-[rgba(255,255,255,.1)] transition-shadow" onClick={() => navigate('/dashboard/github/issues')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-12 w-12 text-orange-500" />
              <div>
                <h3 className="font-semibold text-lg">Issues</h3>
                <p className="text-gray-600 dark:text-gray-400">Track bugs and feature requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Pull Requests */}
        <Card className={'dark:bg-[rgba(255,255,255,.1)]'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitPullRequest className="h-5 w-5" />
              Recent Pull Requests
            </CardTitle>
            <CardDescription>
              Your latest pull request activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentPRs.length === 0 ? (
              <div className="text-center py-8">
                <GitPullRequest className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">No pull requests yet</p>
                <Button 
                  className="mt-4" 
                  onClick={() => navigate('/dashboard/github/pull-requests')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pull Request
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPRs.map((pr) => (
                  <div key={pr._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(pr.status)}
                        <h4 className="font-medium">{pr.title}</h4>
                        <Badge className={getStatusColor(pr.status)}>
                          {pr.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {pr.repository?.name} • {pr.priority} priority
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(pr.githubUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/dashboard/github/pull-requests')}
                >
                  View All Pull Requests
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Issues */}
        <Card className={'dark:bg-[rgba(255,255,255,.1)]'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Recent Issues
            </CardTitle>
            <CardDescription>
              Your latest issue activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentIssues.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">No issues yet</p>
                <Button 
                  className="mt-4" 
                  onClick={() => navigate('/dashboard/github/issues')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Issue
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentIssues.map((issue) => (
                  <div key={issue._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(issue.status)}
                        <h4 className="font-medium">{issue.title}</h4>
                        <Badge className={getStatusColor(issue.status)}>
                          {issue.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {issue.repository?.name} • {issue.type} • {issue.priority} priority
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(issue.githubUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/dashboard/github/issues')}
                >
                  View All Issues
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default GitHubDashboard