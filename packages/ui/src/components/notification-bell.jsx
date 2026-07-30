import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PiBell, PiCheck } from 'react-icons/pi'
import {
  listNotificationsRequest,
  markAllNotificationsReadRequest,
  markNotificationReadRequest,
} from '@multi-tenants/api'
import { useAuth } from '@multi-tenants/auth'
import { cn } from '@multi-tenants/utils'

function formatTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function NotificationBell() {
  const { isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const unread = items.filter((item) => !item.isRead).length

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([])
      return
    }
    setLoading(true)
    try {
      const rows = await listNotificationsRequest()
      setItems(Array.isArray(rows) ? rows : [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    void load()
    if (!isAuthenticated) return undefined
    const timer = window.setInterval(() => void load(), 30000)
    return () => window.clearInterval(timer)
  }, [isAuthenticated, load])

  if (!isAuthenticated) return null

  async function handleOpen() {
    setOpen((prev) => !prev)
    if (!open) await load()
  }

  async function handleRead(id) {
    try {
      await markNotificationReadRequest(id)
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isRead: true } : item,
        ),
      )
    } catch {
      // ignore
    }
  }

  async function handleReadAll() {
    try {
      await markAllNotificationsReadRequest()
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })))
    } catch {
      // ignore
    }
  }

  return (
    <div className="relative normal-case">
      <button
        type="button"
        aria-label="Notifications"
        title="Notifications"
        onClick={() => void handleOpen()}
        className="relative inline-flex size-9 items-center justify-center normal-case text-zinc-700 transition-colors hover:text-primary"
      >
        <PiBell className="icon size-5" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="normal-case absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
              <p className="text-sm font-semibold text-zinc-900">
                Notifications
              </p>
              {unread > 0 ? (
                <button
                  type="button"
                  onClick={() => void handleReadAll()}
                  className="inline-flex items-center gap-1 normal-case text-xs font-medium text-primary hover:underline"
                >
                  <PiCheck className="icon size-3.5" />
                  Mark all read
                </button>
              ) : null}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <p className="px-4 py-8 text-center text-sm text-zinc-500">
                  Loading...
                </p>
              ) : items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-zinc-500">
                  No notifications yet
                </p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'border-b border-zinc-100 px-4 py-3 last:border-0',
                      !item.isRead && 'bg-emerald-50/40',
                    )}
                  >
                    {item.link ? (
                      <Link
                        to={item.link}
                        onClick={() => {
                          void handleRead(item.id)
                          setOpen(false)
                        }}
                        className="block normal-case"
                      >
                        <p className="text-sm font-semibold text-zinc-900 normal-case">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600 normal-case">
                          {item.message}
                        </p>
                        <p className="mt-1 text-[11px] text-zinc-400">
                          {formatTime(item.createdAt)}
                        </p>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="w-full text-left normal-case"
                        onClick={() => void handleRead(item.id)}
                      >
                        <p className="text-sm font-semibold text-zinc-900">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                          {item.message}
                        </p>
                        <p className="mt-1 text-[11px] text-zinc-400">
                          {formatTime(item.createdAt)}
                        </p>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
