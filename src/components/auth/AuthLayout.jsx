import { useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Sparkles } from "lucide-react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

const BRAND_POINTS = [
  "Manage projects like a pro",
  "Real-time team collaboration",
  "Built by developers, for developers",
]

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  backTo = "/login",
  backLabel = "Back",
  showBrand = true,
  badge,
  steps,
  currentStep,
}) {
  const containerRef = useRef(null)
  const navigate = useNavigate()

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
      if (prefersReducedMotion) return

      gsap.from(".auth-animate", {
        y: 28,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
      })

      gsap.to(".auth-orb", {
        y: "+=24",
        duration: 5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.6, from: "random" },
      })
    },
    { scope: containerRef }
  )

  return (
    <div
      ref={containerRef}
      className="auth-page landing-page min-h-screen relative flex items-center justify-center p-4 overflow-hidden"
    >
      <div className="landing-grid" aria-hidden="true" />
      <div className="landing-orb landing-orb-1 auth-orb landing-orb-enhanced" />
      <div className="landing-orb landing-orb-2 auth-orb landing-orb-enhanced" />
      <div className="landing-orb landing-orb-3 auth-orb landing-orb-enhanced" />

      <div className="w-full max-w-5xl relative z-10 grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
        {showBrand && (
          <div className="auth-animate hidden lg:flex flex-col justify-center px-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 mb-8 w-fit"
            >
              <img src="/logo.png" alt="logo" className="w-10 h-10" />
              <span className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">
                Slack Developers
              </span>
            </button>

            <span className="inline-flex items-center gap-2 w-fit px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold bg-theme-subtle text-theme-muted rounded-full border border-theme-subtle mb-6">
              <Sparkles size={11} />
              Developer Platform
            </span>

            <h2 className="text-4xl xl:text-5xl font-black text-gray-900 dark:text-white leading-tight">
              Ship faster.
              <br />
              <span className="text-stroke">Collaborate</span> better.
            </h2>

            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 max-w-sm leading-relaxed">
              Join thousands of developers managing projects, teams, and workflows
              in one powerful platform.
            </p>

            <ul className="mt-8 space-y-3">
              {BRAND_POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-theme shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="auth-animate w-full max-w-md mx-auto lg:max-w-none">
          <div className="auth-card rounded-2xl p-6 md:p-8">
            {backTo && (
              <Link
                to={backTo}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 hover-text-theme transition-colors mb-6"
              >
                <ArrowLeft size={14} />
                {backLabel}
              </Link>
            )}

            {steps && (
              <div className="flex items-center gap-2 mb-6">
                {steps?.length > 0 && steps?.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      i < currentStep
                        ? "step-active"
                        : i === currentStep
                          ? "step-current"
                          : "bg-gray-200 dark:bg-white/10"
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="text-center mb-8 lg:text-left">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="lg:hidden mb-5 mx-auto block"
              >
                <img src="/logo.png" alt="logo" className="w-14 h-14" />
              </button>

              {badge && (
                <span className="inline-block text-[10px] uppercase tracking-widest font-bold text-theme mb-3">
                  {badge}
                </span>
              )}

              <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                {title}
              </h1>
              {subtitle && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                  {subtitle}
                </div>
              )}
            </div>

            {children}

            {footer}
          </div>

          <p className="auth-animate text-center text-xs text-gray-400 mt-5 px-4 leading-relaxed">
            By continuing, you agree to our{" "}
            <span className="text-gray-700 dark:text-gray-300 font-bold">
              Terms & Conditions
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-black/5 dark:border-white/10" />
      </div>
      <div className="relative flex justify-center">
        <span className="px-3 text-[10px] uppercase tracking-widest font-bold text-gray-400 bg-white/80 dark:bg-zinc-900/80">
          Or
        </span>
      </div>
    </div>
  )
}

export function AuthButton({ children, loading, className = "", ...props }) {
  return (
    <button
      className={`auth-btn-primary w-full py-3.5 rounded-xl font-bold uppercase text-sm tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span className="loader mx-auto" /> : children}
    </button>
  )
}

export function AuthAltLink({ text, linkText, to }) {
  return (
    <div className="flex items-center justify-between mt-6 gap-3">
      <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
      <Link
        to={to}
        className="auth-btn-secondary shrink-0 px-10 py-3 rounded-xl text-xs font-bold uppercase tracking-wide"
      >
        {linkText}
      </Link>
    </div>
  )
}

export function AuthField({ icon: Icon, children }) {
  return (
    <div className="auth-field relative">
      {Icon && (
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none z-10" />
      )}
      {children}
    </div>
  )
}

export function AuthInput({ className = "", icon: Icon, ...props }) {
  return (
    <AuthField icon={Icon}>
      <input
        className={`auth-input w-full h-12 ${Icon ? "pl-10" : "px-4"} pr-4 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 ${className}`}
        {...props}
      />
    </AuthField>
  )
}

export function AuthOtpInput({ value, onChange, onKeyDown, inputRef, id }) {
  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      inputMode="numeric"
      pattern="[0-9]"
      maxLength={1}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      autoComplete="off"
      className="auth-otp w-14 h-14 md:w-16 md:h-16 text-center text-xl font-black rounded-xl text-gray-900 dark:text-white"
    />
  )
}
