import Header from "../components/Header"
import Footer from "../components/Footer"
import { motion } from "framer-motion"
import { Code, Database, GitBranch, Zap, Users, Shield, Rocket, Terminal, Settings, Cpu, RocketIcon, LayoutDashboard, Lock, Flashlight, Lightbulb, ToolCase, ArrowRight } from "lucide-react"

const Indexing = () => {
  const floatingIcons = [
    { Icon: Code, color: "text-blue-500", top: "15%", left: "10%", delay: 0 },
    { Icon: Database, color: "text-green-500", top: "25%", right: "15%", delay: 0.5 },
    { Icon: GitBranch, color: "text-purple-500", top: "60%", left: "8%", delay: 1 },
    { Icon: Zap, color: "text-yellow-500", top: "70%", right: "12%", delay: 1.5 },
    { Icon: Users, color: "text-pink-500", top: "40%", left: "5%", delay: 2 },
    { Icon: Shield, color: "text-red-500", top: "45%", right: "8%", delay: 2.5 },
    { Icon: Rocket, color: "text-indigo-500", top: "80%", left: "15%", delay: 3 },
    { Icon: Terminal, color: "text-cyan-500", top: "20%", right: "25%", delay: 3.5 },
    { Icon: Settings, color: "text-gray-500", top: "65%", right: "20%", delay: 4 },
    { Icon: Cpu, color: "text-black dark:text-white", top: "35%", left: "20%", delay: 4.5 }
  ]

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

  const floatingAnimation = {
    y: [-10, 10, -10],
    rotate: [-5, 5, -5],
    transition: {
      duration: 1,
      ease: "easeInOut"
    }
  }

  return (
    <div className="flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
        {/* Floating Background Orbs */}
        <div className="floating-orb w-96 h-96 top-10 left-10 opacity-30"></div>
        <div className="floating-orb w-64 h-64 top-1/3 right-20 opacity-20" style={{animationDelay: '2s'}}></div>
        <div className="floating-orb w-80 h-80 bottom-20 left-1/4 opacity-25" style={{animationDelay: '4s'}}></div>
        
        <Header />
        
        <motion.div 
          className="flex flex-col items-center justify-center text-center relative z-10 h-screen w-full"
          variants={containerVariants}
          initial="visible"
          animate="visible"
        >
          {/* Hero Background Image */}
        
{floatingIcons.map(({ Icon, color, top, left, right, delay }, index) => (
          <motion.div
            key={index}
            className={`absolute ${color} opacity-20 dark:opacity-20`}
            style={{ 
              top, 
              left, 
              right,
              zIndex: 1
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 0.5, 
              scale: 1,
              ...floatingAnimation
            }}
            transition={{ 
              delay: delay * 0.5,
              duration: 0.8
            }}
          >
            <Icon size={48} />
          </motion.div>
        ))}

            <motion.span 
              variants={itemVariants}
              className="p-3 text-[9px] font-bold bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-full px-5 "
            >
              From Developer to Developers
            </motion.span>
            
            <motion.h1 
              variants={itemVariants}
              className="text-[50px] mt-10 font-bold text-gray-900 dark:text-white " 
              style={{ fontWeight: 900 }}
            >
              Manage Your Projects Like a Pro!
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-sm text-gray-600 dark:text-gray-300 mt-8 max-w-4xl leading-relaxed "
            >
                Streamline your development workflow with our powerful project management toolkit. 
                Built by developers, for developers - manage tasks, collaborate with your team, 
                and ship better code faster.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex gap-6 mt-10"
            >
                <motion.button 
                  className="w-[300px] font-bold py-4 bg-black text-white rounded-full text-sm cursor-pointer hover:bg-gray-800 transition-colors shadow-lg dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                    Get Started Free
                </motion.button>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="flex items-center gap-8 mt-12 text-sm text-gray-500 dark:text-gray-400 "
            >
                <motion.div 
                  className="flex items-center gap-2 font-bold"
                  whileHover={{ scale: 1.05 }}
                >
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Free Forever
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2 font-bold"
                  whileHover={{ scale: 1.05 }}
                >
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    No Credit Card Required
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2 font-bold"
                  whileHover={{ scale: 1.05 }}
                >
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Setup in Minutes
                </motion.div>
            </motion.div>
        </motion.div>


        {/* Features Section */}
        <motion.section 
          className="w-full max-w-7xl mx-auto px-6 py-20 relative z-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl text-gray-900 dark:text-white  mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              style={{
                fontWeight: 900
              }}
            >
              Powerful Features
            </motion.h2>
            <motion.p 
              className="text-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
              style={{
                fontWeight: 600
              }}
            >
              Everything you need to manage projects efficiently
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
              icon: <RocketIcon />,
                title: "Fast Deployment",
                description: "Deploy your projects in seconds with one-click deployment and automated CI/CD pipelines.",
                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop"
              },
              {
                icon: <Users />,
                title: "Team Collaboration",
                description: "Work seamlessly with your team using real-time collaboration tools and shared workspaces.",
                image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop"
              },
              {
                icon: <LayoutDashboard />,
                title: "Analytics & Insights",
                description: "Get detailed insights into your project performance with comprehensive analytics dashboard.",
                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop"
              },
              {
                icon: <Lock />,
                title: "Enterprise Security",
                description: "Keep your code secure with enterprise-grade security features and compliance standards.",
                image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop"
              },
              {
                icon: <Lightbulb />,
                title: "Lightning Fast",
                description: "Optimized for speed with advanced caching and CDN integration for maximum performance.",
                image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop"
              },
              {
                icon:<ToolCase />,
                title: "Developer Tools",
                description: "Access a comprehensive suite of development tools and integrations with popular services.",
                image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                // whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                viewport={{ once: true }}
              >
                <div className="w-full h-48 mb-6 rounded-lg overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="w-[80px] h-[80px] bg-[rgba(0,0,0,0.1)] rounded-full flex items-center justify-center mb-4 dark:bg-[rgba(255,255,255,0.1)]">
                  <div className="w-12 h-12 text-black dark:text-white flex items-center justify-center ">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-[20px] font-bold  dark:text-white mb-4 " >
                  {feature.title}
                </h3>
                <p className="text-[10px] font-bold text-gray-600 dark:text-gray-300  leading-relaxed">
                  {feature.description}
                </p>
                <button className="text-[10px] font-bold text-white  leading-relaxed w-[50px] h-12 bg-black border-black dark:border-white rounded-full mt-4 flex items-center justify-center dark:bg-white dark:text-black" style={{
                    marginLeft: 'calc(100% - 50px)'
                }}><ArrowRight /></button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section 
          className="w-full bg-black py-16 relative dark:bg-white"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {[
                { number: "50K+", label: "Active Developers" },
                { number: "100K+", label: "Projects Deployed" },
                { number: "99.9%", label: "Uptime Guarantee" },
                { number: "24/7", label: "Support Available" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="text-4xl font-bold text-white dark:text-black mb-2 "
                    style={{
                      fontWeight: 900
                    }}>
                    {stat.number}
                  </div>
                  <div className="text-gray-300 font-semibold text-sm dark:text-gray-700"
                    >
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section 
          className="w-full max-w-7xl mx-auto px-6 py-20 relative z-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl font-bold text-gray-900 dark:text-white  mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              style={{
                fontWeight: 900
              }}
            >
              What Developers Say
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "This platform transformed how we manage our projects. The deployment process is so smooth!",
                author: "Sarah Chen",
                role: "Senior Developer at TechCorp",
                avatar: "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHVzZXJ8ZW58MHx8MHx8fDA%3D"
              },
              {
                quote: "Incredible tool for team collaboration. Our productivity increased by 300% since switching.",
                author: "Mike Rodriguez",
                role: "Lead Engineer at Startup",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
              },
              {
                quote: "The best developer experience I've ever had. Everything just works out of the box.",
                author: "Alex Johnson",
                role: "Freelance Developer",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="p-8 glass-card rounded-2xl relative overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                viewport={{ once: true }}
              >
                <div className="text-2xl text-black mb-4 dark:text-white">"</div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm  leading-relaxed">
                  {testimonial.quote}
                </p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white text-sm ">
                      {testimonial.author}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs ">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section 
          className="w-full max-w-7xl mx-auto px-6 py-20 relative z-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        
        >
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl font-bold text-gray-900 dark:text-white  mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              style={{
                fontWeight: 900
              }}
            >
How It Works
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Register",
                description: "Create your account in seconds and get instant access to all features."
              },
              {
                step: "02", 
                title: "Connect",
                description: "Link your repositories and invite your team members to start collaborating."
              },
              {
                step: "03",
                title: "Deploy",
                description: "Push your code and watch it deploy automatically with zero configuration."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="text-6xl font-bold text-black mb-4 dark:text-white"   style={{
            fontWeight: 900
          }}>
                  {step.step}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 " >
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300  text-sm leading-relaxed" 
                  style={{
                    fontWeight: 800
                  }}>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Final CTA Section */}
        <motion.section 
          className="w-full bg-black dark:bg-black py-20 relative z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto text-center px-6">
            <motion.h2 
              className="text-4xl font-bold text-white mb-6 "
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              Ready to Get Started?
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-300 mb-10 "
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
            >
              Join thousands of developers who trust our platform
            </motion.p>
            <motion.button 
              className="w-[400px] font-bold py-4 bg-white text-black rounded-full text-lg  transition-colors shadow-lg dark:bg-white dark:text-black "
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              whileTap={{ scale: 0.95 }}
              viewport={{ once: true }}
            >
              Start Your Free Trial
            </motion.button>
          </div>
        </motion.section>
        
        <Footer />
    </div>
  )
}

export default Indexing