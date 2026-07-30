import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import { TbArrowsLeftRight } from 'react-icons/tb'
import AnimateOnScroll from '../animate-on-scroll'

const chartPoints = [
  { month: 'Jan', value: 28 },
  { month: 'Feb', value: 38 },
  { month: 'Mar', value: 34 },
  { month: 'Apr', value: 48 },
  { month: 'May', value: 44 },
  { month: 'Jun', value: 58 },
]

function GrowthChart() {
  const width = 320
  const height = 120
  const paddingX = 8
  const paddingY = 12
  const maxValue = Math.max(...chartPoints.map((point) => point.value))
  const stepX = (width - paddingX * 2) / (chartPoints.length - 1)

  const coordinates = chartPoints.map((point, index) => {
    const x = paddingX + index * stepX
    const y =
      height -
      paddingY -
      (point.value / maxValue) * (height - paddingY * 2)
    return { ...point, x, y }
  })

  const linePath = coordinates
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  const areaPath = `${linePath} L ${coordinates[coordinates.length - 1].x} ${height} L ${coordinates[0].x} ${height} Z`

  return (
    <div className="mt-6">
      <svg viewBox={`0 0 ${width} ${height + 24}`} className="h-auto w-full">
        <defs>
          <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#27bd90" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#27bd90" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <path d={areaPath} fill="url(#chartFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="#27bd90"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {coordinates.map((point) => (
          <g key={point.month}>
            <text
              x={point.x}
              y={height + 18}
              textAnchor="middle"
              className="fill-gray-400 text-[10px]"
            >
              {point.month}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

const WhyUsSection = () => {
  return (
    <section className="mx-auto mt-24 w-full max-w-7xl">
      <AnimateOnScroll className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
          Why Us
        </p>
        <h2 className="mt-4 text-4xl font-bold text-gray-900 md:text-5xl">
          Why they prefer Multi-Tenants
        </h2>
      </AnimateOnScroll>

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        <AnimateOnScroll delay={100} direction="left">
          <div className="section-card-hover h-full rounded-[28px] bg-[#f3f4f6] p-8 md:p-10">
            <p className="text-6xl font-bold text-primary md:text-7xl">500+</p>
            <p className="mt-4 max-w-sm text-2xl font-semibold leading-snug text-gray-900">
              Organizations already running pharmacy, e-commerce, hotel, and hostel
              operations on one platform.
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={200} direction="right">
          <div className="section-card-hover h-full rounded-[28px] bg-[#f3f4f6] p-8 md:p-10">
            <p className="max-w-md text-2xl font-semibold leading-snug text-gray-900">
              Instantly sync inventory, orders, and teams across every business
              location.
            </p>

            <div className="mt-10 flex items-center justify-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                MT
              </div>
              <TbArrowsLeftRight className="icon text-3xl text-gray-500" />
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-white">
                <HiOutlineBuildingOffice2 className="icon text-2xl" />
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>

      <AnimateOnScroll className="mt-5" delay={150} scale>
        <div className="grid gap-8 rounded-[28px] bg-[#f3f4f6] p-8 lg:grid-cols-2 lg:items-center lg:p-10">
          <div>
            <h3 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
              Real-time business visibility
            </h3>
            <p className="mt-4 max-w-md text-base leading-7 text-gray-500">
              Monitor pharmacy stock, hotel bookings, e-commerce orders, and hostel
              occupancy from one analytics dashboard with live reporting.
            </p>
          </div>

          <div className="rounded-[24px] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Summary</p>
              <select className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none">
                <option>6 Months</option>
                <option>12 Months</option>
              </select>
            </div>

            <p className="mt-4 text-4xl font-bold text-gray-900">$1,876,580</p>
            <p className="mt-1 text-sm text-gray-500">
              Total revenue across all organizations
            </p>

            <GrowthChart />
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  )
}

export default WhyUsSection
