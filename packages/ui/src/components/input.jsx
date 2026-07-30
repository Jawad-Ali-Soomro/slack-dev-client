import { cn } from '@multi-tenants/utils'
import { useFormField } from '../contexts/form-field-context.jsx'

export default function Input({
  className = '',
  type = 'text',
  ...props
}) {
  const { rounded } = useFormField()
  const hasCustomXPadding = /\b(p[xlr]?-|pl-|pr-|px-)/.test(className)

  return (
    <input
      type={type}
      className={cn(
        'h-12 w-full border border-gray-200 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-500 focus:border-primary',
        rounded,
        !hasCustomXPadding && 'px-4',
        className,
      )}
      {...props}
    />
  )
}
