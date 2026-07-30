import { useCallback } from 'react'
import { createPortal } from 'react-dom'
import { PiWarning, PiX } from 'react-icons/pi'
import {
  useModalAnimation,
  useModalBodyLock,
} from '@multi-tenants/hooks'
import Button from './button.jsx'
import { SectionTitle } from '../contexts/form-field-context.jsx'

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isConfirming = false,
  tone = 'danger',
}) {
  const { shouldRender, isClosing } = useModalAnimation(isOpen)

  const handleClose = useCallback(() => {
    if (isConfirming) return
    onClose?.()
  }, [isConfirming, onClose])

  useModalBodyLock(shouldRender, handleClose)

  if (!shouldRender) {
    return null
  }

  return createPortal(
    <div className="fixed icon inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close confirmation"
        onClick={handleClose}
        className={`absolute inset-0 bg-black/30 icon backdrop-blur-sm ${
          isClosing ? 'login-modal-backdrop-exit' : 'login-modal-backdrop-enter'
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
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
          icon={PiWarning}
          title={title}
          description={description}
          className="pr-8"
        />

        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="outlined"
            onClick={handleClose}
            disabled={isConfirming}
            className="flex-1 px-4"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm?.()}
            disabled={isConfirming}
            className={
              tone === 'danger'
                ? 'flex-1 bg-rose-600 px-4 hover:bg-rose-700'
                : 'flex-1 px-4'
            }
          >
            {isConfirming ? 'Working...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
