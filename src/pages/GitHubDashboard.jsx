import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { githubService } from '../services/githubService'
import { Button } from '../components/ui/button'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter
} from 'recharts'
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
  XCircle,
  Search,
  Bell,
  Settings,
  User,
  Menu,
  RefreshCw,
  Eye,
  Filter,
  MoreHorizontal,
  Star,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  Code,
  GitBranch,
  Bug,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'

const GitHubDashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRepositories: 0,
    totalPullRequests: 0,
    totalIssues: 0,
    openPullRequests: 0,
    closedPullRequests: 0,
    openIssues: 0,
    resolvedIssues: 0
  })
  const [repositories, setRepositories] = useState([])
  const [recentPRs, setRecentPRs] = useState([])
  const [recentIssues, setRecentIssues] = useState([])

  console.log(recentIssues)

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      const [reposResponse, prsResponse, issuesResponse] = await Promise.all([
        githubService.getRepositories(),
        githubService.getPullRequests(),
        githubService.getIssues()
      ])

      const repositories = reposResponse.repositories || []
      const pullRequests = prsResponse.pullRequests || []
      const issues = issuesResponse.issues || []

      setRepositories(repositories)
      setRecentPRs(pullRequests.slice(0, 5))
      setRecentIssues(issues.slice(0, 5))

      setStats({
        totalRepositories: repositories.length,
        totalPullRequests: pullRequests.length,
        totalIssues: issues.length,
        openPullRequests: pullRequests.filter(pr => pr.status === 'open').length,
        closedPullRequests: pullRequests.filter(pr => pr.status === 'closed' || pr.status === 'merged').length,
        openIssues: issues.filter(issue => issue.status === 'open').length,
        resolvedIssues: issues.filter(issue => issue.status === 'resolved' || issue.status === 'closed').length
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Chart data based on real data
  const repositoryTypeData = [
    { name: 'Public', value: repositories.filter(repo => !repo.isPrivate).length, color: '#3B82F6' },
    { name: 'Private', value: repositories.filter(repo => repo.isPrivate).length, color: '#F59E0B' },
    ]

  const priorityData = [
    { name: 'Critical', value: recentIssues.filter(issue => issue.priority === 'critical').length, x: 5, y: 12, color: '#EF4444' },
    { name: 'High', value: recentIssues.filter(issue => issue.priority === 'high').length, x: 10, y: 8, color: '#F59E0B' },
    { name: 'Medium', value: recentIssues.filter(issue => issue.priority === 'medium').length, x: 15, y: 5, color: '#3B82F6' },
    { name: 'Low', value: recentIssues.filter(issue => issue.priority === 'low').length, x: 20, y: 3, color: '#10B981' }
  ]

 

  const activityData = [
    { name: 'Total Pulls', value: stats.openPullRequests, color: '#3B82F6' },
    { name: 'Total Issues', value: stats.openIssues, color: '#F59E0B' },
    { name: 'Total Activity', value: stats.totalPullRequests + stats.totalIssues, color: '#8B5CF6' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-white">Loading GitHub dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="">
      {/* Top Navigation Bar */}
   

      <div className='mt-10'>
        {/* Header */}
   

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className=" rounded-none border bg-gray-50 dark:bg-[rgba(255,255,255,.1)] shadow-sm p-6 dark:text-white"
          >
            <div className="text-center">
              <div className="bg-blue-500 text-white rounded-t-none py-2 px-4 -mx-6 -mt-6 mb-4">
                <span className="text-[12px] uppercase font-bold">Repositories</span>
              </div>
              <div className="text-6xl font-bold text-gray-900 dark:text-white mt-8">{stats.totalRepositories}</div>
               
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className=" rounded-none border bg-gray-50 dark:bg-[rgba(255,255,255,.1)] shadow-sm p-6 dark:text-white"
          >
            <div className="text-center">
              <div className="bg-green-500 text-white rounded-t-none py-2 px-4 -mx-6 -mt-6 mb-4">
                <span className="text-[12px] uppercase font-bold">Pull Requests</span>
              </div>

              <div className="text-6xl font-bold text-gray-900 dark:text-white mt-8">{stats.totalPullRequests}</div>
              
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className=" rounded-none border bg-gray-50 dark:bg-[rgba(255,255,255,.1)] shadow-sm p-6 dark:text-white"
          >
            <div className="text-center">
              <div className="bg-orange-500 text-white py-2 px-4 -mx-6 -mt-6 mb-4">
                <span className="text-[12px] uppercase font-bold">Issues</span>
              </div>

              <div className="text-6xl font-bold text-gray-900 dark:text-white mt-8">{stats.totalIssues}</div>
               
            </div>
          </motion.div>

   
        </div>

        {/* Data Distribution Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Repository Type Distribution */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className=" rounded-none border bg-gray-50 dark:bg-[rgba(255,255,255,.1)] shadow-sm p-6 dark:text-white"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Repository Type Distribution</h3>
            <div className="flex justify-between items-center mb-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-white">Public - {repositories.filter(repo => !repo.isPrivate).length}</div>
                <div className="text-sm text-gray-600 dark:text-white">Private - {repositories.filter(repo => repo.isPrivate).length}</div>
               </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-white">Total Repositories - {stats.totalRepositories}</div>
              </div>
            </div>
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={repositoryTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {repositoryTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip  contentStyle={{
                      border: "none",
                      borderRadius: "0px",
                      color: "white",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                      backdropFilter: "blur(10px)",
                    }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2">
              {repositoryTypeData.map((item, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-white">{item.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Priority Level Distribution */}
    

          {/* Programming Language Distribution */}
   

          {/* Activity Distribution */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className=" rounded-none border bg-gray-50 dark:bg-[rgba(255,255,255,.1)] shadow-sm p-6 dark:text-white"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Distribution</h3>
            <div className="flex justify-between items-center mb-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-white">Total Pulls - {stats.openPullRequests}</div>
                <div className="text-sm text-gray-600 dark:text-white">Total Issues - {stats.openIssues}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-white">Total Activity - {stats.totalPullRequests + stats.totalIssues}</div>
              </div>
            </div>
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      border: "none",
                      borderRadius: "0px",
                      color: "white",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2">
              {activityData.map((item, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-white">{item.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        {/* <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => navigate('/dashboard/github/repositories')}
              className="flex items-center justify-center space-x-2 p-4 bg-gray-100 text-black hover:bg-gray-100 h-auto"
            >
              <FolderOpen className="w-5 h-5" />
              <span>Manage Repositories</span>
            </Button>
            <Button 
              onClick={() => navigate('/dashboard/github/pull-requests')}
              className="flex items-center justify-center space-x-2 p-4 bg-gray-100 text-black hover:bg-gray-100 h-auto"
            >
              <GitPullRequest className="w-5 h-5" />
              <span>Track Pull Requests</span>
            </Button>
            <Button 
              onClick={() => navigate('/dashboard/github/issues')}
              className="flex items-center justify-center space-x-2 p-4 bg-gray-100 text-black hover:bg-gray-100 h-auto"
            >
              <AlertCircle className="w-5 h-5" />
              <span>Manage Issues</span>
            </Button>
          </div>
        </motion.div> */}
      </div>
    </div>
  )
}

export default GitHubDashboard
