import { FiArrowUpRight } from 'react-icons/fi'
import { useLoginModal } from '@multi-tenants/auth'
import {
  Button,
  CtaSection,
  FeaturesSection,
  HeroCard,
  MissionSection,
  PricingSection,
  StepsSection,
  WhyUsSection,
} from '@multi-tenants/ui'

const partnerLogos = ['Klarna.', 'coinbase', 'instacart', 'Dropbox', 'zoom']

export default function LandingPage() {
  const { openLoginModal } = useLoginModal()

  return (
    <div className="relative flex flex-col items-center overflow-x-hidden pb-20 pt-40">
      <section className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 px-4 lg:grid-cols-2 lg:gap-10">
        <div className="max-w-2xl">
          <h1 className="animate-hero-entry text-5xl font-bold leading-[1.05] text-gray-900 md:text-6xl lg:text-6xl">
            Manage every project, deliver on time, scale every business.
          </h1>

          <p className="animate-hero-entry animate-delay-150 mt-6 text-justify text-base leading-7 text-gray-500 md:text-lg">
            Launch and manage pharmacy, e-commerce, hotel, and hostel operations
            from one multi-tenant platform with powerful project tracking, team
            collaboration, inventory, and analytics.
          </p>

          <div className="animate-hero-entry animate-delay-300 relative mt-8 max-w-xl">
            <input
              type="email"
              placeholder="Your business email..."
              className="h-14 w-full rounded-[15px] border border-gray-200 bg-white px-5 pr-44 text-sm font-medium text-gray-700 outline-none transition focus:border-primary"
            />
            <Button
              type="button"
              onClick={openLoginModal}
              variant="primary"
              className="absolute right-1.5 top-1.5 h-11 gap-2 px-5 font-semibold"
            >
              Get Started
              <FiArrowUpRight className="icon text-lg" />
            </Button>
          </div>

          <div className="animate-hero-entry animate-delay-450 mt-10 flex flex-wrap items-center gap-6 opacity-60 grayscale">
            {partnerLogos.map((logo) => (
              <span
                key={logo}
                className="text-sm font-bold uppercase tracking-wide text-gray-500"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>

        <div className="animate-hero-card animate-delay-300 flex justify-center lg:justify-end">
          <HeroCard />
        </div>
      </section>

      <FeaturesSection />
      <WhyUsSection />
      <StepsSection />
      <MissionSection />
      <PricingSection />
      <CtaSection />
    </div>
  )
}
