import { Link } from 'react-router-dom'
import { FiArrowUpRight } from 'react-icons/fi'
import AnimateOnScroll from '../animate-on-scroll'
import { useLoginModal } from '@multi-tenants/auth'

const CtaSection = () => {
  const { openLoginModal } = useLoginModal()

  return (
    <AnimateOnScroll className="mx-auto mt-24 w-full max-w-7xl" scale>
      <section className="grid items-center gap-8 rounded-[32px] bg-primary px-8 py-12 md:grid-cols-[1.2fr_1fr] md:px-12 md:py-14">
        <AnimateOnScroll delay={100}>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/80">
            Try it now
          </p>
          <h2 className="mt-4 text-4xl font-bold leading-tight text-white md:text-5xl">
            Ready to level up your business operations?
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/85">
            Supports pharmacies, e-commerce stores, hotels, and hostels with
            unified inventory, team management, orders, and analytics tools.
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll delay={220} direction="left">
          <div className="flex flex-col gap-4 sm:flex-row md:flex-col lg:flex-row">
            <button
              type="button"
              onClick={openLoginModal}
              className="cta-button inline-flex h-12 items-center justify-center rounded-2xl bg-white px-6 text-sm font-semibold text-primary transition hover:scale-105 hover:bg-white/95"
            >
              Get Started Now
            </button>

            <Link
              to="/about"
              className="cta-button inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white px-6 text-sm font-semibold text-white transition hover:scale-105 hover:bg-white/10"
            >
              Learn More
              <FiArrowUpRight className="icon text-lg" />
            </Link>
          </div>
        </AnimateOnScroll>
      </section>
    </AnimateOnScroll>
  )
}

export default CtaSection
