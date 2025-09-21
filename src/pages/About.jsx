import Header from "../components/Header"
import Footer from "../components/Footer"
import { motion } from "framer-motion"
import { Users, Target, Award, Globe } from "lucide-react"

const About = () => {
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
    <div className="flex flex-col items-center justify-center pt-50 relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 min-h-screen">
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
            About Us
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto "
            style={{ fontWeight: 800 }}
          >
            We are passionate developers Building Tools for the developer community!
          </motion.p>
        </div>

        {/* Stats Section */}
        <motion.section 
          variants={itemVariants}
          className="grid md:grid-cols-4 gap-8 mb-20"
        >
          {[
            { number: "2025", label: "Founded Incredibly" },
            { number: "50K+", label: "Developers Wordwide" },
            { number: "100+", label: "Countries Included" },
            { number: "99.9%", label: "Uptime Guaranteed" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center glass-card p-8 rounded-2xl"
              whileHover={{ y: -5 }}
            >
              <div className="text-4xl font-bold text-orange-500 mb-2 "
                style={{
                  fontWeight: 900
                }}>
                {stat.number}
              </div>
              <div className="text-gray-600 dark:text-gray-300 font-bold text-[15px] "   style={{
            fontWeight: 800
          }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* Mission Section */}
        <motion.section 
          variants={itemVariants}
          className="text-center mb-20"
        >
          <h2 className="text-4xl text-gray-900 dark:text-white  mb-8" style={{ fontWeight: 900 }}>
            Our Mission
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto  leading-relaxed" style={{ fontWeight: 800 }}>
            To empower developers worldwide with cutting-edge tools and platforms that streamline 
            the development process, enhance collaboration, and accelerate innovation in the tech industry.
          </p>
        </motion.section>

        {/* Values Section */}
        <motion.section variants={itemVariants}>
          <h2 className="text-4xl text-gray-900 dark:text-white  text-center mb-16" style={{ fontWeight: 900 }}>
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: <Users />,
                title: "Community First",
                description: "We prioritize our developer community and build features based on real feedback."
              },
              {
                icon: <Target />,
                title: "Innovation Driven",
                description: "We constantly push the boundaries of what's possible in developer tools."
              },
              {
                icon: <Award />,
                title: "Quality Focused",
                description: "We maintain the highest standards in code quality, security, and performance."
              },
              {
                icon: <Globe />,
                title: "Globally Accessible",
                description: "We ensure our platform is accessible to developers worldwide, regardless of location."
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                className="glass-card p-8 rounded-2xl"
                whileHover={{ y: -5 }}
              >
                <div className="w-[80px] h-[80px] bg-orange-500 rounded-full flex items-center justify-center mb-6">
                  <div className="w-12 h-12 text-white flex items-center justify-center">
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold dark:text-white mb-4 " style={{ fontWeight: 900 }}>
                  {value.title}
                </h3>
                <p className="text-[15px] font-bold text-gray-600 dark:text-gray-300  leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </motion.main>
      
      <Footer />
    </div>
  )
}

export default About
