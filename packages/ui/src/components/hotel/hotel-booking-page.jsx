import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  PiArrowLeft,
  PiBed,
  PiCalendarCheck,
  PiCheckCircle,
  PiMapPin,
  PiPackage,
} from 'react-icons/pi'
import {
  createPublicBookingRequest,
  getHotelAvailabilityRequest,
  getPublicHotelRequest,
} from '@multi-tenants/api'
import { useAuth, useLoginModal, useUser } from '@multi-tenants/auth'
import { formatBusinessTypeLabel } from '@multi-tenants/constants'
import { getAssetUrl } from '@multi-tenants/config'
import { cn } from '@multi-tenants/utils'
import Button from '../button.jsx'
import Input from '../input.jsx'
import Loading from '../loading.jsx'
import {
  FormFieldProvider,
  FieldLabel,
} from '../../contexts/form-field-context.jsx'

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

export default function HotelBookingPage() {
  const { orgIdOrSlug } = useParams()
  const [searchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()
  const { user } = useUser()
  const { openLoginModal } = useLoginModal()
  const [hotel, setHotel] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [checkIn, setCheckIn] = useState(() => {
    const fromQuery = searchParams.get('checkIn')
    return fromQuery && fromQuery >= todayISO() ? fromQuery : todayISO()
  })
  const [checkOut, setCheckOut] = useState(() => {
    const fromQuery = searchParams.get('checkOut')
    const checkInValue = searchParams.get('checkIn')
    const baseIn =
      checkInValue && checkInValue >= todayISO() ? checkInValue : todayISO()
    if (fromQuery && fromQuery > baseIn) return fromQuery
    return addDaysISO(baseIn, 2)
  })
  const [availability, setAvailability] = useState(null)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [selectedRoomIds, setSelectedRoomIds] = useState(() => new Set())
  const [guestPhone, setGuestPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [booking, setBooking] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!orgIdOrSlug) return
      setIsLoading(true)
      setError('')
      setBooking(null)
      try {
        const data = await getPublicHotelRequest(orgIdOrSlug)
        if (!cancelled) setHotel(data)
      } catch (err) {
        if (!cancelled) {
          setHotel(null)
          setError(err instanceof Error ? err.message : 'Hotel not found')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [orgIdOrSlug])

  const loadAvailability = useCallback(async () => {
    if (!orgIdOrSlug || !checkIn || !checkOut) return
    setLoadingAvailability(true)
    setError('')
    try {
      const data = await getHotelAvailabilityRequest(
        orgIdOrSlug,
        checkIn,
        checkOut,
      )
      setAvailability(data)
      setSelectedRoomIds(new Set())
    } catch (err) {
      setAvailability(null)
      setError(
        err instanceof Error ? err.message : 'Failed to load availability',
      )
    } finally {
      setLoadingAvailability(false)
    }
  }, [orgIdOrSlug, checkIn, checkOut])

  useEffect(() => {
    if (!hotel) return
    void loadAvailability()
  }, [hotel, loadAvailability])

  function toggleRoom(roomId) {
    if (!isAuthenticated) {
      openLoginModal({ stayOnPage: true })
      return
    }
    setSelectedRoomIds((prev) => {
      const next = new Set(prev)
      if (next.has(roomId)) next.delete(roomId)
      else next.add(roomId)
      return next
    })
  }

  const selectedRooms = useMemo(() => {
    const rooms = availability?.rooms ?? []
    return rooms.filter((room) => selectedRoomIds.has(room.id))
  }, [availability, selectedRoomIds])

  const nights = availability?.nights ?? 0
  const total = selectedRooms.reduce(
    (sum, room) => sum + Number(room.price || 0) * nights,
    0,
  )

  async function submitReservation() {
    if (!orgIdOrSlug || selectedRoomIds.size === 0) return
    setBusy(true)
    setError('')
    try {
      const result = await createPublicBookingRequest(orgIdOrSlug, {
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

  function handleReserveClick(event) {
    event.preventDefault()
    if (!orgIdOrSlug || selectedRoomIds.size === 0) return

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

  if (isLoading) {
    return <Loading message="Loading hotel..." />
  }

  if (!hotel) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-24 text-center">
        <PiPackage className="icon mx-auto size-12 text-zinc-300" />
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900">
          Hotel not found
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          {error || 'This property may be unavailable.'}
        </p>
        <Link to="/" className="mt-6 inline-flex">
          <Button className="gap-2 px-5">
            <PiArrowLeft className="icon size-4" />
            Back
          </Button>
        </Link>
      </div>
    )
  }

  const location = [hotel.city, hotel.country].filter(Boolean).join(', ')
  const cover = hotel.logo?.url
    ? getAssetUrl(hotel.logo.url)
    : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80'

  if (booking) {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 pb-20 pt-28">
        <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-8 text-center">
          <PiCheckCircle className="icon mx-auto size-14 text-amber-600" />
          <h1 className="mt-4 text-2xl font-bold text-zinc-900">
            Reservation requested
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Thanks {booking.guestName}. Your request at {hotel.name} is pending
            owner approval. You will be notified when it is confirmed or
            cancelled.
          </p>
          <div className="mt-6 space-y-2 text-sm text-zinc-700">
            <p>
              {formatDateRange(booking.checkIn, booking.checkOut)} ·{' '}
              {booking.nights ?? nights} night
              {(booking.nights ?? nights) === 1 ? '' : 's'}
            </p>
            <p>
              Rooms:{' '}
              {(booking.rooms ?? [])
                .map((br) => br.room?.number)
                .filter(Boolean)
                .join(', ')}
            </p>
            <p className="text-lg font-semibold text-amber-700">
              {formatPrice(booking.totalPrice)}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              type="button"
              variant="outlined"
              onClick={() => setBooking(null)}
              className="h-11 px-5"
            >
              Reserve more rooms
            </Button>
            <Link
              to={`/organization/${hotel.businessType || 'hotel-management'}`}
              className="inline-flex"
            >
              <Button className="h-11 px-5">Back to hotels</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <FormFieldProvider rounded="rounded-xl">
      <div className="mx-auto w-full max-w-7xl px-6 pb-20 pt-28">
        <Link
          to={`/organization/${hotel.businessType || 'hotel-management'}`}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-primary"
        >
          <PiArrowLeft className="icon size-4" />
          All {formatBusinessTypeLabel(hotel.businessType).toLowerCase()}
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="aspect-[16/10] overflow-hidden rounded-3xl bg-zinc-100">
              <img
                src={cover}
                alt={hotel.name}
                className="h-full w-full object-cover"
              />
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900">
              {hotel.name}
            </h1>
            {location ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-zinc-500">
                <PiMapPin className="icon size-4" />
                {location}
              </p>
            ) : null}
            {hotel.description ? (
              <p className="mt-4 text-sm leading-7 text-zinc-600">
                {hotel.description}
              </p>
            ) : null}
            <p className="mt-4 text-sm text-zinc-500">
              {hotel.openRoomCount ?? 0} open rooms · {hotel.floorCount ?? 0}{' '}
              floors
            </p>
          </div>

          <div className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              Select dates
            </h2>
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
              className="h-11 w-full"
            >
              {loadingAvailability ? 'Checking...' : 'Refresh availability'}
            </Button>

            {error ? (
              <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-zinc-900">
                  Available rooms
                  {nights ? ` · ${nights} night${nights === 1 ? '' : 's'}` : ''}
                </h3>
                {selectedRoomIds.size > 0 ? (
                  <button
                    type="button"
                    onClick={() => setSelectedRoomIds(new Set())}
                    className="text-xs font-medium text-zinc-500 hover:text-primary"
                  >
                    Clear selection
                  </button>
                ) : null}
              </div>

              {loadingAvailability ? (
                <p className="text-sm text-zinc-500">Loading rooms...</p>
              ) : (availability?.rooms ?? []).length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-200 px-4 py-10 text-center">
                  <PiBed className="icon mx-auto size-8 text-zinc-300" />
                  <p className="mt-2 text-sm text-zinc-600">
                    No rooms available for these dates.
                  </p>
                </div>
              ) : (
                <div className="grid max-h-[22rem] gap-2 overflow-y-auto pr-1">
                  {(availability?.rooms ?? []).map((room) => {
                    const selected = selectedRoomIds.has(room.id)
                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => toggleRoom(room.id)}
                        className={cn(
                          'rounded-xl border p-3 text-left transition',
                          selected
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/25'
                            : 'border-zinc-200 hover:border-primary/40',
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-zinc-900">
                              Room {room.number}
                              {room.label ? ` · ${room.label}` : ''}
                            </p>
                            <p className="mt-0.5 text-xs text-zinc-500">
                              {room.roomType} · Floor{' '}
                              {room.floor?.name || room.floor?.level} ·{' '}
                              {room.capacity} guests
                            </p>
                          </div>
                          <p className="shrink-0 text-sm font-semibold text-primary">
                            {formatPrice(room.price)}
                            <span className="text-xs font-normal text-zinc-500">
                              /night
                            </span>
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {selectedRooms.length > 0 ? (
              <form
                onSubmit={handleReserveClick}
                className="space-y-3 border-t border-zinc-100 pt-4"
              >
                <p className="text-sm font-semibold text-zinc-900">
                  {selectedRooms.length} room
                  {selectedRooms.length === 1 ? '' : 's'} · {formatPrice(total)}{' '}
                  total
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
                    Log in to reserve rooms. You will be prompted if you
                    continue.
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
            ) : null}
          </div>
        </div>
      </div>
    </FormFieldProvider>
  )
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
