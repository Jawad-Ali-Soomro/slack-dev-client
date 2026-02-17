import Header from "../components/Header"
import Footer from "../components/Footer"
import { motion } from "framer-motion"
import { Code, Book, Users, Zap, ArrowRight } from "lucide-react"

const DevHub = () => {
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
            className="text-6xl  text-gray-900 dark:text-white  mb-6"
            style={{ fontWeight: 900 }}
          >
            Dev Hub
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto "
            style={{ fontWeight: 800 }}
          >
            Your central hub for development resources, tutorials, and community
          </motion.p>
        </div>

        {/* Hub Categories */}
        <motion.section 
          variants={itemVariants}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
        >
          {[
            {
              icon: <Code />,
              title: "Code Examples",
              description: "Browse through hundreds of code snippets and examples for various programming languages.",
              count: "500+"
            },
            {
              icon: <Book />,
              title: "Tutorials",
              description: "Step-by-step guides and tutorials to help you master new technologies and frameworks.",
              count: "200+"
            },
            {
              icon: <Users />,
              title: "Community",
              description: "Connect with other developers, ask questions, and share your knowledge with the community.",
              count: "50K+"
            },
            {
              icon: <Zap />,
              title: "Tools",
              description: "Discover and access powerful development tools to boost your productivity.",
              count: "100+"
            }
          ].map((category, index) => (
            <motion.div
              key={index}
              className="glass-card p-8 rounded-[10px] text-center"
              whileHover={{ y: -5 }}
            >
              <div className="w-[80px] h-[80px] bg-black rounded-[10px] flex items-center justify-center mb-6 mx-auto dark:bg-white">
                <div className="w-12 h-12 text-white flex items-center justify-center">
                  {category.icon}
                </div>
              </div>
              <div className="text-2xl  text-black mb-2 dark:text-white">
                {category.count}
              </div>
              <h3 className="text-xl  text-gray-600 dark:text-white mb-4 " style={{ fontWeight: 900 }}>
                {category.title}
              </h3>
              <p className="text-sm  text-gray-600 dark:text-gray-300  leading-relaxed">
                {category.description}
              </p>
            </motion.div>
          ))}
        </motion.section>

        {/* Featured Resources */}
        <motion.section 
          variants={itemVariants}
          className="mb-20"
        >
          <h2 className="text-4xl text-gray-900 dark:text-white  text-center mb-16" style={{ fontWeight: 900 }}>
            Featured Resources
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "React Best Practices",
                category: "Tutorial",
                description: "Learn the latest React patterns and best practices for building scalable applications.",
                readTime: "15 min read"
              },
              {
                title: "API Integration Guide",
                category: "Code Example",
                description: "Comprehensive guide on integrating third-party APIs with authentication and error handling.",
                readTime: "20 min read"
              },
              {
                title: "Deployment Automation",
                category: "Tool",
                description: "Automate your deployment process with our CI/CD pipeline templates and configurations.",
                readTime: "10 min setup"
              }
            ].map((resource, index) => (
              <motion.div
                key={index}
                className="glass-card p-8 rounded-[10px]"
                whileHover={{ y: -5 }}
              >
                <div className="text-sm  text-black  mb-2 dark:text-white">
                  {resource.category}
                </div>
                <h3 className="text-xl  text-gray-600 dark:text-white mb-4 " style={{ fontWeight: 900 }}>
                  {resource.title}
                </h3>
                <p className="text-sm  text-gray-600 dark:text-gray-300  leading-relaxed mb-4">
                  {resource.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs  text-gray-500 dark:text-gray-400 ">
                    {resource.readTime}
                  </span>
                  <button className="text-xs  text-white  w-[40px] h-10 bg-black rounded-[10px] flex items-center justify-center dark:bg-white dark:text-black">
                    <ArrowRight className="w-4 h-4 icon icon" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Community Stats */}
        <motion.section 
          variants={itemVariants}
          className="text-center mb-20"
        >
          <h2 className="text-4xl text-gray-900 dark:text-white  mb-16" style={{ fontWeight: 900 }}>
            Community Highlights
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: "50K+", label: "Active Developers" },
              { number: "10K+", label: "Code Snippets" },
              { number: "5K+", label: "Discussions" },
              { number: "1K+", label: "Contributors" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="glass-card p-8 rounded-[10px]"
                whileHover={{ y: -5 }}
              >
                <div className="text-4xl  text-black mb-2 dark:text-white">
                  {stat.number}
                </div>
                <div className="text-sm  text-gray-600 dark:text-gray-300 ">
                  {stat.label}
                </div>
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
            Join the Community
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto  mb-10" style={{ fontWeight: 800 }}>
            Start learning, sharing, and building with thousands of developers worldwide
          </p>
          <motion.button 
            className="px-12 py-4 bg-black text-white rounded-[10px]  text-lg  hover:bg-black transition-colors dark:bg-white dark:text-black dark:hover:bg-gray-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore Dev Hub
          </motion.button>
        </motion.section>
      </motion.main>
      
      <Footer />
    </div>
  )
}

export default DevHub
