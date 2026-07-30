import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { PiEnvelopeSimple, PiUserPlus, PiX } from 'react-icons/pi'
import { addTeamMemberRequest } from '@multi-tenants/api'
import {
  useModalAnimation,
  useModalBodyLock,
} from '@multi-tenants/hooks'
import Button from '../button.jsx'
import IconInput from '../icon-input.jsx'
import {
  FieldLabel,
  FormFieldProvider,
  SectionTitle,
} from '../../contexts/form-field-context.jsx'

export default function AddTeamMemberModal({
  isOpen,
  onClose,
  onAdded,
  organizationId,
  team = null,
}) {
  const { shouldRender, isClosing } = useModalAnimation(isOpen)
  const [email, setEmail] = useState('')
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
      setError('')
      setIsSubmitting(false)
    }
  }, [isOpen])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!organizationId || !team?.id) return

    setIsSubmitting(true)
    setError('')

    try {
      await addTeamMemberRequest(organizationId, team.id, {
        email: email.trim(),
      })
      onAdded?.()
      onClose?.()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to add team member',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!shouldRender || !team) {
    return null
  }

  return createPortal(
    <div className="fixed icon inset-0 z-[110] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close add team member modal"
        onClick={handleClose}
        className={`absolute inset-0 bg-black/30 icon backdrop-blur-sm ${
          isClosing ? 'login-modal-backdrop-exit' : 'login-modal-backdrop-enter'
        }`}
      />

      <FormFieldProvider rounded="rounded-xl">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-team-member-title"
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
            title="Add to team"
            description={
              <>
                Add an existing business member to{' '}
                <span className="font-medium text-gray-800">{team.name}</span>.
              </>
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
                placeholder="member@example.com"
                aria-label={`Add member to ${team.name}`}
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
                {isSubmitting ? 'Adding...' : 'Add to team'}
              </Button>
            </div>
          </form>
        </div>
      </FormFieldProvider>
    </div>,
    document.body,
  )
}
