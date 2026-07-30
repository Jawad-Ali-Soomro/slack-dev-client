import { useState } from 'react'
import { FaApple } from 'react-icons/fa6'
import { FcGoogle } from 'react-icons/fc'
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser, FiX } from 'react-icons/fi'
import {
  useModalAnimation,
  useModalBodyLock,
} from '@multi-tenants/hooks'
import { useAuth } from '../contexts/auth-context'
import { useSignupModal } from '../contexts/auth-modal-context'
import { PiUserDuotone } from 'react-icons/pi'

export function SignupModal() {
  const { register } = useAuth()
  const { isOpen, closeSignupModal, openLoginModal } = useSignupModal()
  const { shouldRender, isClosing } = useModalAnimation(isOpen)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useModalBodyLock(shouldRender, closeSignupModal)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const data = await register({ username, email, password })
      setSuccessMessage(
        data.message ??
          'Registration successful. Please check your email to verify your account.',
      )
      setUsername('')
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogin = () => {
    setError('')
    setSuccessMessage('')
    closeSignupModal()
    openLoginModal()
  }

  if (!shouldRender) {
    return null
  }

  return (
    <div className="fixed icon inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close signup modal"
        onClick={closeSignupModal}
        className={`absolute inset-0 bg-black/30 icon backdrop-blur-sm ${
          isClosing ? 'login-modal-backdrop-exit' : 'login-modal-backdrop-enter'
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signup-modal-title"
        className={`relative z-10 w-full max-w-md rounded-[28px] bg-white p-8 text-black shadow-2xl ${
          isClosing ? 'login-modal-panel-exit' : 'login-modal-panel-enter'
        }`}
      >
        <button
          type="button"
          onClick={closeSignupModal}
          aria-label="Close"
          className="login-modal-item login-modal-item-1 absolute right-5 top-5 text-gray-400 transition hover:scale-110 hover:text-black"
        >
          <FiX className="icon text-xl" />
        </button>

        <div className="login-modal-item login-modal-item-1">
          <h1 id="signup-modal-title" className="text-4xl font-bold">
            Create account
          </h1>
          <p className="mt-3 text-gray-400">
            Join Multi-Tenants and start managing your business.
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

        {successMessage ? (
          <div className="login-modal-item login-modal-item-4 space-y-5">
            <p className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm leading-7 text-gray-700">
              {successMessage}
            </p>
            <button
              type="button"
              onClick={handleLogin}
              className="h-12 w-full rounded-2xl bg-primary text-sm font-semibold text-white transition hover:scale-[1.01] hover:bg-primary/90"
            >
              Go to login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="login-modal-item login-modal-item-4 relative">
              <PiUserDuotone className="icon pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400" />
              <input
                id="modal-username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Your username"
                aria-label="Username"
                className="h-12 w-full rounded-2xl border border-gray-200 py-3 pl-12 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-500 focus:border-primary "
                required
              />
            </div>

            <div className="login-modal-item login-modal-item-5 relative">
              <FiMail className="icon pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400" />
              <input
                id="modal-signup-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email address"
                aria-label="Email"
                className="h-12 w-full rounded-2xl border border-gray-200 py-3 pl-12 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-500 focus:border-primary "
                required
              />
            </div>

            <div className="login-modal-item login-modal-item-6">
              <div className="relative">
                <FiLock className="icon pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400" />
                <input
                  id="modal-signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  aria-label="Password"
                  minLength={8}
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
            </div>

            {error ? (
              <p className="login-modal-item login-modal-item-7 text-sm text-red-500">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="login-modal-item login-modal-item-7 h-12 w-full rounded-2xl bg-[#1f1f1f] text-sm font-semibold text-white transition hover:scale-[1.01] hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
        )}

        <p className="login-modal-item login-modal-item-7 mt-8 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={handleLogin}
            className="text-primary underline-offset-4 transition hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  )
}

export default SignupModal
