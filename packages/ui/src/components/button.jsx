import { cn } from '@multi-tenants/utils'

export default function Button({
  type = 'button',
  className = '',
  variant = 'primary',
  children,
  onClick,
  disabled,
  ...props
}) {
  return (
    <button
      className={cn(
        'h-10 flex items-center cursor-pointer justify-center capitalize rounded-[15px] text-sm transition',
        variant === 'outlined'
          ? 'border border-gray-200 text-gray-700 hover:bg-gray-100'
          : 'bg-primary border-none text-white hover:bg-primary/90',
        className,
      )}
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
