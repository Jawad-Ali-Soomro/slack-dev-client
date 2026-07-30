import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { PiLinkSimple, PiUsersThree, PiX } from 'react-icons/pi'
import { createTeamRequest } from '@multi-tenants/api'
import {
  useModalAnimation,
  useModalBodyLock,
} from '@multi-tenants/hooks'
import { slugify } from '@multi-tenants/utils'
import Button from '../button.jsx'
import IconInput from '../icon-input.jsx'
import {
  FieldLabel,
  FormFieldProvider,
  SectionTitle,
  useFormField,
} from '../../contexts/form-field-context.jsx'
import { cn } from '@multi-tenants/utils'

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  slugTouched: false,
}

function DescriptionField(props) {
  const { rounded } = useFormField()

  return (
    <textarea
      {...props}
      className={cn(
        'w-full border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-500 focus:border-primary',
        rounded,
        props.className,
      )}
    />
  )
}

export default function CreateTeamModal({
  isOpen,
  onClose,
  onCreated,
  organizationId,
}) {
  const { shouldRender, isClosing } = useModalAnimation(isOpen)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = useCallback(() => {
    if (isSubmitting) return
    onClose?.()
  }, [isSubmitting, onClose])

  useModalBodyLock(shouldRender, handleClose)

  useEffect(() => {
    if (!isOpen) {
      setForm(EMPTY_FORM)
      setError('')
      setIsSubmitting(false)
    }
  }, [isOpen])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!organizationId) return

    setIsSubmitting(true)
    setError('')

    try {
      await createTeamRequest(organizationId, {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || undefined,
      })
      onCreated?.()
      onClose?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team')
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
        aria-label="Close create team modal"
        onClick={handleClose}
        className={`absolute inset-0 bg-black/30 icon backdrop-blur-sm ${
          isClosing ? 'login-modal-backdrop-exit' : 'login-modal-backdrop-enter'
        }`}
      />

      <FormFieldProvider rounded="rounded-xl">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-team-title"
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
            icon={PiUsersThree}
            title="Create team"
            description="Add a team under this business, then invite members."
            className="pr-8"
          />

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <FieldLabel>
              <IconInput
                icon={PiUsersThree}
                required
                value={form.name}
                onChange={(event) => {
                  const name = event.target.value
                  setForm((prev) => ({
                    ...prev,
                    name,
                    slug: prev.slugTouched ? prev.slug : slugify(name),
                  }))
                }}
                placeholder="Team name"
                aria-label="Team name"
              />
            </FieldLabel>

            <FieldLabel>
              <IconInput
                icon={PiLinkSimple}
                required
                value={form.slug}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    slug: slugify(event.target.value),
                    slugTouched: true,
                  }))
                }
                placeholder="slug"
                aria-label="Team slug"
              />
            </FieldLabel>

            <FieldLabel>
              <DescriptionField
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Optional description"
                aria-label="Team description"
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
                {isSubmitting ? 'Creating...' : 'Create team'}
              </Button>
            </div>
          </form>
        </div>
      </FormFieldProvider>
    </div>,
    document.body,
  )
}
