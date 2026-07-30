import { useInView } from '@multi-tenants/hooks'

const directionClasses = {
  up: 'translate-y-10',
  down: '-translate-y-10',
  left: 'translate-x-10',
  right: '-translate-x-10',
}

export default function AnimateOnScroll({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  scale = false,
  duration = 800,
}) {
  const { ref, isInView } = useInView({
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  })

  const hiddenTransform = directionClasses[direction] ?? directionClasses.up
  const scaleClass = scale ? 'scale-95' : ''

  return (
    <div
      ref={ref}
      className={`will-change-transform ${
        isInView
          ? 'translate-x-0 translate-y-0 scale-100 opacity-100'
          : `opacity-0 ${hiddenTransform} ${scaleClass}`
      } ${className}`}
      style={{
        transitionProperty: 'opacity, transform',
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
