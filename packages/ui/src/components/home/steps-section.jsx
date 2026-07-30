import AnimateOnScroll from '../animate-on-scroll'

const steps = [
  {
    number: '1',
    title: 'Create your organization',
    description:
      'Sign up to Multi-Tenants and set up your pharmacy, e-commerce store, hotel, or hostel from the dashboard.',
  },
  {
    number: '2',
    title: 'Configure teams & operations',
    description:
      'Add members, manage inventory, products, rooms, and orders across every team and location.',
  },
  {
    number: '3',
    title: 'Watch your business grow',
    description:
      'Track revenue, bookings, prescriptions, and performance with real-time analytics and reports.',
  },
]

const StepsSection = () => {
  return (
    <AnimateOnScroll className="mx-auto mt-24 w-full max-w-7xl" scale>
      <section className="rounded-[32px] bg-[#042f2a] px-8 py-14 md:px-12 md:py-16">
        <AnimateOnScroll delay={100}>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
              Step
            </p>
            <h2 className="mt-4 text-4xl font-bold leading-tight text-white md:text-5xl">
              Launch and scale every business type from one unified platform.
            </h2>
          </div>
        </AnimateOnScroll>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <AnimateOnScroll key={step.number} delay={150 + index * 120}>
              <div className="section-card-hover relative h-full overflow-hidden rounded-[24px] bg-[#0a3d36] p-8">
                <span className="pointer-events-none absolute -left-1 top-2 select-none text-[120px] font-bold leading-none text-white/10">
                  {step.number}
                </span>

                <div className="relative z-10 pt-16">
                  <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>
    </AnimateOnScroll>
  )
}

export default StepsSection
