import Header from "../components/Header"
import Footer from "../components/Footer"
import { motion } from "framer-motion"
import { Users, Shield, Zap, Settings } from "lucide-react"

const Teams = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
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

  return (
    <div className="flex flex-col items-center justify-center relative pt-30 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 min-h-screen">
      <Header />
      
      <motion.main 
        className="container mx-auto px-6 py-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.h1 
            variants={itemVariants}
            className="text-6xl font-bold text-gray-900 dark:text-white  mb-6"
            style={{ fontWeight: 900 }}
          >
            Teams
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto "
            style={{ fontWeight: 800 }}
          >
            Collaborate seamlessly with your development team using our powerful tools
          </motion.p>
        </div>

        {/* Team Features */}
        <motion.section 
          variants={itemVariants}
          className="mb-20"
        >
          <h2 className="text-4xl text-gray-900 dark:text-white  text-center mb-16" style={{ fontWeight: 900 }}>
            Team Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Users />,
                title: "Team Management",
                description: "Organize your team members, assign roles, and manage permissions effortlessly."
              },
              {
                icon: <Shield />,
                title: "Access Control",
                description: "Granular permission system to control who can access what in your projects."
              },
              {
                icon: <Zap />,
                title: "Real-time Sync",
                description: "Instant synchronization of code changes and project updates across your team."
              },
              {
                icon: <Settings />,
                title: "Team Settings",
                description: "Customize team workflows, notifications, and collaboration preferences."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="glass-card p-8 rounded-2xl text-center"
                whileHover={{ y: -5 }}
              >
                <div className="w-[80px] h-[80px] bg-orange-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <div className="w-12 h-12 text-white flex items-center justify-center">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-600 dark:text-white mb-4 " style={{ fontWeight: 900 }}>
                  {feature.title}
                </h3>
                <p className="text-sm font-bold text-gray-600 dark:text-gray-300  leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Team Sizes */}
        <motion.section 
          variants={itemVariants}
          className="mb-20"
        >
          <h2 className="text-4xl text-gray-900 dark:text-white  text-center mb-16" style={{ fontWeight: 900 }}>
            Perfect for Any Team Size
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                size: "Small Teams",
                range: "2-10 Developers",
                description: "Perfect for startups and small development teams looking to streamline their workflow."
              },
              {
                size: "Medium Teams",
                range: "10-50 Developers",
                description: "Ideal for growing companies with multiple projects and development streams."
              },
              {
                size: "Enterprise",
                range: "50+ Developers",
                description: "Scalable solution for large organizations with complex project requirements."
              }
            ].map((team, index) => (
              <motion.div
                key={index}
                className="glass-card p-8 rounded-2xl text-center"
                whileHover={{ y: -5 }}
              >
                <div className="text-3xl font-bold text-orange-500 mb-4 "
                style={{
                  fontWeight: 900
                }}
                >
                  {team.size}
                </div>
                <div className="text-xl font-bold text-gray-600 dark:text-white mb-4 "
                style={{
                  fontWeight: 900
                }}
                >
                  {team.range}
                </div>
                <p className="text-sm font-bold text-gray-600 dark:text-gray-300  leading-relaxed">
                  {team.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          variants={itemVariants}
          className="text-center"
        >
          <h2 className="text-4xl text-gray-900 dark:text-white  mb-8" style={{ fontWeight: 900 }}>
            Start Collaborating Today
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto  mb-10" style={{ fontWeight: 800 }}>
            Invite your team members and start building amazing projects together
          </p>
          <motion.button 
            className="px-12 py-4 bg-orange-500 text-white rounded-full font-bold text-lg  hover:bg-orange-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Your Team
          </motion.button>
        </motion.section>
      </motion.main>
      
      <Footer />
    </div>
  )
}

export default Teams
