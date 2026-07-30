import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { PiPencilSimple, PiUserPlus, PiX } from 'react-icons/pi'
import {
  useModalAnimation,
  useModalBodyLock,
} from '@multi-tenants/hooks'
import { cn, formatRoleLabel } from '@multi-tenants/utils'
import Button from '../button.jsx'
import { Dropdown } from '../dropdown.jsx'
import {
  FieldLabel,
  FormFieldProvider,
  SectionTitle,
  useFormField,
} from '../../contexts/form-field-context.jsx'

const ORG_ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'MEMBER', label: 'Member' },
  { value: 'GUEST', label: 'Guest' },
]

const TEAM_ROLE_OPTIONS = [
  { value: 'LEAD', label: 'Lead' },
  { value: 'MEMBER', label: 'Member' },
]

function IconDropdown({ icon: Icon, className = '', triggerClassName = '', ...props }) {
  const { rounded } = useFormField()

  return (
    <div className={cn('relative', className)}>
      {Icon ? (
        <Icon className="icon pointer-events-none absolute left-3.5 top-1/2 z-10 size-[1.05rem] -translate-y-1/2 text-zinc-400" />
      ) : null}
      <Dropdown
        {...props}
        triggerClassName={cn(
          'h-12 w-full justify-between border-gray-200 px-4 font-normal shadow-none',
          Icon && 'pl-11',
          rounded,
          triggerClassName,
        )}
      />
    </div>
  )
}

export default function EditMemberRoleModal({
  isOpen,
  onClose,
  onSaved,
  member = null,
  scope = 'organization',
  contextLabel = '',
}) {
  const { shouldRender, isClosing } = useModalAnimation(isOpen)
  const options = scope === 'team' ? TEAM_ROLE_OPTIONS : ORG_ROLE_OPTIONS
  const [role, setRole] = useState(member?.role ?? options[0]?.value)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = useCallback(() => {
    if (isSubmitting) return
    onClose?.()
  }, [isSubmitting, onClose])

  useModalBodyLock(shouldRender, handleClose)

  useEffect(() => {
    if (!isOpen) {
      setError('')
      setIsSubmitting(false)
      return
    }
    const defaults = scope === 'team' ? TEAM_ROLE_OPTIONS : ORG_ROLE_OPTIONS
    setRole(member?.role ?? defaults[0]?.value)
  }, [isOpen, member, scope])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!member) return

    setIsSubmitting(true)
    setError('')
    try {
      await onSaved?.(role)
      onClose?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!shouldRender || !member) {
    return null
  }

  return createPortal(
    <div className="fixed icon inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close edit role modal"
        onClick={handleClose}
        className={`absolute inset-0 bg-black/30 icon backdrop-blur-sm ${
          isClosing ? 'login-modal-backdrop-exit' : 'login-modal-backdrop-enter'
        }`}
      />

      <FormFieldProvider rounded="rounded-xl">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-member-role-title"
          className={`relative z-10 w-full max-w-md rounded-[28px] bg-white p-8 shadow-2xl ${
            isClosing ? 'login-modal-panel-exit' : 'login-modal-panel-enter'
          }`}
        >
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="absolute right-5 top-5 text-gray-400 transition hover:scale-110 hover:text-black"
          >
            <PiX className="icon text-xl" />
          </button>

          <SectionTitle
            icon={PiPencilSimple}
            title="Update role"
            description={
              <>
                Change role for{' '}
                <span className="font-medium text-gray-800">
                  {member.user?.username}
                </span>
                {contextLabel ? (
                  <>
                    {' '}
                    in{' '}
                    <span className="font-medium text-gray-800">
                      {contextLabel}
                    </span>
                  </>
                ) : null}
              </>
            }
            className="pr-8"
          />

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <FieldLabel>
              <IconDropdown
                icon={PiUserPlus}
                value={role}
                onChange={setRole}
                options={options}
              />
            </FieldLabel>

            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outlined"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4"
              >
                {isSubmitting ? 'Saving...' : 'Save role'}
              </Button>
            </div>
          </form>
        </div>
      </FormFieldProvider>
    </div>,
    document.body,
  )
}
