import { Link } from 'react-router-dom'
import { PiArrowLeft } from 'react-icons/pi'

export default function ListingBanner({
  heroImage,
  icon: Icon,
  title,
  description,
  countLabel,
  backTo = '/',
}) {
  return (
    <section className="relative isolate min-h-[42vh] w-full overflow-hidden icon">
      <img
        src={heroImage}
        alt=""
        className="listing-banner-image absolute inset-0 h-full w-full object-cover icon"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-zinc-950/35 to-zinc-950/70 icon" />
      <div className="relative z-10 mx-auto flex min-h-[42vh] w-full max-w-7xl flex-col justify-end px-6 pb-12 pt-32">
        <Link
          to={backTo}
          className="mb-6 inline-flex w-fit items-center gap-1.5 text-sm text-white/80 transition hover:text-white"
        >
          <PiArrowLeft className="icon size-4" />
          Home
        </Link>
        <div className="flex items-end gap-4">
          {Icon ? (
            <span className="inline-flex size-14 shrink-0 items-center justify-center bg-white text-zinc-900">
              <Icon className="icon size-7" />
            </span>
          ) : null}
          <div>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-xl text-sm text-zinc-200 md:text-base">
                {description}
              </p>
            ) : null}
            {countLabel ? (
              <p className="mt-4 text-xs font-medium tracking-[0.2em] text-white/60 uppercase">
                {countLabel}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
