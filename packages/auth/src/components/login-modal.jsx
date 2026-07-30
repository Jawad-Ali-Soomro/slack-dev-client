import { useState } from 'react'
import { FaApple } from 'react-icons/fa6'
import { FcGoogle } from 'react-icons/fc'
import { FiEye, FiEyeOff, FiLock, FiMail, FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { navigateAfterAuth } from '@multi-tenants/config'
import {
  useModalAnimation,
  useModalBodyLock,
} from '@multi-tenants/hooks'
import { useAuth } from '../contexts/auth-context'
import { useLoginModal } from '../contexts/auth-modal-context'
import { useUser } from '../contexts/user-context'

export function LoginForm({
  appId,
  title = 'Welcome!',
  subtitle = 'Log in to Multi-Tenants to continue to your dashboard.',
  onSuccess,
  showClose = false,
  onClose,
  onSwitchToSignup,
}) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { refreshUser } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login({ email, password })
      const user = await refreshUser()
      setEmail('')
      setPassword('')
      onSuccess?.(user)
      navigateAfterAuth(appId, user?.role, navigate)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative w-full gap-5 max-w-md rounded-[28px] bg-white p-8 text-black shadow-2xl">
      {showClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="login-modal-item login-modal-item-1 absolute right-5 top-5 text-gray-400 transition hover:scale-110 hover:text-black"
        >
          <FiX className="icon text-xl" />
        </button>
      ) : null}

      <div className="login-modal-item login-modal-item-1">
        <h1 id="login-modal-title" className="text-4xl font-bold">
          {title}
        </h1>
        <p className="mt-3 text-gray-400">{subtitle}</p>
      </div>

      <div className="login-modal-item login-modal-item-2 mt-8 flex gap-3">
        <button
          type="button"
          aria-label="Continue with Google"
          className="flex h-12 flex-1 items-center justify-center rounded-2xl border border-gray-200 transition hover:scale-[1.02] hover:border-primary/40"
        >
          <FcGoogle className="text-2xl" />
        </button>
        <button
          type="button"
          aria-label="Continue with Apple"
          className="flex h-12 flex-1 items-center justify-center rounded-2xl border border-gray-200 transition hover:scale-[1.02] hover:border-primary/40"
        >
          <FaApple className="icon text-2xl" />
        </button>
      </div>

      <div className="login-modal-item login-modal-item-3 my-8 mt-10 flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs uppercase tracking-[0.2em] text-gray-500">or</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="login-modal-item login-modal-item-4 relative">
          <FiMail className="icon pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400" />
          <input
            id="modal-email"
            // type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Your email address"
            aria-label="Email"
            className="h-12 w-full rounded-2xl border border-gray-200 py-3 pl-12 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-500 focus:border-primary "
            required
          />
        </div>

        <div className="login-modal-item login-modal-item-5">
          <div className="relative">
            <FiLock className="icon pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400" />
            <input
              id="modal-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              aria-label="Password"
              className="h-12 w-full rounded-2xl border border-gray-200 py-3 pl-12 pr-12 text-sm text-gray-700 outline-none transition placeholder:text-gray-500 focus:border-primary "
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:scale-110 hover:text-gray-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff className="icon text-lg" /> : <FiEye className="icon text-lg" />}
            </button>
          </div>
          <div className="mt-2 text-right">
            <button type="button" className="text-sm text-primary transition hover:underline">
              Forgot password?
            </button>
          </div>
        </div>

        {error ? (
          <p className="login-modal-item login-modal-item-6 text-sm text-red-500">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="login-modal-item login-modal-item-6 h-12 w-full rounded-2xl bg-[#1f1f1f] text-sm font-semibold text-white transition hover:scale-[1.01] hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      {onSwitchToSignup ? (
        <p className="login-modal-item login-modal-item-6 mt-8 text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-primary underline-offset-4 transition hover:underline"
          >
            Sign up
          </button>
        </p>
      ) : (
        <p className="login-modal-item login-modal-item-6 mt-8 text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <span className="text-primary">Sign up</span>
        </p>
      )}
    </div>
  )
}

