import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PiX } from 'react-icons/pi'
import { useAuth, useLoginModal } from '@multi-tenants/auth'
import { cn } from '@multi-tenants/utils'
import { useCartOptional } from '../contexts/cart-context.jsx'
import Button from './button.jsx'
import NotificationBell from './notification-bell.jsx'
import PortalEditorialHeader from './portal-editorial-header.jsx'

const SCROLL_THRESHOLD = 32

/** Routes that start over a dark hero — transparent header at top. */
const TRANSPARENT_TOP_ROUTES = new Set([
  '/',
  '/explore',
  '/hotels',
  '/hostels',
  '/pharmacy',
])

function useHeaderScroll() {
  const location = useLocation()
  const solidByDefault = !TRANSPARENT_TOP_ROUTES.has(location.pathname)
  const [isScrolled, setIsScrolled] = useState(solidByDefault)

  useEffect(() => {
    const update = () => {
      setIsScrolled(solidByDefault || window.scrollY > SCROLL_THRESHOLD)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [location.pathname, solidByDefault])

  return isScrolled
}

const NAV_LINKS = [
  { label: 'Explore', to: '/explore' },
  { label: 'Hotels', to: '/hotels' },
  { label: 'Hostels', to: '/hostels' },
  { label: 'Pharmacy', to: '/pharmacy' },
]

function MenuIcon({ className = '' }) {
  return (
    <span className={cn('flex flex-col gap-[5px]', className)} aria-hidden>
      <span className="block h-px w-12 bg-current" />
      <span className="block h-px w-12 bg-current" />
    </span>
  )
}

function EditorialNavDrawer({ open, onClose, isAuthenticated }) {
  const location = useLocation()

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="editorial-header fixed inset-0 z-[100]">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
      />
      <aside className="relative flex h-full w-full max-w-sm icon flex-col bg-white px-8 py-10 shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium tracking-[0.28em] text-zinc-500 uppercase">
            Menu
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-9 items-center justify-center text-zinc-900"
          >
            <PiX className="icon size-5" />
          </button>
        </div>

        <nav className="mt-12 flex flex-col gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={cn(
                'text-sm font-medium tracking-[0.22em] text-zinc-900 uppercase transition hover:opacity-60',
                location.pathname === link.to && 'underline underline-offset-8',
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/about"
            onClick={onClose}
            className="text-sm font-medium tracking-[0.22em] text-zinc-900 uppercase transition hover:opacity-60"
          >
            Help
          </Link>
        </nav>

        {isAuthenticated ? (
          <div className="mt-auto space-y-4 border-t icon border-zinc-200 pt-8">
            <Link
              to="/profile"
              onClick={onClose}
              className="block text-sm font-medium tracking-[0.22em] text-zinc-900 uppercase"
            >
              My account
            </Link>
            <Link
              to="/bookings"
              onClick={onClose}
              className="block text-sm font-medium tracking-[0.22em] text-zinc-900 uppercase"
            >
              Bookings
            </Link>
            <Link
              to="/orders"
              onClick={onClose}
              className="block text-sm font-medium tracking-[0.22em] text-zinc-900 uppercase"
            >
              Orders
            </Link>
          </div>
        ) : null}
      </aside>
    </div>
  )
}

function EditorialSearch({ className = '', isScrolled = true }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setQuery(params.get('q') ?? '')
  }, [location.pathname, location.search])

  function handleSubmit(event) {
    event.preventDefault()
    const q = query.trim()
    navigate(q ? `/explore?q=${encodeURIComponent(q)}` : '/explore')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('relative w-full icon max-w-[220px]', className)}
    >
      <input
        ref={inputRef}
        id="editorial-header-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search..."
        className={cn(
          'w-full border-0 border-b icon bg-transparent pb-1.5 text-sm outline-none transition-colors duration-300',
          isScrolled || window.location.pathname !== '/'
            ? 'border-zinc-900 text-zinc-900 placeholder:text-zinc-400'
            : 'border-white/80 text-white placeholder:text-white/60',
        )}
      />
    </form>
  )
}

function EditorialHeader() {
  const { openLoginModal } = useLoginModal()
  const { isAuthenticated } = useAuth()
  const cart = useCartOptional()
  const cartCount = cart?.itemCount ?? 0
  const [menuOpen, setMenuOpen] = useState(false)
  const isScrolled = useHeaderScroll()

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const actionClass = cn(
    'transition-colors duration-300',
    isScrolled || window.location.pathname !== '/'
      ? 'text-zinc-900'
      : 'text-white',
  )

  return (
    <>
      <header
        data-scrolled={isScrolled}
        className={cn(
          'editorial-header fixed inset-x-0 top-0 icon z-50 border-b transition-all duration-300',
          isScrolled || window.location.pathname !== '/'
            ? 'border-zinc-200/80 bg-white'
            : 'border-transparent bg-transparent',
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-8 md:py-6">
          <div className="flex items-start pt-1">
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className={cn(
                'inline-flex items-center justify-center p-1 transition-colors duration-300 hover:opacity-60',
                isScrolled || window.location.pathname !== '/'
                  ? 'text-zinc-900'
                  : 'text-white',
              )}
            >
              <MenuIcon />
            </button>
          </div>

          <div className="flex w-full items-center justify-end gap-8 pt-1">
            <EditorialSearch
              className="hidden sm:block"
              isScrolled={isScrolled || window.location.pathname !== '/'}
            />

            <div
              className={cn(
                'flex items-center gap-3 text-[11px] font-medium uppercase',
                actionClass,
              )}
            >
              <Link to="/cart" className={actionClass}>
                Bag [{cartCount}]
              </Link>

              {isAuthenticated ? (
                <Link to="/profile" className={actionClass}>
                  Account
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openLoginModal({ stayOnPage: true })}
                  className={actionClass}
                >
                  Log in
                </button>
              )}

              <Link to="/about" className={actionClass}>
                Help
              </Link>

              {isAuthenticated ? (
                <div
                  className={cn(
                    'mt-1 [&_button]:transition-colors [&_button]:duration-300',
                    isScrolled
                      ? '[&_button]:text-zinc-900 [&_button]:hover:text-primary'
                      : '[&_button]:text-white [&_button]:hover:text-white/70',
                  )}
                >
                  <NotificationBell />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className={cn(
            'px-6 py-4 transition-colors duration-300 sm:hidden',
            isScrolled ? 'border-t border-zinc-100' : 'border-t border-white/10',
          )}
        >
          <EditorialSearch className="max-w-none" isScrolled={isScrolled} />
        </div>
      </header>

      <EditorialNavDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        isAuthenticated={isAuthenticated}
      />
    </>
  )
}

function MarketingHeader() {
  const { openLoginModal } = useLoginModal()
  const { isAuthenticated } = useAuth()

  return (
    <header className="editorial-header fixed inset-x-0 top-0 z-50 border-b border-zinc-200/80 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-8">
        <Link to="/">
          <img src="/logo.png" className="icon w-20" alt="Multi Tenants" />
        </Link>

        {isAuthenticated ? (
          <Link to="/dashboard">
            <Button className="px-6 font-semibold">Dashboard</Button>
          </Link>
        ) : (
          <Button
            onClick={() => openLoginModal({ stayOnPage: true })}
            className="px-6 font-semibold"
          >
            Get Started
          </Button>
        )}
      </div>
    </header>
  )
}

export default function Header({ isClientHeader = false, variant }) {
  if (isClientHeader) {
    return <EditorialHeader />
  }

  if (variant === 'admin' || variant === 'superadmin') {
    return <PortalEditorialHeader variant={variant} />
  }

  return <MarketingHeader />
}
