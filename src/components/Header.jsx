import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { RiLoginCircleLine } from "react-icons/ri"

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  
  const isActive = (path) => location.pathname === path
  
  const getLinkClasses = (path) => {
    const baseClasses = "text-sm font-bold uppercase tracking-wide hidden md:block hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-300 relative cursor-pointer"
    const activeClasses = "text-black dark:text-white"
    const inactiveClasses = "text-gray-500 dark:text-gray-400"

    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`
  }
  
  const isLanding = location.pathname === "/"

  return (
    <header className="w-[92%] max-w-6xl mx-auto h-16 md:h-[4.5rem] rounded-2xl flex items-center justify-between px-4 md:px-6 fixed top-6 md:top-8 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto">

      <div className="flex items-center gap-6 md:gap-10">
        <div
          className="p-2.5 bg-white dark:bg-white rounded-xl cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate("/")}
        >
          <img src="/logo.png" alt="logo" className="w-7 h-7 md:w-8 md:h-8" />
        </div>

        {isLanding && (
          <nav className="hidden md:flex items-center gap-6 relative z-[9999]">
            <Link to="/about" className={getLinkClasses("/about")}>About</Link>
            <Link to="/contact" className={getLinkClasses("/contact")}>Contact</Link>
            <a
              href="#features"
              className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Features
            </a>
          </nav>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-3 relative z-[9999]">
        <button
          onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
          className="min-w-[140px] md:min-w-[180px] rounded-xl flex items-center justify-between px-4 md:px-5 h-11 md:h-12 cursor-pointer bg-black text-white uppercase text-sm font-bold hover:opacity-90 transition-opacity dark:bg-white dark:text-black"
        >
          {isAuthenticated ? "Dashboard" : "Get Started"}
          <RiLoginCircleLine className="w-5 h-5" />
        </button>
      </div>

    </header>
  )
}

export default Header