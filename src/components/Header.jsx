import { Menu, Github, Linkedin, Instagram } from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useSidebar } from "../contexts/SidebarContext"
import { useAuth } from "../contexts/AuthContext"

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { toggleSidebar } = useSidebar()
  const { user, isAuthenticated } = useAuth()
  
  const isActive = (path) => location.pathname === path
  
  const getLinkClasses = (path) => {
    const baseClasses = "font-bold text-sm hidden md:block hover:text-gray-700 dark:hover:text-gray-100 transition-all duration-300 pb-2 border-b-2 relative"
    const activeClasses = "text-black border-black icon dark:text-white dark:border-white"
    const inactiveClasses = "text-gray-500 dark:text-gray-200 border-transparent"
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`
  }
  
  return (
    <header className="bg-gray-50 dark:bg-black w-[90%] mx-auto border h-20  rounded-full flex items-center justify-between px-5 fixed top-10 left-1/2 -translate-x-1/2 z-100" style={{
        backdropFilter: "blur(10px)"
    }}>

      <div className="flex items-center gap-8 uppercase">
        {/* Menu button for authenticated users - only on mobile */}
     
        
        <div className="p-3 bg-gray-200 dark:bg-black rounded-full">
          <img src="/logo.png" alt="logo" className="w-8 h-8 cursor-pointer" onClick={() => navigate("/")} />
        </div>
      <Link className={getLinkClasses("/")} style={{fontWeight: 700}} to="/">Home</Link>
            <Link className={getLinkClasses("/about")} style={{fontWeight: 700}} to="/about">About</Link>
            <Link className={getLinkClasses("/contact")} style={{fontWeight: 700}} to="/contact">Contact</Link>
      </div>
          <div className="flex items-center gap-2 md:gap-4">
          {/* Social Media Icons - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-3">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-gray-200 icon dark:hover:bg-gray-700 transition-colors"
            >
              <Github className="w-5 h-5 text-gray-600 icon dark:text-gray-300" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-gray-200 icon dark:hover:bg-gray-700 transition-colors"
            >
              <Linkedin className="w-5 h-5 text-gray-600 icon dark:text-gray-300" />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Instagram className="w-5 h-5 text-gray-600 icon dark:text-gray-300" />
            </a>
          </div>
          
          {/* Login Button - Responsive sizing */}
          <button 
            onClick={() => navigate("/login")}
            className="font-bold text-xs md:text-sm w-[200px] rounded-[25px] md:w-[160px] py-5 md:py-4 rounded-full cursor-pointer bg-black text-white uppercase hover:bg-black transition-colors dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Login
          </button>
        </div>

    </header>
  )
}

export default Header