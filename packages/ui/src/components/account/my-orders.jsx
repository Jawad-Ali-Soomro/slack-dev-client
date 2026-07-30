import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PiCheckCircle,
  PiClock,
  PiPackage,
  PiShoppingBag,
  PiXCircle,
} from 'react-icons/pi'
import { listMyOrdersRequest } from '@multi-tenants/api'
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
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function statusMeta(status) {
  switch (status) {
    case 'confirmed':
      return { tone: 'emerald', icon: PiCheckCircle, label: 'Confirmed' }
    case 'delivered':
      return { tone: 'sky', icon: PiPackage, label: 'Delivered' }
    case 'cancelled':
      return { tone: 'rose', icon: PiXCircle, label: 'Cancelled' }
    case 'pending':
    default:
      return { tone: 'amber', icon: PiClock, label: 'Pending' }
  }
}

function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-zinc-100 text-zinc-700 ring-zinc-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
    amber: 'bg-amber-50 text-amber-800 ring-amber-200/80',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200/80',
    sky: 'bg-sky-50 text-sky-700 ring-sky-200/80',
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

export default function MyOrders({ embedded = false }) {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const data = await listMyOrdersRequest()
        if (!cancelled) setOrders(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!cancelled) {
          setOrders([])
          setError(err instanceof Error ? err.message : 'Failed to load orders')
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
    return <Loading message="Loading orders..." />
  }

  return (
    <section className={embedded ? '' : 'mt-10'}>
      {!embedded ? (
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
            Your orders
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Track shop purchases from the marketplace.
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {!error && orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 px-6 py-12 text-center">
          <PiShoppingBag className="icon mx-auto size-10 text-zinc-300" />
          <p className="mt-3 text-sm font-medium text-zinc-700">No orders yet</p>
          <p className="mt-1 text-sm text-zinc-500">
            When you checkout from your cart, your orders will appear here.
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
          >
            Browse shop
          </Link>
        </div>
      ) : null}

      <div className="space-y-3">
        {orders.map((order) => {
          const meta = statusMeta(order.status)
          const StatusIcon = meta.icon

          return (
            <article
              key={order.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-900">
                    {order.organizationName || 'Shop order'}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Placed {formatDate(order.createdAt)} ·{' '}
                    {order.items?.length ?? 0} item
                    {(order.items?.length ?? 0) === 1 ? '' : 's'}
                  </p>
                </div>
                <Badge tone={meta.tone}>
                  <StatusIcon className="icon size-3.5" />
                  {meta.label}
                </Badge>
              </div>

              <ul className="mt-4 space-y-2 border-t border-zinc-100 pt-4">
                {(order.items ?? []).map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 text-sm"
                  >
                    <span className="text-zinc-700">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="font-medium text-zinc-900">
                      {formatPrice(item.lineTotal)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-4 text-sm">
                <p className="font-semibold text-zinc-900">
                  Total {formatPrice(order.totalPrice)}
                </p>
                {order.items?.[0]?.productId ? (
                  <Link
                    to={`/products/${order.items[0].productId}`}
                    className="font-medium text-primary hover:underline"
                  >
                    View product
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
