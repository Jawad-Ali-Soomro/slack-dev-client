import { Menu } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

const Header = () => {
  const navigate = useNavigate()
  return (
    <header className="bg-gray-50 dark:bg-gray-900 w-[90%] mx-auto border h-20  rounded-full flex items-center justify-between px-5 fixed top-10 left-1/2 -translate-x-1/2 z-100" style={{
        backdropFilter: "blur(10px)"
    }}>
        <img src="/logo.png" alt="logo" className="w-10 h-10 cursor-pointer" onClick={() => navigate("/")} />
        <div className="flex items-center gap-8 uppercase">
            <Link className="font-bold text-sm text-gray-500 dark:text-gray-200 hidden md:block hover:text-gray-700 transition-colors" style={{fontWeight: 700}} to="/">Home</Link>
            <Link className="font-bold text-sm text-gray-500 dark:text-gray-200 hidden md:block hover:text-gray-700 transition-colors" style={{fontWeight: 700}} to="/about">About</Link>
            <Link className="font-bold text-sm text-gray-500 dark:text-gray-200 hidden md:block hover:text-gray-700 transition-colors" style={{fontWeight: 700}} to="/contact">Contact</Link>
            <Link className="font-bold text-sm text-gray-500 dark:text-gray-200 hidden md:block hover:text-gray-700 transition-colors" style={{fontWeight: 700}} to="/teams">Teams</Link>
            <Link className="font-bold text-sm text-gray-500 dark:text-gray-200 hidden md:block hover:text-gray-700 transition-colors" style={{fontWeight: 700}} to="/pricing">Pricing</Link>
            {/* <ThemeToggle className="scale-75 border-none" /> */}
            <button className="font-bold text-sm bg-gray-800 text-white w-[160px] py-4 rounded-full cursor-pointer bg-orange-500 uppercase">Login</button>
        </div>
    </header>
  )
}

export default Header