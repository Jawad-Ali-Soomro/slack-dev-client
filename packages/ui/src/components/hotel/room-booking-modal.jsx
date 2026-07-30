import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  PiBed,
  PiBookmarkSimple,
  PiCalendarCheck,
  PiCheckCircle,
  PiX,
} from 'react-icons/pi'
import {
  useModalAnimation,
  useModalBodyLock,
} from '@multi-tenants/hooks'
import {
  createPublicBookingRequest,
  getHotelAvailabilityRequest,
} from '@multi-tenants/api'
import { useAuth, useLoginModal, useUser } from '@multi-tenants/auth'
import {
  getProductCategoriesForBusiness,
  LODGING_BATHROOM_OPTIONS,
  LODGING_CLIMATE_OPTIONS,
  formatLodgingAttributeLabel,
} from '@multi-tenants/constants'
import { cn } from '@multi-tenants/utils'
import Button from '../button.jsx'
import Checkbox from '../checkbox.jsx'
import { Dropdown } from '../dropdown.jsx'
import Input from '../input.jsx'
import {
  FieldLabel,
  FormFieldProvider,
  SectionTitle,
} from '../../contexts/form-field-context.jsx'

const ANY = 'any'

const dropdownTriggerClass =
  'mt-1.5 h-11 w-full justify-between rounded-xl border-gray-200 px-3 text-sm font-normal shadow-none'

