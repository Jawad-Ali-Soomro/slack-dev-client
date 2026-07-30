import { useRef, useState } from 'react'
import {
  PiCalendarBlank,
  PiCamera,
  PiCheckCircle,
  PiEnvelopeSimple,
  PiUser,
  PiXCircle,
} from 'react-icons/pi'
import { uploadAvatarRequest } from '@multi-tenants/api'
import { getAssetUrl } from '@multi-tenants/config'
import { useUser } from '@multi-tenants/auth'
import { cn } from '@multi-tenants/utils'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function Avatar({ user, className = '' }) {
  const initials = (user?.username || '?')
    .slice(0, 2)
    .toUpperCase()

  if (user?.avatar?.url) {
    return (
      <img
        src={getAssetUrl(user.avatar.url)}
        alt=""
        className={cn('size-20 rounded-full object-cover ring-4 ring-white', className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex size-20 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary ring-4 ring-white',
        className,
      )}
    >
      {initials}
    </div>
  )
}

export default function UserProfileSection() {
  const { user, refreshUser } = useUser()
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError('')
    try {
      await uploadAvatarRequest(file)
      await refreshUser()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar')
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <Avatar user={user} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 flex size-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-60"
              aria-label="Change profile photo"
            >
              <PiCamera className="icon size-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-zinc-900">{user.username}</h2>
            <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/80 ring-inset">
                  <PiCheckCircle className="icon size-3.5" />
                  Verified email
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200/80 ring-inset">
                  <PiXCircle className="icon size-3.5" />
                  Email not verified
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 ring-1 ring-zinc-200/80 ring-inset">
                <PiCalendarBlank className="icon size-3.5" />
                Member since {formatDate(user.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {isUploading ? (
          <p className="mt-4 text-sm text-zinc-500">Uploading photo...</p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Account details
        </h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
              <PiUser className="icon size-3.5" />
              Username
            </dt>
            <dd className="mt-1 text-sm font-medium text-zinc-900">{user.username}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
              <PiEnvelopeSimple className="icon size-3.5" />
              Email
            </dt>
            <dd className="mt-1 text-sm font-medium text-zinc-900">{user.email}</dd>
          </div>
        </dl>
      </div>

      {Array.isArray(user.sessions) && user.sessions.length > 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Active sessions
          </h3>
          <ul className="mt-4 divide-y divide-zinc-100">
            {user.sessions.map((session) => (
              <li key={session.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <p className="font-medium text-zinc-900">
                    {[session.browser, session.operatingSystem]
                      .filter(Boolean)
                      .join(' on ') || 'Current device'}
                  </p>
                  <p className="text-zinc-500">
                    {[session.deviceType, session.ipAddress]
                      .filter(Boolean)
                      .join(' · ') || 'Active session'}
                  </p>
                </div>
                <p className="text-xs text-zinc-500">
                  Last used {formatDate(session.lastUsedAt)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
