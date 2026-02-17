import { Menu, Github, Linkedin, Instagram, LogIn, Home, Info, Phone } from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useSidebar } from "../contexts/SidebarContext"
import { useAuth } from "../contexts/AuthContext"
import { RiLoginCircleLine } from "react-icons/ri"

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { toggleSidebar } = useSidebar()
  const { user, isAuthenticated } = useAuth()
  
  const isActive = (path) => location.pathname === path
  
  const getLinkClasses = (path) => {
    const baseClasses = " text-sm font-bold hidden md:block hover:text-gray-700 dark:hover:text-gray-500 text-black transition-all duration-300  relative"
    const activeClasses = "text-black icon border-none"
    const inactiveClasses = "text-gray-500  border-transparent"
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`
  }
  
  return (
    <header className="w-[90%] mx-auto h-20  rounded-[10px] flex items-center justify-between px-5 fixed top-10 left-1/2 -translate-x-1/2 z-100">

      <div className="flex items-center gap-8 uppercase">
        {/* Menu button for authenticated users - only on mobile */}
     
        
        <div className="p-3 bg-white dark:bg-white rounded-full">
          <img src="/logo.png" alt="logo" className="w-8 h-8 cursor-pointer" onClick={() => navigate("/")} />
        </div>
     
      </div>

     
          
          
          <div className="flex items-center gap-2 md:gap-4">
          {/* Social Media Icons - Hidden on mobile */}
       
          
          {/* Login Button - Responsive sizing */}
          <button 
            onClick={() => navigate("/login")}
            className="  w-[200px]  flex items-center justify-between px-5 h-[50px] rounded-[25px] md:py-4 cursor-pointer bg-black text-white uppercase hover:bg-black transition-colors dark:bg-white dark:text-black dark:hover:bg-gray-200"
            style={{
              borderRadius: '25px'
            }}
          >
            Login
            <RiLoginCircleLine className="w-5 h-5 icon icon" />
          </button>
        </div>

    </header>
  )
}

export default Header