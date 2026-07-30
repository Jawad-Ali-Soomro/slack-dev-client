import { Link } from 'react-router-dom'
import { FiArrowUpRight } from 'react-icons/fi'
import AnimateOnScroll from '../animate-on-scroll'

const plans = [
  {
    name: 'Plus',
    price: '$29/month',
    featured: false,
    href: '/register',
  },
  {
    name: 'Premium',
    price: '$59/month',
    featured: true,
    href: '/register',
  },
]

const PricingSection = () => {
  return (
    <section className="mx-auto mt-24 w-full max-w-7xl">
      <AnimateOnScroll className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">
          Choose Plan:
        </p>
      </AnimateOnScroll>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {plans.map((plan, index) => (
          <AnimateOnScroll key={plan.name} delay={120 + index * 150} scale>
            <Link
              to={plan.href}
              className={`group relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-[28px] p-8 transition duration-500 hover:scale-[1.02] ${
                plan.featured
                  ? 'bg-primary text-white'
                  : 'bg-[#f3f4f6] text-gray-900'
              }`}
            >
              {plan.featured ? (
                <div className="pointer-events-none absolute inset-0 opacity-30">
                  <div className="absolute -right-10 top-8 h-40 w-40 rotate-12 rounded-3xl bg-white/20" />
                  <div className="absolute bottom-0 right-20 h-48 w-48 -rotate-12 rounded-3xl bg-black/10" />
                  <div className="absolute left-1/3 top-1/2 h-32 w-56 rotate-45 rounded-3xl bg-white/10" />
                </div>
              ) : null}

              <div className="relative z-10 flex items-start justify-between">
                <h3 className="text-4xl font-bold md:text-5xl">{plan.name}</h3>
              </div>

              <div className="relative z-10 flex items-end justify-between">
                <p
                  className={`text-lg font-medium ${
                    plan.featured ? 'text-white/90' : 'text-gray-500'
                  }`}
                >
                  {plan.price}
                </p>
                <FiArrowUpRight
                  className={`icon text-2xl transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 ${
                    plan.featured ? 'text-white' : 'text-gray-700'
                  }`}
                />
              </div>
            </Link>
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  )
}

export default PricingSection
