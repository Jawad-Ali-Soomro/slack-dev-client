import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { User, Settings, LogOut, BarChart3, Users, Folder, Bell } from "lucide-react"

const Dashboard = () => {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  const stats = [
    { label: "Projects", value: "12", icon: Folder, color: "text-blue-500" },
    { label: "Team Members", value: "8", icon: Users, color: "text-green-500" },
    { label: "Tasks Completed", value: "47", icon: BarChart3, color: "text-purple-500" },
    { label: "Notifications", value: "3", icon: Bell, color: "text-black dark:text-white" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-orb w-96 h-96 top-10 left-10 opacity-20"></div>
        <div className="floating-orb w-64 h-64 top-1/3 right-20 opacity-15" style={{animationDelay: '2s'}}></div>
        <div className="floating-orb w-80 h-80 bottom-20 left-1/4 opacity-20" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <motion.div
          className="flex justify-between items-center mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white" style={{ fontWeight: 900 }}>
              Welcome back, {user?.username || user?.name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2" style={{ fontWeight: 800 }}>
              Here's what's happening with your projects today.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center space-x-4">
            <button className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-bold dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid md:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-700"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2" style={{ fontWeight: 900 }}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-800 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="grid lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Recent Projects */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4" style={{ fontWeight: 900 }}>
              Recent Projects
            </h2>
            <div className="space-y-4">
              {[
                { name: "E-commerce Platform", status: "In Progress", progress: 75 },
                { name: "Mobile App UI", status: "Review", progress: 90 },
                { name: "Dashboard Analytics", status: "Planning", progress: 25 }
              ].map((project, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{project.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{project.status}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-black h-2 rounded-full transition-all duration-300 dark:bg-white" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{project.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            variants={itemVariants}
            className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4" style={{ fontWeight: 900 }}>
              Profile
            </h2>
            <div className="text-center">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-white">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontWeight: 900 }}>
                {user?.username || user?.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{user?.email}</p>
              <button className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-bold dark:bg-white dark:text-black dark:hover:bg-gray-200">
                Edit Profile
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard

