import Header from "../components/Header"
import Footer from "../components/Footer"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Send } from "lucide-react"

const Contact = () => {
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
    <div className="flex flex-col items-center justify-center relative pt-30 overflow-hidden bg-gray-50 dark:bg-gray-900 min-h-screen">
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
            Contact Us
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-xl max-w-3xl mx-auto "
            // style={{ fontWeight: 800 }}
          >
            Get in touch with our team for support, partnerships, or questions
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl text-gray-900 dark:text-white  mb-8" style={{ fontWeight: 600 }}>
              Get in Touch
            </h2>
            <div className="space-y-6">
              {[
                {
                  icon: <Mail />,
                  title: "Email",
                  info: "hello@corestack.dev"
                },
                {
                  icon: <Phone />,
                  title: "Phone",
                  info: "+1 (555) 123-4567"
                },
                {
                  icon: <MapPin />,
                  title: "Address",
                  info: "123 Tech Street, San Francisco, CA 94105"
                }
              ].map((contact, index) => (
                <motion.div
                  key={index}
                  className="glass-card p-6 rounded-2xl flex items-center space-x-4"
                  whileHover={{ y: -5 }}
                >
                  <div className="w-[60px] h-[60px] bg-black rounded-full flex items-center justify-center dark:bg-white">
                    <div className="w-8 h-8 text-white dark:text-black flex items-center justify-center">
                      {contact.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-600 dark:text-white " style={{ fontWeight: 700 }}>
                      {contact.title}
                    </h3>
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-300 ">
                      {contact.info}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl text-gray-900 dark:text-white  mb-8" style={{ fontWeight: 600 }}>
              Send Message
            </h2>
            <form className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full p-4 glass-card rounded-lg border-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400  font-bold text-sm"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full p-4 glass-card rounded-lg border-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400  font-bold text-sm"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full p-4 glass-card rounded-lg border-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400  font-bold text-sm"
                />
              </div>
              <div>
                <textarea
                  rows={6}
                  placeholder="Your Message"
                  className="w-full p-4 glass-card rounded-lg border-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400  font-bold text-sm resize-none"
                ></textarea>
              </div>
              <motion.button
                type="submit"
                className="w-full p-4 bg-black text-white rounded-lg font-bold text-sm  hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send className="w-5 h-5" />
                <span>Send Message</span>
              </motion.button>
            </form>
          </motion.div>
        </div>
      </motion.main>
      
      <Footer />
    </div>
  )
}

export default Contact
