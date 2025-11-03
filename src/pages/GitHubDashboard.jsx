import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import HorizontalLoader from '../components/HorizontalLoader'
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
import StatsCard from '../components/StatsCard'

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
      <HorizontalLoader 
        message="Loading GitHub dashboard..."
        subMessage="Fetching your GitHub data"
        progress={95}
        className="min-h-screen"
      />
    )
  }

  return (
    <div className="min-h-screen ambient-light">
      <div className="mt-10 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Modern GitHub Header */}
          <div className="mb-16">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
              <div className="flex-1">
             
                
              
              </div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center space-x-3"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={loadDashboardData}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                >
                  <RefreshCw className="w-4 h-4 icon" />
                  <span>Refresh Data</span>
                </motion.button>
                
              
              </motion.div>
            </div>

            
          </div>

          {/* Enhanced Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
           <StatsCard 
            title="Repositories"
            value={stats.totalRepositories}
            color="blue"
              icon={FolderOpen}
              subtitle="Total repositories"
              delay={0.1}
           />
         <StatsCard
          title="Pull Requests"
          value={stats.totalPullRequests}
          color="green"
              icon={GitPullRequest}
              subtitle="Active pull requests"
              delay={0.2}
         />
         <StatsCard
          title="Issues"
          value={stats.totalIssues}
          color="orange"
              icon={AlertCircle}
              subtitle="Open issues"
              delay={0.3}
            />
          </div>

          {/* GitHub Analytics Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            {/* Chart Header */}
         

        {/* Data Distribution Sections */}
            <div className="mt-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Repository Type Distribution */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className=" rounded-[30px] p-6 border"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-300 rounded-[30px]">
                        <FolderOpen className="w-5 h-5 icon text-white dark:text-gray-800" />
                      </div>
                      <div>
                        <h3 className="text-lg  text-gray-900 dark:text-white">
                          Repository Types
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Public vs Private distribution
                        </p>
                      </div>
               </div>
              <div className="text-right">
                      <div className="text-xl  text-gray-900 dark:text-white">
                        {stats.totalRepositories}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Total Repositories
                      </div>
              </div>
            </div>
                  
                  <div className="h-48 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={repositoryTypeData}
                    cx="50%"
                    cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={8}
                    dataKey="value"
                  >
                    {repositoryTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                        <Tooltip contentStyle={{
                      border: "none",
                          borderRadius: "15px",
                      color: "white",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                      backdropFilter: "blur(10px)",
                    }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
                  
                  <div className="grid grid-cols-1 gap-3">
              {repositoryTypeData.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.1 + index * 0.1 }}
                        className="flex items-center p-3 bg-gray-100 dark:bg-[rgba(255,255,255,.1)] rounded-[30px]"
                      >
                        <div
                          className="w-4 h-4 icon rounded-[30px] mr-3 shadow-sm"
                    style={{ backgroundColor: item.color }}
                  ></div>
                        <div>
                          <div className="text-sm  text-gray-900 dark:text-white">
                            {item.value}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {item.name}
                          </div>
                </div>
                      </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Activity Distribution */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="border backdrop-blur-sm rounded-[30px] p-6 "
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-300 rounded-[30px]">
                        <TrendingUp className="w-5 h-5 icon text-white dark:text-gray-800" />
                      </div>
                      <div>
                        <h3 className="text-lg  text-gray-900 dark:text-white">
                          Activity Overview
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Pull requests and issues distribution
                        </p>
                      </div>
              </div>
              <div className="text-right">
                      <div className="text-xl  text-gray-900 dark:text-white">
                        {stats.totalPullRequests + stats.totalIssues}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Total Activity
                      </div>
              </div>
            </div>
                  
                  <div className="h-48 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityData}
                    cx="50%"
                    cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={8}
                    dataKey="value"
                  >
                    {activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      border: "none",
                            borderRadius: "15px",
                      color: "white",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
                  
                  <div className="grid grid-cols-2 gap-3">
              {activityData.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.3 + index * 0.1 }}
                        className={`flex items-center p-3 bg-gray-100 dark:bg-[rgba(255,255,255,.1)] rounded-[30px] ${item.name === "Total Activity" ? "col-span-2" : ""}`}
                      >
                        <div
                          className="w-4 h-4 icon rounded-[30px] mr-3 shadow-sm"
                    style={{ backgroundColor: item.color }}
                  ></div>
                        <div>
                          <div className="text-sm  text-gray-900 dark:text-white">
                            {item.value}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {item.name}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

       

          {/* Enhanced Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7 }}
            className="mt-10 pb-20"
          >
            {/* Quick Actions Header */}

            {/* Action Buttons */}
            <div className="mt-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard/github/repositories')}
                  className="flex items-center justify-start space-x-3 p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 rounded-[30px] border border-blue-200/50 dark:border-blue-800/50 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <FolderOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg  text-gray-900 dark:text-white">
                      Manage Repositories
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      View and organize your repos
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard/github/pull-requests')}
                  className="flex items-center justify-start space-x-3 p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/30 dark:hover:to-green-800/30 rounded-[30px] border border-green-200/50 dark:border-green-800/50 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <div className="p-3 bg-green-500 rounded-xl">
                    <GitPullRequest className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg  text-gray-900 dark:text-white">
                      Track Pull Requests
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Monitor PR status and reviews
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard/github/issues')}
                  className="flex items-center justify-start space-x-3 p-6 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/30 dark:hover:to-orange-800/30 rounded-[30px] border border-orange-200/50 dark:border-orange-800/50 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <div className="p-3 bg-orange-500 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg  text-gray-900 dark:text-white">
                      Manage Issues
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Track and resolve issues
                    </div>
                  </div>
                </motion.button>
              </div>
          </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default GitHubDashboard
