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
    <div className="flex flex-col items-center justify-center pt-50 relative overflow-hidden bg-gray-50 dark:bg-black min-h-screen">
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
            Know Us!
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-xl  max-w-3xl mx-auto "
            // style={{ fontWeight: 800 }}
          >
            Yes we are passionate developers building tools for the developer community!
          </motion.p>
          
          {/* Team Hero Image */}
          <motion.div 
            variants={itemVariants}
            className="mt-12 relative"
          >
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1800&h=900&fit=crop" 
              alt="Our team working together"
              className="rounded-[10px] shadow-lg mx-auto max-w-4xl w-full h-64 object-cover"
            />
          </motion.div>
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
              className="text-center glass-card p-8 rounded-[10px]"
              whileHover={{ y: -5 }}
            >
              <div className="text-4xl  text-black mb-2 dark:text-white"
                style={{
                  fontWeight: 900
                }}>
                {stat.number}
              </div>
              <div className="text-gray-600 dark:text-gray-300  text-[15px] "   style={{
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
          <p className="text-lg max-w-4xl mx-auto  leading-relaxed" >
            To empower developers worldwide with cutting-edge tools and platforms that streamline 
            the development process, enhance collaboration, and accelerate innovation in the tech industry.
          </p>
        </motion.section>

        {/* Values Section */}
        <motion.section variants={itemVariants}>
          {/* <h2 className="text-4xl text-gray-900 dark:text-white  text-center mb-16" style={{ fontWeight: 900 }}>
            Our Values
          </h2> */}
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: <Users />,
                title: "Community First",
                description: "We prioritize our developer community and build features based on real feedback.",
                image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1800&h=900&fit=crop"
              },
              {
                icon: <Target />,
                title: "Innovation Driven",
                description: "We constantly push the boundaries of what's possible in developer tools.",
                image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1800&h=900&fit=crop"
              },
              {
                icon: <Award />,
                title: "Quality Focused",
                description: "We maintain the highest standards in code quality, security, and performance.",
                image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1800&h=900&fit=crop"
              },
              {
                icon: <Globe />,
                title: "Globally Accessible",
                description: "We ensure our platform is accessible to developers worldwide, regardless of location.",
                image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1800&h=900&fit=crop"
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                className="glass-card p-8 rounded-[10px] overflow-hidden"
                whileHover={{ y: -5 }}
              >
                <div className="w-full h-48 mb-6 rounded-[10px] overflow-hidden">
                  <img 
                    src={value.image} 
                    alt={value.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="w-[80px] h-[80px] bg-black rounded-[10px] flex items-center justify-center mb-6 dark:bg-white">
                  <div className="w-12 h-12 text-white dark:text-black flex items-center justify-center">
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-xl  dark:text-white mb-4 " >
                  {value.title}
                </h3>
                <p className="text-[15px]   leading-relaxed">
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
