import { useCallback } from 'react'
import { PiX } from 'react-icons/pi'
import {
  useModalAnimation,
  useModalBodyLock,
} from '@multi-tenants/hooks'
import { cn } from '@multi-tenants/utils'

export default function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = '',
  wide = false,
}) {
  const { shouldRender, isClosing } = useModalAnimation(isOpen)

  const handleClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  useModalBodyLock(shouldRender, handleClose)

  if (!shouldRender) {
    return null
  }

  return (
    <div className="fixed icon inset-0 z-[100] flex justify-end">
      <button
        type="button"
        aria-label="Close drawer"
        onClick={handleClose}
        className={`absolute inset-0 bg-black/30 icon backdrop-blur-sm ${
          isClosing ? 'drawer-backdrop-exit' : 'drawer-backdrop-enter'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Details'}
        className={cn(
          'relative z-10 flex h-full w-full icon flex-col overflow-hidden border-l border-zinc-200 bg-white shadow-2xl',
          wide ? 'max-w-2xl' : 'max-w-xl',
          isClosing ? 'drawer-panel-exit' : 'drawer-panel-enter',
          className,
        )}
      >
        <header className="flex shrink-0 items-start icon justify-between gap-4 border-b border-zinc-100 px-6 py-5">
          <div className="min-w-0 pr-2">
            {typeof title === 'string' ? (
              <h2 className="truncate text-xl font-bold text-zinc-900">
                {title}
              </h2>
            ) : (
              title
            )}
            {description ? (
              <p className="mt-1 text-sm text-zinc-500">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex size-9 shrink-0 items-center justify-center text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-800"
          >
            <PiX className="icon size-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </aside>
    </div>
  )
}
