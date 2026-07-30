import { cn } from '@multi-tenants/utils'
import { useFormField } from '../contexts/form-field-context.jsx'
import Input from './input.jsx'

export default function IconInput({
  icon: Icon,
  className = '',
  inputClassName = '',
  ...props
}) {
  const { rounded } = useFormField()

  return (
    <div className={cn('relative', className)}>
      {Icon ? (
        <Icon className="icon pointer-events-none absolute w-400px left-3.5 top-1/2 size-[1.05rem] -translate-y-1/2 text-zinc-400" />
      ) : null}
      <Input
        {...props}
        className={cn(rounded, Icon ? 'pl-11' : 'px-4', inputClassName)}
      />
    </div>
  )
}
