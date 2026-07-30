import {
  HiOutlineChartBarSquare,
  HiOutlineClipboardDocumentCheck,
} from 'react-icons/hi2'
import { PiUsersDuotone } from 'react-icons/pi'
import AnimateOnScroll from '../animate-on-scroll'

const features = [
  {
    icon: HiOutlineChartBarSquare,
    title: 'Project Planning',
    description:
      'Organize tasks, milestones & timelines across every organization & team from one dashboard.',
  },
  {
    icon: PiUsersDuotone,
    title: 'Team Collaboration',
    description:
      'Assign roles, share updates, and keep managers and members aligned in real time.',
  },
  {
    icon: HiOutlineClipboardDocumentCheck,
    title: 'Progress Tracking',
    description:
      'Monitor inventory, orders, and project status with clear dashboards and live reports.',
  },
]

const FeaturesSection = () => {
  return (
    <AnimateOnScroll className="mx-auto mt-24 w-full max-w-7xl" scale>
      <section className="rounded-[32px] bg-white px-8 py-12 shadow-[0_20px_50px_rgba(15,23,42,0.06)] md:px-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          <AnimateOnScroll delay={100}>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Project Management
            </p>
            <h2 className="mt-4 max-w-xl text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
              Experience that grows with your projects
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll delay={200}>
            <p className="max-w-lg self-end text-base leading-7 text-gray-500 lg:pt-8">
              Whether you manage pharmacy, e-commerce, hotel, or hostel operations,
              scale project delivery with unified teams, inventory, and analytics
              built for multi-tenant businesses.
            </p>
          </AnimateOnScroll>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon

            return (
              <AnimateOnScroll key={feature.title} delay={150 + index * 120}>
                <div className="section-card-hover max-w-sm rounded-[15px] border border-gray-200 p-5">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border bg-primary/10 text-primary">
                    <Icon className="icon text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-500">
                    {feature.description}
                  </p>
                </div>
              </AnimateOnScroll>
            )
          })}
        </div>
      </section>
    </AnimateOnScroll>
  )
}

export default FeaturesSection