export function LoginModal({ appId }) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { refreshUser } = useUser()
  const { isOpen, closeLoginModal, openSignupModal, consumeLoginSuccess } =
    useLoginModal()
  const { shouldRender, isClosing } = useModalAnimation(isOpen)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useModalBodyLock(shouldRender, closeLoginModal)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login({ email, password })
      const user = await refreshUser()
      setEmail('')
      setPassword('')
      const { onSuccess, stayOnPage } = consumeLoginSuccess()
      closeLoginModal()
      if (typeof onSuccess === 'function') {
        await onSuccess(user)
      } else if (!stayOnPage) {
        navigateAfterAuth(appId, user?.role, navigate)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignUp = () => {
    setError('')
    closeLoginModal()
    openSignupModal()
  }

  if (!shouldRender) {
    return null
  }

  return (
    <div className="fixed icon inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close login modal"
        onClick={closeLoginModal}
        className={`absolute inset-0 bg-black/30 icon backdrop-blur-sm ${isClosing ? 'login-modal-backdrop-exit' : 'login-modal-backdrop-enter'
          }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        className={`relative z-10 w-full max-w-md rounded-[28px] bg-white p-8 text-black shadow-2xl ${isClosing ? 'login-modal-panel-exit' : 'login-modal-panel-enter'
          }`}
      >
        <button
          type="button"
          onClick={closeLoginModal}
          aria-label="Close"
          className="login-modal-item login-modal-item-1 absolute right-5 top-5 text-gray-400 transition hover:scale-110 hover:text-black"
        >
          <FiX className="icon text-xl" />
        </button>

        <div className="login-modal-item login-modal-item-1">
          <h1 id="login-modal-title" className="text-4xl font-bold">
            Welcome!
          </h1>
          <p className="mt-3 text-gray-400">
            Log in to Multi-Tenants to continue.
          </p>
        </div>

        <div className="login-modal-item login-modal-item-2 mt-8 flex gap-3">
          <button
            type="button"
            aria-label="Continue with Google"
            className="flex h-12 flex-1 items-center justify-center rounded-2xl border border-gray-200 transition hover:scale-[1.02] hover:border-primary/40"
          >
            <FcGoogle className="text-2xl" />
          </button>

          <button
            type="button"
            aria-label="Continue with Apple"
            className="flex h-12 flex-1 items-center justify-center rounded-2xl border border-gray-200 transition hover:scale-[1.02] hover:border-primary/40"
          >
            <FaApple className="icon text-2xl" />
          </button>
        </div>

        <div className="login-modal-item login-modal-item-3 my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs uppercase tracking-[0.2em] text-gray-500">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="login-modal-item login-modal-item-4 relative">
            <FiMail className="icon pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400" />
            <input
              id="modal-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Your email address"
              aria-label="Email"
              className="h-12 w-full rounded-2xl border border-gray-200 py-3 pl-12 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-500 focus:border-primary "
              required
            />
          </div>

          <div className="login-modal-item login-modal-item-5">
            <div className="relative">
              <FiLock className="icon pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400" />
              <input
                id="modal-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Your password"
                aria-label="Password"
                className="h-12 w-full rounded-2xl border border-gray-200 py-3 pl-12 pr-12 text-sm text-gray-700 outline-none transition placeholder:text-gray-500 focus:border-primary "
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:scale-110 hover:text-gray-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <FiEyeOff className="icon text-lg" />
                ) : (
                  <FiEye className="icon text-lg" />
                )}
              </button>
            </div>

            <div className="mt-2 text-right">
              <button type="button" className="text-sm text-primary transition hover:underline">
                Forgot password?
              </button>
            </div>
          </div>

          {error ? (
            <p className="login-modal-item login-modal-item-6 text-sm text-red-500">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="login-modal-item login-modal-item-6 h-12 w-full rounded-2xl bg-black text-sm font-semibold text-white transition hover:scale-[1.01] hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="login-modal-item login-modal-item-6 mt-8 text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={handleSignUp}
            className="text-primary underline-offset-4 transition hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginModal
