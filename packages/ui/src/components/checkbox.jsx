import { PiCheck, PiMinus } from 'react-icons/pi'
import { cn } from '@multi-tenants/utils'

/**
 * shadcn-style checkbox (button-based, controlled).
 * Supports checked, indeterminate, onCheckedChange, and legacy onChange.
 */
export default function Checkbox({
  checked = false,
  indeterminate = false,
  onCheckedChange,
  onChange,
  disabled = false,
  className = '',
  id,
  name,
  value,
  'aria-label': ariaLabelProp,
  ariaLabel: ariaLabelAlias,
}) {
  const isChecked = Boolean(checked)
  const isIndeterminate = Boolean(indeterminate) && !isChecked
  const resolvedAriaLabel = ariaLabelProp || ariaLabelAlias

  function handleToggle() {
    if (disabled) return
    const next = isIndeterminate ? true : !isChecked
    onCheckedChange?.(next)
    onChange?.({
      target: {
        checked: next,
        name,
        value,
        type: 'checkbox',
      },
    })
  }

  return (
    <button
      type="button"
      role="checkbox"
      id={id}
      name={name}
      value={value}
      aria-checked={isIndeterminate ? 'mixed' : isChecked}
      aria-label={resolvedAriaLabel}
      disabled={disabled}
      onClick={handleToggle}
      className={cn(
        'checkbox peer inline-flex size-4 shrink-0 cursor-pointer items-center justify-center border border-zinc-300 bg-white text-white shadow-sm transition-colors',
        'hover:border-primary/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        (isChecked || isIndeterminate) &&
          'border-primary bg-primary text-white hover:border-primary hover:bg-primary',
        className,
      )}
    >
      {isChecked ? <PiCheck className="icon size-3.5" aria-hidden /> : null}
      {isIndeterminate ? <PiMinus className="icon size-3.5" aria-hidden /> : null}
    </button>
  )
}
