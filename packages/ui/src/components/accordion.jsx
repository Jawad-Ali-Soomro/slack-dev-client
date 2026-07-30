import { useState } from 'react'
import { PiCaretDown } from 'react-icons/pi'
import { cn } from '@multi-tenants/utils'

export default function Accordion({
  title,
  description,
  icon: Icon,
  count,
  defaultOpen = false,
  actions = null,
  children,
  className = '',
  variant = 'default',
}) {
  const [open, setOpen] = useState(defaultOpen)
  const nested = variant === 'nested'

  return (
    <section
      className={cn(
        'overflow-hidden border bg-white',
        nested
          ? 'rounded-2xl border-zinc-200/90 bg-zinc-50/60'
          : 'rounded-2xl border-zinc-200',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 px-4',
          nested ? 'py-3' : 'py-3.5',
          open && 'border-b border-zinc-100',
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          {Icon ? (
            <span
              className={cn(
                'flex shrink-0 items-center justify-center text-zinc-600 transition',
                nested
                  ? 'size-8 rounded-xl bg-white'
                  : 'size-10 rounded-2xl bg-zinc-100',
              )}
            >
              <Icon className={cn('icon', nested ? 'size-3.5' : 'size-4')} />
            </span>
          ) : null}
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'font-semibold text-zinc-900',
                  nested ? 'text-sm' : 'text-base',
                )}
              >
                {title}
              </span>
              {typeof count === 'number' ? (
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
                  {count}
                </span>
              ) : null}
            </span>
            {description ? (
              <span className="mt-0.5 block text-sm text-zinc-500">
                {description}
              </span>
            ) : null}
          </span>
          <PiCaretDown
            className={cn('icon', 
              'size-4 shrink-0 text-zinc-400 transition-transform duration-300 ease-out',
              open && 'rotate-180',
            )}
          />
        </button>
        {actions ? (
          <div
            className="flex shrink-0 items-center gap-1.5"
            onClick={(event) => event.stopPropagation()}
          >
            {actions}
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={cn(
              'accordion-panel',
              open && 'accordion-panel-open',
              nested ? 'px-3 py-3' : 'px-4 py-4',
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
