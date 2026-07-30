import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PiBed,
  PiCalendarBlank,
  PiCheckCircle,
  PiClock,
  PiXCircle,
} from 'react-icons/pi'
import { listMyBookingsRequest } from '@multi-tenants/api'
import { cn } from '@multi-tenants/utils'
import Loading from '../loading.jsx'

function formatPrice(price) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(Number(price) || 0)
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function statusMeta(status) {
  switch (status) {
    case 'confirmed':
      return {
        tone: 'emerald',
        icon: PiCheckCircle,
        label: 'Confirmed',
        message: 'Your reservation has been done. The room is reserved for you.',
      }
    case 'cancelled':
      return {
        tone: 'rose',
        icon: PiXCircle,
        label: 'Cancelled',
        message: 'Your reservation has been cancelled.',
      }
    case 'pending':
    default:
      return {
        tone: 'amber',
        icon: PiClock,
        label: 'Pending',
        message: 'Your reservation request is waiting for owner approval.',
      }
  }
}

function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-zinc-100 text-zinc-700 ring-zinc-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
    amber: 'bg-amber-50 text-amber-800 ring-amber-200/80',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200/80',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',
        tones[tone] ?? tones.neutral,
      )}
    >
      {children}
    </span>
  )
}

export default function MyReservations({ embedded = false }) {
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const data = await listMyBookingsRequest()
        if (!cancelled) setBookings(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!cancelled) {
          setBookings([])
          setError(
            err instanceof Error ? err.message : 'Failed to load reservations',
          )
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (isLoading) {
    return <Loading message="Loading reservations..." />
  }

  return (
    <section className={embedded ? '' : 'mt-10'}>
      {!embedded ? (
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
            Your reservations
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Track whether your room requests were confirmed or cancelled.
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {!error && bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 px-6 py-12 text-center">
          <PiBed className="icon mx-auto size-10 text-zinc-300" />
          <p className="mt-3 text-sm font-medium text-zinc-700">
            No reservations yet
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            When you book a room, it will show up here with its status.
          </p>
        </div>
      ) : null}

      <div className="space-y-3">
        {bookings.map((booking) => {
          const meta = statusMeta(booking.status)
          const StatusIcon = meta.icon
          const roomNumbers = (booking.rooms ?? [])
            .map((br) => br.room?.number)
            .filter(Boolean)
            .join(', ')
          const hotelPath = booking.organizationSlug
            ? `/hotels/${booking.organizationSlug}`
            : null

          return (
            <article
              key={booking.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-900">
                    {booking.organizationName || 'Hotel stay'}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500">
                    <span className="inline-flex items-center gap-1">
                      <PiCalendarBlank className="icon size-4" />
                      {formatDate(booking.checkIn)} →{' '}
                      {formatDate(booking.checkOut)}
                    </span>
                    {roomNumbers ? <span>Rooms {roomNumbers}</span> : null}
                    {booking.nights ? (
                      <span>
                        {booking.nights} night
                        {booking.nights === 1 ? '' : 's'}
                      </span>
                    ) : null}
                  </p>
                </div>
                <Badge tone={meta.tone}>
                  <StatusIcon className="icon size-3.5" />
                  {meta.label}
                </Badge>
              </div>

              <p
                className={cn(
                  'mt-3 rounded-xl px-3 py-2 text-sm',
                  booking.status === 'confirmed' &&
                    'bg-emerald-50 text-emerald-800',
                  booking.status === 'cancelled' &&
                    'bg-rose-50 text-rose-800',
                  booking.status === 'pending' &&
                    'bg-amber-50 text-amber-900',
                  !['confirmed', 'cancelled', 'pending'].includes(
                    booking.status,
                  ) && 'bg-zinc-50 text-zinc-700',
                )}
              >
                {meta.message}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <p className="font-semibold text-zinc-900">
                  {formatPrice(booking.totalPrice)}
                </p>
                {hotelPath ? (
                  <Link
                    to={hotelPath}
                    className="font-medium text-primary hover:underline"
                  >
                    View hotel
                  </Link>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
