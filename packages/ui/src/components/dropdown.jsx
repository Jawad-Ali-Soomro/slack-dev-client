import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { FiCheck, FiChevronDown } from 'react-icons/fi'
import { cn } from '@multi-tenants/utils'

const DropdownMenuContext = createContext(null)

function useDropdownMenu() {
  const context = useContext(DropdownMenuContext)
  if (!context) {
    throw new Error('DropdownMenu components must be used within DropdownMenu')
  }
  return context
}

export function DropdownMenu({
  children,
  className = '',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : uncontrolledOpen
  const triggerRef = useRef(null)
  const contentRef = useRef(null)

  const setOpen = useCallback(
    (next) => {
      if (!isControlled) {
        setUncontrolledOpen(next)
      }
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange],
  )

  const value = useMemo(
    () => ({
      open,
      setOpen,
      triggerRef,
      contentRef,
    }),
    [open, setOpen],
  )

  return (
    <DropdownMenuContext.Provider value={value}>
      <div className={cn('relative inline-flex', className)}>{children}</div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuTrigger({
  children,
  className = '',
  disabled = false,
  ...props
}) {
  const { open, setOpen, triggerRef } = useDropdownMenu()

  return (
    <button
      ref={triggerRef}
      type="button"
      disabled={disabled}
      aria-haspopup="menu"
      aria-expanded={open}
      data-state={open ? 'open' : 'closed'}
      {...props}
      className={cn(
        'inline-flex h-9 items-center justify-between gap-2 rounded-[10px] border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
        className,
      )}
      onClick={(event) => {
        props.onClick?.(event)
        if (!event.defaultPrevented && !disabled) {
          setOpen(!open)
        }
      }}
    >
      {children}
    </button>
  )
}

export function DropdownMenuContent({
  children,
  className = '',
  align = 'start',
  sideOffset = 4,
  matchTriggerWidth = false,
  ...props
}) {
  const { open, setOpen, triggerRef, contentRef } = useDropdownMenu()
  const [coords, setCoords] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setEntered(false)
      setCoords(null)
      return undefined
    }

    const updatePosition = () => {
      const rect = triggerRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + sideOffset,
        left: rect.left,
        right: window.innerWidth - rect.right,
        width: rect.width,
        center: rect.left + rect.width / 2,
      })
    }

    updatePosition()
    const frame = requestAnimationFrame(() => setEntered(true))

    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, sideOffset, triggerRef])

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      const target = event.target
      if (
        contentRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [open, setOpen, contentRef, triggerRef])

  if (!mounted || !open || !coords) {
    return null
  }

  const style = {
    top: coords.top,
    minWidth: matchTriggerWidth ? coords.width : undefined,
    width: matchTriggerWidth ? coords.width : undefined,
    ...(align === 'end'
      ? { right: coords.right, left: 'auto' }
      : align === 'center'
        ? { left: coords.center, transform: 'translateX(-50%)' }
        : { left: coords.left }),
  }

  return createPortal(
    <div
      ref={contentRef}
      role="menu"
      tabIndex={-1}
      data-state={entered ? 'open' : 'closed'}
      data-align={align}
      className={cn(
        'fixed z-[200] min-w-[8rem] overflow-hidden rounded-[10px] border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none',
        entered
          ? 'dropdown-menu-content-enter'
          : 'opacity-0 scale-95',
        className,
      )}
      style={style}
      {...props}
    >
      {children}
    </div>,
    document.body,
  )
}

export function DropdownMenuLabel({ children, className = '', inset = false }) {
  return (
    <div
      className={cn(
        'px-2 py-1.5 text-sm font-semibold text-foreground',
        inset && 'pl-8',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function DropdownMenuSeparator({ className = '' }) {
  return (
    <div
      role="separator"
      className={cn('-mx-1 my-1 h-px bg-border', className)}
    />
  )
}

export function DropdownMenuGroup({ children, className = '' }) {
  return (
    <div role="group" className={className}>
      {children}
    </div>
  )
}

export function DropdownMenuShortcut({ children, className = '' }) {
  return (
    <span
      className={cn(
        'ml-auto text-xs tracking-widest text-muted-foreground',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function DropdownMenuItem({
  children,
  className = '',
  inset = false,
  disabled = false,
  destructive = false,
  onSelect,
  ...props
}) {
  const { setOpen } = useDropdownMenu()

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      data-disabled={disabled || undefined}
      {...props}
      className={cn(
        'relative flex w-full cursor-default select-none items-center gap-2 rounded-[10px] px-4 py-2 text-left text-sm outline-none transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus:bg-accent focus:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
        inset && 'pl-8',
        destructive &&
          'text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive',
        className,
      )}
      onClick={(event) => {
        if (disabled) return
        props.onClick?.(event)
        onSelect?.(event)
        if (!event.defaultPrevented) {
          setOpen(false)
        }
      }}
    >
      {children}
    </button>
  )
}

/**
 * Form-friendly select built on the same shadcn-style dropdown.
 * options: [{ value, label, disabled? }]
 */
export function Dropdown({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  className = '',
  triggerClassName = '',
  contentClassName = '',
  disabled = false,
  align = 'start',
}) {
  const [open, setOpen] = useState(false)
  const listId = useId()
  const selected = options.find((option) => option.value === value)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} className="w-full">
      <DropdownMenuTrigger
        disabled={disabled}
        aria-controls={listId}
        className={cn(
          'h-12 w-full justify-between rounded-[10px] border-gray-200 bg-white px-4 font-normal text-gray-700 shadow-none',
          'hover:bg-accent/60 hover:text-accent-foreground',
          'focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_3px_rgba(16,185,129,0.15)]',
          'data-[state=open]:border-primary data-[state=open]:bg-accent/60 data-[state=open]:text-accent-foreground',
          !selected && 'text-muted-foreground',
          triggerClassName,
          className,
        )}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <FiChevronDown
          className={cn('icon', 
            'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        id={listId}
        align={align}
        matchTriggerWidth
        className={cn('max-h-72 overflow-y-auto', contentClassName)}
      >
        {options.length === 0 ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            No options
          </div>
        ) : (
          options.map((option) => {
            const isSelected = option.value === value

            return (
              <DropdownMenuItem
                key={String(option.value)}
                disabled={option.disabled}
                className={cn(
                  isSelected && 'bg-accent text-accent-foreground',
                )}
                onSelect={() => {
                  onChange?.(option.value)
                }}
              >
                <span className="flex-1 truncate">{option.label}</span>
                {isSelected ? (
                  <FiCheck className="icon text-foreground" />
                ) : (
                  <span className="size-4 shrink-0" />
                )}
              </DropdownMenuItem>
            )
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Dropdown
