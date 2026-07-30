import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { PiMagnifyingGlass, PiSlidersHorizontal, PiX } from 'react-icons/pi'
import { useModalAnimation, useModalBodyLock } from '@multi-tenants/hooks'
import { cn } from '@multi-tenants/utils'
import Button from '../button.jsx'
import Dropdown from '../dropdown.jsx'
import Input from '../input.jsx'

export const marketplaceFilterInputClass =
  'marketplace-filter-input h-11 w-full border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none transition focus:border-zinc-900'

export const marketplaceDropdownTriggerClass =
  'marketplace-filter-dropdown h-11 w-full rounded-none border-zinc-200 bg-white px-3 font-normal text-zinc-800 shadow-none hover:bg-zinc-50 data-[state=open]:border-zinc-900'

export const marketplaceDropdownContentClass = 'rounded-none z-[220]'

export function MarketplaceFilterDropdown({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  disabled = false,
}) {
  return (
    <Dropdown
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      triggerClassName={marketplaceDropdownTriggerClass}
      contentClassName={marketplaceDropdownContentClass}
    />
  )
}

export function MarketplaceFilterLabel({ label, children }) {
  return (
    <label className="block text-xs font-semibold tracking-wide text-zinc-500 uppercase">
      {label}
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

export function MarketplaceFiltersModal({
  isOpen,
  onClose,
  onApply,
  onClear,
  title = 'Filters',
  description = 'Refine results — changes apply when you confirm.',
  children,
}) {
  const { shouldRender, isClosing } = useModalAnimation(isOpen)

  const handleClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  useModalBodyLock(shouldRender, handleClose)

  if (!shouldRender) return null

  return createPortal(
    <div className="marketplace-display fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close filters"
        onClick={handleClose}
        className={cn(
          'absolute inset-0 bg-black/40 backdrop-blur-sm',
          isClosing ? 'login-modal-backdrop-exit' : 'login-modal-backdrop-enter',
        )}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="marketplace-filters-title"
        className={cn(
          'relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col border border-zinc-200 bg-white shadow-2xl',
          isClosing ? 'login-modal-panel-exit' : 'login-modal-panel-enter',
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-zinc-100 px-6 py-5">
          <div className="min-w-0">
            <h2
              id="marketplace-filters-title"
              className="text-lg font-semibold text-zinc-900"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-zinc-500">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="inline-flex size-9 shrink-0 items-center justify-center text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-800"
          >
            <PiX className=" size-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="grid gap-4">{children}</div>
        </div>

        <footer className="flex shrink-0 gap-3 border-t icon border-zinc-100 px-6 py-4">
          <Button
            type="button"
            variant="outlined"
            onClick={onClear}
            className="marketplace-filter-btn flex-1 px-4"
          >
            Clear
          </Button>
          <Button
            type="button"
            onClick={onApply}
            className="marketplace-filter-btn flex-1 px-4"
          >
            Apply filters
          </Button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}

export function MarketplaceSearchBar({
  query,
  onQueryChange,
  onSubmit,
  placeholder,
  onOpenFilters,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 border-b icon border-zinc-200 pb-6 sm:flex-row sm:items-center justify-between"
    >
      <div className="relative flex-1 max-w-[400px]">
        <PiMagnifyingGlass className=" pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-zinc-400" />
        <Input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={placeholder}
          className="marketplace-filter-input h-12 w-full border border-zinc-200 bg-zinc-50 pr-4 pl-11 text-sm text-zinc-800 outline-none transition focus:border-zinc-900 focus:bg-white"
        />
      </div>
     <div className="flex gap-2">
     <button
        type="button"
        aria-label="Open filters"
        title="Filters"
        onClick={onOpenFilters}
        className="marketplace-filter-btn inline-flex size-12 shrink-0 items-center justify-center border border-zinc-200 bg-white text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
      >
        <PiSlidersHorizontal className=" size-5" />
      </button>
      <Button
        type="submit"
        className="marketplace-filter-btn h-12 w-full px-8 font-semibold sm:w-auto"
      >
        Search
      </Button> 
     </div>
    </form>
  )
}

/** Sync draft filters when modal opens; apply on confirm. */
export function useFiltersModal(appliedFilters, defaultFilters) {
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState(appliedFilters)

  useEffect(() => {
    if (isOpen) setDraft(appliedFilters)
  }, [isOpen, appliedFilters])

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    draft,
    setDraft,
    resetDraft: () => setDraft(defaultFilters),
  }
}
