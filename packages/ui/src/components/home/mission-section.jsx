import AnimateOnScroll from '../animate-on-scroll'

const stats = [
  {
    value: '40%',
    label: 'Faster business operations',
  },
  {
    value: '180K+',
    label: 'Orders & bookings managed',
  },
  {
    value: '4+',
    label: 'Business verticals supported',
  },
]

const MissionSection = () => {
  return (
    <section className="mx-auto mt-24 w-full max-w-7xl text-center">
      <AnimateOnScroll>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
          Our Mission
        </p>

        <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
          We&apos;ve helped innovative businesses scale smarter
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-500">
          Hundreds of pharmacies, e-commerce stores, hotels, and hostels of all
          sizes have improved operations with our multi-tenant platform.
        </p>
      </AnimateOnScroll>

      <div className="mt-14 grid gap-10 md:grid-cols-3">
        {stats.map((stat, index) => (
          <AnimateOnScroll key={stat.label} delay={120 + index * 120} scale>
            <div className="section-card-hover rounded-[24px] bg-white px-6 py-8 shadow-sm">
              <p className="text-5xl font-bold text-gray-900 md:text-6xl">
                {stat.value}
              </p>
              <p className="mt-3 text-sm text-gray-500">{stat.label}</p>
            </div>
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  )
}

export default MissionSection
