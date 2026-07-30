import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const SidebarContext = createContext(null)

const STORAGE_KEY = 'sidebar-collapsed'

function readInitialCollapsed() {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function SidebarProvider({ children, defaultCollapsed = false }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = readInitialCollapsed()
    return stored ?? defaultCollapsed
  })

  const collapse = useCallback(() => {
    setIsCollapsed(true)
    try {
      window.localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // ignore persistence errors
    }
  }, [])

  const expand = useCallback(() => {
    setIsCollapsed(false)
    try {
      window.localStorage.setItem(STORAGE_KEY, 'false')
    } catch {
      // ignore persistence errors
    }
  }, [])

  const toggle = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        // ignore persistence errors
      }
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      isCollapsed,
      collapse,
      expand,
      toggle,
    }),
    [isCollapsed, collapse, expand, toggle],
  )

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)

  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }

  return context
}
