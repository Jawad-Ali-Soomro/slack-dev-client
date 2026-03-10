import { createContext, useContext, useState, useEffect } from 'react'

const SidebarContext = createContext()

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

export const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1100)

  // Update isMobile on window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1100)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false)
    } else {
      setIsOpen(true)
    }
  }, [isMobile])

  const toggleSidebar = () => setIsOpen(prev => !prev)
  const closeSidebar = () => setIsOpen(false)
  const openSidebar = () => setIsOpen(true)

  return (
    <SidebarContext.Provider value={{
      isOpen,
      isMobile,
      toggleSidebar,
      closeSidebar,
      openSidebar
    }}>
      {children}
    </SidebarContext.Provider>
  )
}