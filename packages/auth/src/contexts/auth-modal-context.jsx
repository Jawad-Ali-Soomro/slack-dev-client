import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const AuthModalContext = createContext(null)

export function AuthModalProvider({ children }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  const [stayOnPage, setStayOnPage] = useState(false)
  const onLoginSuccessRef = useRef(null)

  const openLoginModal = useCallback((options = {}) => {
    setIsSignupOpen(false)
    setStayOnPage(Boolean(options.stayOnPage))
    onLoginSuccessRef.current =
      typeof options.onSuccess === 'function' ? options.onSuccess : null
    setIsLoginOpen(true)
  }, [])

  const closeLoginModal = useCallback(() => {
    setIsLoginOpen(false)
    setStayOnPage(false)
    onLoginSuccessRef.current = null
  }, [])

  const consumeLoginSuccess = useCallback(() => {
    const cb = onLoginSuccessRef.current
    const shouldStay = stayOnPage
    onLoginSuccessRef.current = null
    setStayOnPage(false)
    return { onSuccess: cb, stayOnPage: shouldStay }
  }, [stayOnPage])

  const openSignupModal = useCallback(() => {
    setIsLoginOpen(false)
    setIsSignupOpen(true)
  }, [])

  const closeSignupModal = useCallback(() => {
    setIsSignupOpen(false)
  }, [])

  const value = useMemo(
    () => ({
      isLoginOpen,
      isSignupOpen,
      stayOnPage,
      openLoginModal,
      closeLoginModal,
      openSignupModal,
      closeSignupModal,
      consumeLoginSuccess,
    }),
    [
      isLoginOpen,
      isSignupOpen,
      stayOnPage,
      openLoginModal,
      closeLoginModal,
      openSignupModal,
      closeSignupModal,
      consumeLoginSuccess,
    ],
  )

  return (
    <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  const context = useContext(AuthModalContext)

  if (!context) {
    throw new Error('useAuthModal must be used within AuthModalProvider')
  }

  return context
}

export function useLoginModal() {
  const {
    isLoginOpen,
    openLoginModal,
    closeLoginModal,
    openSignupModal,
    consumeLoginSuccess,
    stayOnPage,
  } = useAuthModal()

  return {
    isOpen: isLoginOpen,
    openLoginModal,
    closeLoginModal,
    openSignupModal,
    consumeLoginSuccess,
    stayOnPage,
  }
}

export function useSignupModal() {
  const {
    isSignupOpen,
    openSignupModal,
    closeSignupModal,
    openLoginModal,
  } = useAuthModal()

  return {
    isOpen: isSignupOpen,
    openSignupModal,
    closeSignupModal,
    openLoginModal,
  }
}
