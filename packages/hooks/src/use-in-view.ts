import { useEffect, useRef, useState } from 'react'

type InViewOptions = {
  once?: boolean
  threshold?: number
  rootMargin?: string
}

export function useInView(options: InViewOptions = {}) {
  const ref = useRef<Element | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) {
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          if (options.once !== false) {
            observer.unobserve(element)
          }
        } else if (!options.once) {
          setIsInView(false)
        }
      },
      {
        threshold: options.threshold ?? 0.15,
        rootMargin: options.rootMargin ?? '0px',
      },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [options.once, options.threshold, options.rootMargin])

  return { ref, isInView }
}
