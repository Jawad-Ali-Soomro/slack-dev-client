import { useEffect, useState } from 'react'

export const MODAL_CLOSE_MS = 280

export function useModalAnimation(isOpen: boolean) {
  const [shouldRender, setShouldRender] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      setIsClosing(false)
      return undefined
    }

    if (!shouldRender) {
      return undefined
    }

    setIsClosing(true)
    const timer = window.setTimeout(() => {
      setShouldRender(false)
      setIsClosing(false)
    }, MODAL_CLOSE_MS)

    return () => window.clearTimeout(timer)
  }, [isOpen, shouldRender])

  return { shouldRender, isClosing }
}

export function useModalBodyLock(shouldRender: boolean, onClose: () => void) {
  useEffect(() => {
    if (!shouldRender) {
      return undefined
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEscape)
    }
  }, [shouldRender, onClose])
}
