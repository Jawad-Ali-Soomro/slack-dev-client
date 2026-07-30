import { useCallback, useEffect, useState } from 'react'
import { PiEnvelopeSimple, PiUserPlus, PiX } from 'react-icons/pi'
import { assignOrganizationAdminRequest } from '@multi-tenants/api'
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

export default function AssignAdminModal({
  isOpen,
  onClose,
  onAssigned,
  organization = null,
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
    if (!organization?.id) return

    setIsSubmitting(true)
    setError('')

    try {
      const updated = await assignOrganizationAdminRequest(
        organization.id,
        email.trim(),
      )
      onAssigned?.(updated)
      onClose?.()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to assign admin',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!shouldRender || !organization) {
    return null
  }

  return (
    <div className="fixed icon inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close assign admin modal"
        onClick={handleClose}
        className={`absolute inset-0 bg-black/30 icon backdrop-blur-sm ${
          isClosing ? 'login-modal-backdrop-exit' : 'login-modal-backdrop-enter'
        }`}
      />

      <FormFieldProvider rounded="rounded-xl">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="assign-admin-title"
          className={`relative z-10 w-full max-w-md bg-white p-6 shadow-2xl sm:p-8 ${
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
            title="Assign admin"
            description={
              <>
                Hand{' '}
                <span className="font-medium text-gray-800">
                  {organization.name}
                </span>{' '}
                to an existing user. 
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
                placeholder="admin@example.com"
                aria-label="Admin email"
              />
            </FieldLabel>

            {/* {organization.owner?.email ? (
              <badge className="bg-muted w-auto px-3 py-2 text-xs text-muted-foreground">
                Current owner: {organization.owner.email}
              </badge>
            ) : null} */}

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
                {isSubmitting ? 'Assigning...' : 'Hand off business'}
              </Button>
            </div>
          </form>
        </div>
      </FormFieldProvider>
    </div>
  )
}