function formatPrice(price) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(Number(price) || 0)
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function addDaysISO(iso, days) {
  const date = new Date(`${iso}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function formatDateRange(checkIn, checkOut) {
  const fmt = (value) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }
  return `${fmt(checkIn)} → ${fmt(checkOut)}`
}

export default function RoomBookingDialog({
  isOpen,
  onClose,
  organizationId,
  organizationSlug,
  organizationName,
  businessType,
}) {
  const { isAuthenticated } = useAuth()
  const { user } = useUser()
  const { openLoginModal } = useLoginModal()
  const { shouldRender, isClosing } = useModalAnimation(isOpen)

  const orgKey = organizationSlug || organizationId

  const roomTypeOptions = useMemo(() => {
    const categories = getProductCategoriesForBusiness(businessType).filter(
      (name) => name !== 'Other',
    )
    const types = categories.length
      ? categories
      : [
          'Single Bedroom',
          'Double Bedroom',
          'Suite',
          'Family Room',
          'Shared Room',
        ]
    return [
      { value: ANY, label: 'Any category' },
      ...types.map((type) => ({ value: type, label: type })),
    ]
  }, [businessType])

  const climateOptions = useMemo(
    () => [
      { value: ANY, label: 'Any climate' },
      ...LODGING_CLIMATE_OPTIONS.map((item) => ({
        value: item.value,
        label: item.label,
      })),
    ],
    [],
  )

  const bathroomOptions = useMemo(
    () => [
      { value: ANY, label: 'Any bathroom' },
      ...LODGING_BATHROOM_OPTIONS.map((item) => ({
        value: item.value,
        label: item.label,
      })),
    ],
    [],
  )

  const [checkIn, setCheckIn] = useState(todayISO())
  const [checkOut, setCheckOut] = useState(addDaysISO(todayISO(), 2))
  const [availability, setAvailability] = useState(null)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [selectedRoomIds, setSelectedRoomIds] = useState(() => new Set())
  const [guestPhone, setGuestPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState(null)
  const [filterRoomType, setFilterRoomType] = useState(ANY)
  const [filterClimate, setFilterClimate] = useState(ANY)
  const [filterBathroom, setFilterBathroom] = useState(ANY)

  const handleClose = useCallback(() => {
    if (busy) return
    onClose?.()
  }, [busy, onClose])

  useModalBodyLock(shouldRender, handleClose)

  useEffect(() => {
    if (!isOpen) {
      setBooking(null)
      setError('')
      setSelectedRoomIds(new Set())
      setGuestPhone('')
      setFilterRoomType(ANY)
      setFilterClimate(ANY)
      setFilterBathroom(ANY)
      setCheckIn(todayISO())
      setCheckOut(addDaysISO(todayISO(), 2))
      setAvailability(null)
    }
  }, [isOpen])

  const loadAvailability = useCallback(async () => {
    if (!orgKey || !checkIn || !checkOut) return
    setLoadingAvailability(true)
    setError('')
    try {
      const data = await getHotelAvailabilityRequest(orgKey, checkIn, checkOut)
      setAvailability(data)
      setSelectedRoomIds((prev) => {
        const availableIds = new Set(
          (data?.rooms ?? [])
            .filter((room) => !room.reserved)
            .map((room) => room.id),
        )
        return new Set([...prev].filter((id) => availableIds.has(id)))
      })
    } catch (err) {
      setAvailability(null)
      setError(
        err instanceof Error ? err.message : 'Failed to load availability',
      )
    } finally {
      setLoadingAvailability(false)
    }
  }, [orgKey, checkIn, checkOut])

  useEffect(() => {
    if (!isOpen || !orgKey) return
    void loadAvailability()
  }, [isOpen, orgKey, loadAvailability])

  const rooms = useMemo(() => {
    const all = availability?.rooms ?? []
    return all.filter((room) => {
      if (
        filterRoomType !== ANY &&
        room.roomType?.trim().toLowerCase() !== filterRoomType.toLowerCase()
      ) {
        return false
      }
      if (
        filterClimate !== ANY &&
        (room.climate || 'ac').toLowerCase() !== filterClimate.toLowerCase()
      ) {
        return false
      }
      if (
        filterBathroom !== ANY &&
        (room.bathroom || 'private').toLowerCase() !==
          filterBathroom.toLowerCase()
      ) {
        return false
      }
      return true
    })
  }, [availability, filterRoomType, filterClimate, filterBathroom])

  const selectedRooms = useMemo(
    () =>
      rooms.filter((room) => selectedRoomIds.has(room.id) && !room.reserved),
    [rooms, selectedRoomIds],
  )

  const nights = availability?.nights ?? 0
  const total = selectedRooms.reduce(
    (sum, room) => sum + Number(room.price || 0) * nights,
    0,
  )

  const hasActiveFilters =
    filterRoomType !== ANY ||
    filterClimate !== ANY ||
    filterBathroom !== ANY

  function toggleRoom(room) {
    if (room.reserved) return
    if (!isAuthenticated) {
      openLoginModal({ stayOnPage: true })
      return
    }
    setSelectedRoomIds((prev) => {
      const next = new Set(prev)
      if (next.has(room.id)) next.delete(room.id)
      else next.add(room.id)
      return next
    })
  }

  async function submitReservation() {
    if (!orgKey || selectedRoomIds.size === 0) return
    setBusy(true)
    setError('')
    try {
      const result = await createPublicBookingRequest(orgKey, {
        checkIn,
        checkOut,
        roomIds: [...selectedRoomIds],
        guestPhone: guestPhone.trim() || undefined,
      })
      setBooking(result)
      setSelectedRoomIds(new Set())
      await loadAvailability()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reservation failed')
    } finally {
      setBusy(false)
    }
  }

  function handleReserve(event) {
    event.preventDefault()
    if (selectedRoomIds.size === 0) return

    if (!isAuthenticated) {
      openLoginModal({
        stayOnPage: true,
        onSuccess: async () => {
          await submitReservation()
        },
      })
      return
    }

    void submitReservation()
  }

  if (!shouldRender) return null

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close room booking"
        onClick={handleClose}
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm ${
          isClosing ? 'login-modal-backdrop-exit' : 'login-modal-backdrop-enter'
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-booking-title"
        className={`relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl ${
          isClosing ? 'login-modal-panel-exit' : 'login-modal-panel-enter'
        }`}
      >
        <button
          type="button"
          onClick={handleClose}
          disabled={busy}
          aria-label="Close"
          className="absolute right-5 top-5 z-10 text-gray-400 transition hover:scale-110 hover:text-black"
        >
          <PiX className="icon text-xl" />
        </button>

        <FormFieldProvider
          rounded="rounded-xl"
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-8">
            <div className="space-y-5">
              <SectionTitle
                icon={PiBed}
                title="Select rooms"
                description={
                  organizationName
                    ? `Reserve rooms at ${organizationName}`
                    : 'Pick preferences, dates, and available rooms'
                }
              />

              {booking ? (
                <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left">
                  <PiCheckCircle className="icon mt-0.5 size-6 shrink-0 text-amber-600" />
                  <div className="min-w-0 space-y-1">
                    <p
                      id="room-booking-title"
                      className="font-semibold text-amber-950"
                    >
                      Reservation requested
                    </p>
                    <p className="text-sm text-amber-900/80">
                      Thanks {booking.guestName}. Your request is pending owner
                      approval. Selected rooms are now marked reserved. Check
                      your profile for status updates.
                    </p>
                    <p className="text-sm font-medium text-amber-950">
                      {formatDateRange(booking.checkIn, booking.checkOut)} ·
                      Rooms{' '}
                      {(booking.rooms ?? [])
                        .map((br) => br.room?.number)
                        .filter(Boolean)
                        .join(', ')}{' '}
                      · {formatPrice(booking.totalPrice)}
                    </p>
                  </div>
                </div>
              ) : null}

              {error ? (
                <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <div className="space-y-3 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-zinc-900">
                    Room preferences
                  </p>
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={() => {
                        setFilterRoomType(ANY)
                        setFilterClimate(ANY)
                        setFilterBathroom(ANY)
                      }}
                      className="text-xs font-medium text-zinc-500 hover:text-primary"
                    >
                      Reset filters
                    </button>
                  ) : null}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="min-w-0">
                    <FieldLabel>Category</FieldLabel>
                    <Dropdown
                      value={filterRoomType}
                      onChange={setFilterRoomType}
                      options={roomTypeOptions}
                      triggerClassName={dropdownTriggerClass}
                      contentClassName="z-[140] max-h-60 overflow-y-auto"
                    />
                  </div>
                  <div className="min-w-0">
                    <FieldLabel>Climate</FieldLabel>
                    <Dropdown
                      value={filterClimate}
                      onChange={setFilterClimate}
                      options={climateOptions}
                      triggerClassName={dropdownTriggerClass}
                      contentClassName="z-[140] max-h-60 overflow-y-auto"
                    />
                  </div>
                  <div className="min-w-0">
                    <FieldLabel>Bathroom</FieldLabel>
                    <Dropdown
                      value={filterBathroom}
                      onChange={setFilterBathroom}
                      options={bathroomOptions}
                      triggerClassName={dropdownTriggerClass}
                      contentClassName="z-[140] max-h-60 overflow-y-auto"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <FieldLabel>Check-in</FieldLabel>
                  <Input
                    type="date"
                    value={checkIn}
                    min={todayISO()}
                    onChange={(e) => {
                      setCheckIn(e.target.value)
                      if (e.target.value >= checkOut) {
                        setCheckOut(addDaysISO(e.target.value, 1))
                      }
                    }}
                    className="mt-1.5 h-11"
                  />
                </div>
                <div>
                  <FieldLabel>Check-out</FieldLabel>
                  <Input
                    type="date"
                    value={checkOut}
                    min={addDaysISO(checkIn, 1)}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="mt-1.5 h-11"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="outlined"
                onClick={() => void loadAvailability()}
                disabled={loadingAvailability}
                className="h-10 w-full"
              >
                {loadingAvailability ? 'Checking...' : 'Refresh availability'}
              </Button>

              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-zinc-900">
                    Rooms
                    {nights
                      ? ` · ${nights} night${nights === 1 ? '' : 's'}`
                      : ''}
                    {rooms.length ? ` · ${rooms.length} shown` : ''}
                  </p>
                  {selectedRoomIds.size > 0 ? (
                    <button
                      type="button"
                      onClick={() => setSelectedRoomIds(new Set())}
                      className="text-xs font-medium text-zinc-500 hover:text-primary"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>

                {loadingAvailability ? (
                  <p className="py-8 text-center text-sm text-zinc-500">
                    Loading rooms...
                  </p>
                ) : rooms.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-zinc-200 px-4 py-10 text-center">
                    <PiBed className="icon mx-auto size-8 text-zinc-300" />
                    <p className="mt-2 text-sm text-zinc-600">
                      {hasActiveFilters
                        ? 'No rooms match these preferences. Try different filters.'
                        : 'No rooms for these dates.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {rooms.map((room) => {
                      const reserved = Boolean(room.reserved)
                      const selected =
                        !reserved && selectedRoomIds.has(room.id)
                      const climateLabel =
                        formatLodgingAttributeLabel(
                          'climate',
                          room.climate || 'ac',
                        ) || 'AC'
                      const bathroomLabel =
                        formatLodgingAttributeLabel(
                          'bathroom',
                          room.bathroom || 'private',
                        ) || 'Private bathroom'

                      return (
                        <button
                          key={room.id}
                          type="button"
                          disabled={reserved || busy}
                          onClick={() => toggleRoom(room)}
                          aria-pressed={selected}
                          className={cn(
                            'relative flex min-h-[8.5rem] flex-col rounded-2xl border-2 p-4 text-left transition',
                            reserved
                              ? 'cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-90'
                              : selected
                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                : 'border-zinc-200 bg-white hover:border-primary/40',
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <Checkbox
                              checked={selected}
                              disabled={reserved || busy}
                              onCheckedChange={() => toggleRoom(room)}
                              aria-label={
                                reserved
                                  ? `Room ${room.number} reserved`
                                  : `Select room ${room.number}`
                              }
                              className="pointer-events-none size-7 rounded-md"
                            />
                            {reserved ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-700">
                                <PiBookmarkSimple className="icon size-3.5" />
                                Reserved
                              </span>
                            ) : (
                              <p className="shrink-0 text-sm font-semibold text-primary">
                                {formatPrice(room.price)}
                                <span className="text-xs font-normal text-zinc-500">
                                  /night
                                </span>
                              </p>
                            )}
                          </div>

                          <div className="mt-3 grow">
                            <p className="text-lg font-semibold tracking-tight text-zinc-900">
                              Room {room.number}
                              {room.label ? (
                                <span className="font-normal text-zinc-500">
                                  {' '}
                                  · {room.label}
                                </span>
                              ) : null}
                            </p>
                            <p className="mt-1 text-sm text-zinc-500">
                              {room.roomType} · {climateLabel} · {bathroomLabel}
                            </p>
                            <p className="mt-0.5 text-xs text-zinc-400">
                              Floor {room.floor?.name || room.floor?.level} ·{' '}
                              {room.capacity} guests
                            </p>
                          </div>

                          {reserved ? (
                            <p className="mt-3 text-xs font-medium text-zinc-500">
                              Not available for these dates
                            </p>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {selectedRooms.length > 0 ? (
                <form
                  onSubmit={handleReserve}
                  className="space-y-3 border-t border-zinc-100 pt-4"
                >
                  <p className="text-sm font-semibold text-zinc-900">
                    {selectedRooms.length} room
                    {selectedRooms.length === 1 ? '' : 's'} ·{' '}
                    {formatPrice(total)} total
                  </p>
                  {isAuthenticated ? (
                    <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
                      Reserving as{' '}
                      <span className="font-medium text-zinc-900">
                        {user?.username || user?.email}
                      </span>
                    </p>
                  ) : (
                    <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      Log in to reserve. You will be prompted when you continue.
                    </p>
                  )}
                  <div>
                    <FieldLabel>Phone (optional)</FieldLabel>
                    <Input
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="mt-1.5 h-11"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={busy}
                    className="h-12 w-full gap-2 font-semibold"
                  >
                    <PiCalendarCheck className="icon size-4" />
                    {busy
                      ? 'Submitting...'
                      : isAuthenticated
                        ? 'Reserve selected rooms'
                        : 'Log in to reserve'}
                  </Button>
                </form>
              ) : booking ? (
                <Button
                  type="button"
                  onClick={handleClose}
                  className="h-11 w-full"
                >
                  Done
                </Button>
              ) : null}
            </div>
          </div>
        </FormFieldProvider>
      </div>
    </div>,
    document.body,
  )
}
