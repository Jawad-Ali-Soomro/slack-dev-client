import { createContext, useContext, useMemo } from 'react'
import { cn } from '@multi-tenants/utils'

const FormFieldContext = createContext(null)

export function FormFieldProvider({
  children,
  rounded = 'rounded-xl',
  className = '',
}) {
  const value = useMemo(
    () => ({
      rounded,
    }),
    [rounded],
  )

  return (
    <FormFieldContext.Provider value={value}>
      <div className={className}>{children}</div>
    </FormFieldContext.Provider>
  )
}

export function useFormField() {
  const context = useContext(FormFieldContext)

  return (
    context ?? {
      rounded: 'rounded-xl',
    }
  )
}

export function FieldLabel({ children, htmlFor, className = '' }) {
  return (
    <label htmlFor={htmlFor} className={cn('block space-y-1.5', className)}>
      {children}
    </label>
  )
}

export function SectionTitle({
  icon: Icon,
  title,
  description,
  className = '',
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {Icon ? (
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center bg-zinc-100 text-zinc-600">
          <Icon className="icon size-5" />
        </div>
      ) : null}
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
        {description ? (
          <div className="text-sm text-zinc-500">{description}</div>
        ) : null}
      </div>
    </div>
  )
}
