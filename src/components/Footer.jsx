import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Github, Twitter, Linkedin, Mail, MapPin, Phone } from "lucide-react"

const Footer = () => {
  return (
    <div className="bg-black text-white icon py-16 w-full" style={{
      borderRadius: 0
    }}>
      <div className="max-w-7xl mx-auto px-6 icon bg">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl ">Core Stack</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Empowering developers worldwide with cutting-edge tools and platforms 
              for modern project management and collaboration.
            </p>
            <div className="flex space-x-4">
              <motion.a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Github className="w-5 h-5 icon" />
              </motion.a>
              <motion.a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Twitter className="w-5 h-5 icon" />
              </motion.a>
              <motion.a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Linkedin className="w-5 h-5 icon" />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg ">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Home
              </Link>
              <Link to="/about" className="block text-gray-300 hover:text-white transition-colors text-sm">
                About
              </Link>
              <Link to="/pricing" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Pricing
              </Link>
              <Link to="/contact" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Contact
              </Link>
            </div>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <h4 className="text-lg ">Products</h4>
            <div className="space-y-2">
              <Link to="/teams" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Teams
              </Link>
              <Link to="/dev-hub" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Dev Hub
              </Link>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                API
              </a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Integrations
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg ">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 icon icon text-gray-400" />
                <span className="text-gray-300 text-sm">hello@corestack.dev</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 icon icon text-gray-400" />
                <span className="text-gray-300 text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 icon icon text-gray-400" />
                <span className="text-gray-300 text-sm">San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8 icon">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 icon">
            <div className="text-gray-400 text-sm">
              © 2024 Core Stack. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer
