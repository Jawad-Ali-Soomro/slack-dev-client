import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { PiEnvelopeSimple, PiUserPlus, PiX } from 'react-icons/pi'
import { addMemberRequest } from '@multi-tenants/api'
import {
  useModalAnimation,
  useModalBodyLock,
} from '@multi-tenants/hooks'
import Button from '../button.jsx'
import IconInput from '../icon-input.jsx'
import { Dropdown } from '../dropdown.jsx'
import {
  FieldLabel,
  FormFieldProvider,
  SectionTitle,
  useFormField,
} from '../../contexts/form-field-context.jsx'
import { cn } from '@multi-tenants/utils'

const MEMBER_ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MEMBER', label: 'Member' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'GUEST', label: 'Guest' },
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

export default function AddMemberModal({
  isOpen,
  onClose,
  onAdded,
  organizationId,
  canAssignAdmin = false,
}) {
  const { shouldRender, isClosing } = useModalAnimation(isOpen)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState(canAssignAdmin ? 'ADMIN' : 'MEMBER')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = useCallback(() => {
    if (isSubmitting) return
    onClose?.()
  }, [isSubmitting, onClose])

  useModalBodyLock(shouldRender, handleClose)

  useEffect(() => {
    if (!isOpen) {
      setEmail('')
      setRole(canAssignAdmin ? 'ADMIN' : 'MEMBER')
      setError('')
      setIsSubmitting(false)
    }
  }, [isOpen, canAssignAdmin])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!organizationId) return

    setIsSubmitting(true)
    setError('')

    try {
      await addMemberRequest(organizationId, {
        email: email.trim(),
        role: canAssignAdmin ? role : 'MEMBER',
      })
      onAdded?.()
      onClose?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!shouldRender) {
    return null
  }

  return createPortal(
    <div className="fixed icon inset-0 z-[110] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close add member modal"
        onClick={handleClose}
        className={`absolute inset-0 bg-black/30 icon backdrop-blur-sm ${
          isClosing ? 'login-modal-backdrop-exit' : 'login-modal-backdrop-enter'
        }`}
      />

      <FormFieldProvider rounded="rounded-xl">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-member-title"
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
            icon={PiUserPlus}
            title="Add member"
            description={
              canAssignAdmin
                ? 'Invite a user by email and choose their role.'
                : 'Invite a user by email to this business.'
            }
            className="pr-8"
          />

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <FieldLabel>
              <IconInput
                icon={PiEnvelopeSimple}
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="user@example.com"
                aria-label="Member email"
              />
            </FieldLabel>

            {canAssignAdmin ? (
              <FieldLabel>
                <IconDropdown
                  icon={PiUserPlus}
                  value={role}
                  onChange={setRole}
                  options={MEMBER_ROLE_OPTIONS}
                />
              </FieldLabel>
            ) : null}

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
                {isSubmitting
                  ? 'Adding...'
                  : canAssignAdmin
                    ? 'Assign'
                    : 'Add member'}
              </Button>
            </div>
          </form>
        </div>
      </FormFieldProvider>
    </div>,
    document.body,
  )
}
