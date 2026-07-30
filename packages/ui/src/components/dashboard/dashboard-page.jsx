import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PiArrowRight,
  PiBed,
  PiBuildings,
  PiCalendarBlank,
  PiChartBar,
  PiCheckCircle,
  PiCirclesFour,
  PiCurrencyDollar,
  PiPackage,
  PiUsersThree,
  PiWarning,
  PiWarehouse,
} from 'react-icons/pi'
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  listBookingsRequest,
  listInventoryRequest,
  listOrganizationsRequest,
  listProductsRequest,
  listRoomsRequest,
} from '@multi-tenants/api'
import { useUser } from '@multi-tenants/auth'
import {
  BUSINESS_TYPE_OPTIONS,
  formatBusinessTypeLabel,
  isLodgingBusinessType,
} from '@multi-tenants/constants'
import { cn } from '@multi-tenants/utils'
import Button from '../button.jsx'
import Loading from '../loading.jsx'
import {
  FormFieldProvider,
  SectionTitle,
} from '../../contexts/form-field-context.jsx'

const ATTENTION_LIMIT = 5

const CHART_COLORS = {
  emerald: '#27bd90',
  sky: '#0ea5e9',
  amber: '#f59e0b',
  rose: '#f43f5e',
  zinc: '#a1a1aa',
  teal: '#14b8a6',
  slate: '#64748b',
}

function formatPrice(price) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(Number(price) || 0)
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function getAssignedAdmin(organization) {
  if (organization.owner && organization.owner.role !== 'SUPERADMIN') {
    return organization.owner
  }

  const adminMember = (organization.members ?? []).find(
    (member) => member.role === 'OWNER' || member.role === 'ADMIN',
  )

  return adminMember?.user ?? organization.owner ?? null
}

function isAssigned(organization) {
  const admin = getAssignedAdmin(organization)
  return Boolean(admin && admin.role !== 'SUPERADMIN')
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur">
      {label ? (
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
          {label}
        </p>
      ) : null}
      <ul className="space-y-1">
        {payload.map((item) => (
          <li
            key={item.dataKey || item.name}
            className="flex items-center gap-2 text-sm"
          >
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.color || item.fill }}
            />
            <span className="text-zinc-500">{item.name}</span>
            <span className="ml-auto font-semibold text-zinc-900">
              {typeof item.value === 'number'
                ? item.value.toLocaleString()
                : item.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function StatusGrid({ items }) {
  if (!items?.length) return null
  return (
    <div className="mt-4 grid grid-cols-2 gap-2.5">
      {items.map((item) => (
        <div
          key={item.name}
          className="flex items-center justify-between gap-2 rounded-xl bg-zinc-50 px-3.5 py-2.5"
        >
          <span className="flex min-w-0 items-center gap-2 text-sm text-zinc-600">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.fill || item.color }}
            />
            <span className="truncate">{item.name}</span>
          </span>
          <span className="shrink-0 text-sm font-semibold text-zinc-900">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function ChartCard({
  title,
  description,
  icon: Icon,
  tone = 'zinc',
  stat,
  children,
  footer,
  className = '',
  chartHeight = 'h-56',
}) {
  const tones = {
    zinc: 'bg-zinc-100 text-zinc-600',
    emerald: 'bg-emerald-50 text-emerald-700',
    sky: 'bg-sky-50 text-sky-700',
    amber: 'bg-amber-50 text-amber-800',
    rose: 'bg-rose-50 text-rose-700',
  }

  return (
    <section
      className={cn(
        'rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm',
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {Icon ? (
            <span
              className={cn(
                'inline-flex size-10 shrink-0 items-center justify-center rounded-xl',
                tones[tone] ?? tones.zinc,
              )}
            >
              <Icon className="icon size-5" />
            </span>
          ) : null}
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {stat != null ? (
          <p className="shrink-0 text-3xl font-semibold tracking-tight text-zinc-900">
            {stat}
          </p>
        ) : null}
      </div>
      <div className={cn('relative w-full', chartHeight)}>{children}</div>
      {footer ? <div className="relative">{footer}</div> : null}
    </section>
  )
}

function ChartEmpty({ label = 'No data to chart yet' }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/60 text-sm text-zinc-400">
      <PiChartBar className="icon size-8 text-zinc-300" />
      {label}
    </div>
  )
}

function donutLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name,
  fill,
}) {
  if (percent < 0.04) return null
  const RADIAN = Math.PI / 180
  const radius = outerRadius + 22
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  const anchor = x > cx ? 'start' : 'end'

  return (
    <text
      x={x}
      y={y}
      fill={fill}
      textAnchor={anchor}
      dominantBaseline="central"
      className="text-[11px] font-semibold"
    >
      {`${name} ${Math.round(percent * 100)}%`}
    </text>
  )
}

function DonutChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 12, right: 28, bottom: 12, left: 28 }}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={62}
          outerRadius={88}
          paddingAngle={data.length > 1 ? 3 : 0}
          stroke="#fff"
          strokeWidth={3}
          label={donutLabel}
          labelLine={{
            stroke: '#d4d4d8',
            strokeWidth: 1,
          }}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}

function MultiLineChart({ data, series }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
      >
        <CartesianGrid
          strokeDasharray="4 4"
          stroke="#e4e4e7"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#71717a' }}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#a1a1aa' }}
          tickLine={false}
          axisLine={false}
          width={28}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={32}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: '#52525b' }}
        />
        {series.map((item) => (
          <Line
            key={item.dataKey}
            type="monotone"
            dataKey={item.dataKey}
            name={item.name}
            stroke={item.color}
            strokeWidth={2.5}
            dot={{
              r: 4,
              fill: item.color,
              stroke: '#fff',
              strokeWidth: 2,
            }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

function Badge({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'bg-zinc-100 text-zinc-700 ring-zinc-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
    amber: 'bg-amber-50 text-amber-800 ring-amber-200/80',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200/80',
    sky: 'bg-sky-50 text-sky-700 ring-sky-200/80',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',
        tones[tone] ?? tones.neutral,
        className,
      )}
    >
      {children}
    </span>
  )
}

function KpiTile({ to, icon: Icon, label, value, sublabel, tone = 'zinc' }) {
  const tones = {
    zinc: 'bg-zinc-100 text-zinc-600',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-800',
    rose: 'bg-rose-50 text-rose-700',
    sky: 'bg-sky-50 text-sky-700',
  }

  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm transition "
    >
      {/* <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-primary transition group-hover:scale-x-100" /> */}
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'inline-flex size-10 items-center justify-center rounded-xl',
            tones[tone] ?? tones.zinc,
          )}
        >
          <Icon className="icon size-5" />
        </span>
        <PiArrowRight className="icon size-4 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900">
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-zinc-700">{label}</p>
      {sublabel ? (
        <p className="mt-0.5 text-xs text-zinc-500">{sublabel}</p>
      ) : null}
    </Link>
  )
}

function AttentionPanel({ title, icon: Icon, children, viewAllTo, emptyLabel }) {
  return (
    <section className="flex min-h-[16rem] flex-col overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 bg-zinc-50/50 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex size-9 items-center justify-center rounded-xl bg-white text-zinc-600 ring-1 ring-zinc-200">
            <Icon className="icon size-4" />
          </span>
          <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
        </div>
        <Link
          to={viewAllTo}
          className="text-xs font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="flex flex-1 flex-col">
        {children?.length ? (
          <ul className="divide-y divide-zinc-100">{children}</ul>
        ) : (
          <div className="flex flex-1 items-center justify-center px-5 py-10 text-center text-sm text-zinc-500">
            {emptyLabel}
          </div>
        )}
      </div>
    </section>
  )
}

function emptyStats() {
  return {
    orgCount: 0,
    assignedCount: 0,
    unassignedCount: 0,
    byType: {},
    productTotal: 0,
    productPublished: 0,
    productDraft: 0,
    productDeleted: 0,
    productsByType: {},
    inventoryInStock: 0,
    inventoryLow: 0,
    inventoryOut: 0,
    inventoryAlerts: [],
    inventoryAlertCount: 0,
    openRooms: 0,
    closedRooms: 0,
    bookingsPending: 0,
    bookingsConfirmed: 0,
    bookingsCancelled: 0,
    pendingBookings: [],
    pendingCount: 0,
    confirmedValue: 0,
  }
}

async function loadDashboardStats() {
  const orgsRaw = await listOrganizationsRequest()
  const orgs = Array.isArray(orgsRaw) ? orgsRaw : []

  const lodgingOrgs = orgs.filter((org) =>
    isLodgingBusinessType(org.businessType),
  )
  const retailOrgs = orgs.filter(
    (org) => !isLodgingBusinessType(org.businessType),
  )

  const [productGroups, inventoryGroups, roomGroups, bookingGroups] =
    await Promise.all([
      Promise.all(
        orgs.map(async (org) => {
          try {
            const rows = await listProductsRequest(org.id)
            return (Array.isArray(rows) ? rows : []).map((row) => ({
              ...row,
              organizationId: org.id,
              businessType: org.businessType,
            }))
          } catch {
            return []
          }
        }),
      ),
      Promise.all(
        retailOrgs.map(async (org) => {
          try {
            const rows = await listInventoryRequest(org.id)
            return (Array.isArray(rows) ? rows : []).map((row) => ({
              ...row,
              organizationId: org.id,
              organizationName: org.name,
            }))
          } catch {
            return []
          }
        }),
      ),
      Promise.all(
        lodgingOrgs.map(async (org) => {
          try {
            const rows = await listRoomsRequest(org.id)
            return Array.isArray(rows) ? rows : []
          } catch {
            return []
          }
        }),
      ),
      Promise.all(
        lodgingOrgs.map(async (org) => {
          try {
            const rows = await listBookingsRequest(org.id)
            return (Array.isArray(rows) ? rows : []).map((row) => ({
              ...row,
              organizationName: org.name,
              organizationSlug: org.slug,
            }))
          } catch {
            return []
          }
        }),
      ),
    ])

  const products = productGroups.flat()
  const inventories = inventoryGroups.flat()
  const rooms = roomGroups.flat()
  const bookings = bookingGroups.flat()

  const byType = {}
  for (const org of orgs) {
    const key = org.businessType || 'unknown'
    byType[key] = (byType[key] || 0) + 1
  }

  const productsByType = {}
  for (const product of products) {
    const key = product.businessType || 'unknown'
    productsByType[key] = (productsByType[key] || 0) + 1
  }

  const assignedCount = orgs.filter((org) => isAssigned(org)).length
  const unassignedCount = orgs.length - assignedCount

  let inventoryInStock = 0
  let inventoryLow = 0
  let inventoryOut = 0
  const inventoryAlerts = []

  for (const row of inventories) {
    const low =
      row.reorderLevel != null &&
      Number(row.available) <= Number(row.reorderLevel)
    if (!row.inStock) {
      inventoryOut += 1
      inventoryAlerts.push(row)
    } else if (low) {
      inventoryLow += 1
      inventoryAlerts.push(row)
    } else {
      inventoryInStock += 1
    }
  }

  inventoryAlerts.sort((a, b) => Number(a.available) - Number(b.available))

  const pendingBookings = bookings
    .filter((b) => b.status === 'pending')
    .sort((a, b) => {
      const aTime = new Date(a.createdAt || a.checkIn).getTime()
      const bTime = new Date(b.createdAt || b.checkIn).getTime()
      return bTime - aTime
    })

  const confirmedValue = bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + Number(b.totalPrice || 0), 0)

  return {
    orgCount: orgs.length,
    assignedCount,
    unassignedCount,
    byType,
    productTotal: products.length,
    productPublished: products.filter((p) => p.status === 'published').length,
    productDraft: products.filter((p) => p.status === 'draft').length,
    productDeleted: products.filter((p) => p.status === 'deleted').length,
    productsByType,
    inventoryInStock,
    inventoryLow,
    inventoryOut,
    inventoryAlerts,
    inventoryAlertCount: inventoryAlerts.length,
    openRooms: rooms.filter((r) => r.status === 'open').length,
    closedRooms: rooms.filter((r) => r.status === 'closed').length,
    bookingsPending: bookings.filter((b) => b.status === 'pending').length,
    bookingsConfirmed: bookings.filter((b) => b.status === 'confirmed').length,
    bookingsCancelled: bookings.filter((b) => b.status === 'cancelled').length,
    pendingBookings,
    pendingCount: pendingBookings.length,
    confirmedValue,
  }
}

export default function DashboardPage({ variant = 'admin' }) {
  const isSuperadmin = variant === 'superadmin'
  const { user } = useUser()
  const [stats, setStats] = useState(emptyStats)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const next = await loadDashboardStats()
      setStats(next)
    } catch (err) {
      setStats(emptyStats())
      setError(
        err instanceof Error ? err.message : 'Failed to load dashboard data',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const displayName =
    user?.username || user?.email?.split('@')[0] || 'there'

  const subtitle = isSuperadmin
    ? 'Platform overview across all businesses.'
    : 'Overview of the businesses you manage.'

  const catalogByType = useMemo(() => {
    return BUSINESS_TYPE_OPTIONS.map((option) => ({
      name: formatBusinessTypeLabel(option.value),
      businesses: stats.byType[option.value] || 0,
      products: stats.productsByType[option.value] || 0,
    })).filter((item) => item.businesses > 0 || item.products > 0)
  }, [stats.byType, stats.productsByType])

  const productsByStatus = useMemo(
    () => [
      {
        name: 'Published',
        value: stats.productPublished,
        fill: CHART_COLORS.emerald,
      },
      {
        name: 'Draft',
        value: stats.productDraft,
        fill: CHART_COLORS.amber,
      },
      {
        name: 'Deleted',
        value: stats.productDeleted,
        fill: CHART_COLORS.zinc,
      },
    ],
    [stats.productPublished, stats.productDraft, stats.productDeleted],
  )

  const productsByStatusChart = useMemo(
    () => productsByStatus.filter((item) => item.value > 0),
    [productsByStatus],
  )

  const inventoryHealth = useMemo(
    () => [
      {
        name: 'In stock',
        value: stats.inventoryInStock,
        fill: CHART_COLORS.emerald,
      },
      {
        name: 'Low stock',
        value: stats.inventoryLow,
        fill: CHART_COLORS.amber,
      },
      {
        name: 'Out of stock',
        value: stats.inventoryOut,
        fill: CHART_COLORS.rose,
      },
    ],
    [stats.inventoryInStock, stats.inventoryLow, stats.inventoryOut],
  )

  const inventoryHealthChart = useMemo(
    () => inventoryHealth.filter((item) => item.value > 0),
    [inventoryHealth],
  )

  const roomsHealth = useMemo(
    () => [
      {
        name: 'Open',
        value: stats.openRooms,
        fill: CHART_COLORS.emerald,
      },
      {
        name: 'Closed',
        value: stats.closedRooms,
        fill: CHART_COLORS.rose,
      },
    ],
    [stats.openRooms, stats.closedRooms],
  )

  const roomsHealthChart = useMemo(
    () => roomsHealth.filter((item) => item.value > 0),
    [roomsHealth],
  )

  const bookingsByStatus = useMemo(
    () => [
      {
        name: 'Pending',
        value: stats.bookingsPending,
        fill: CHART_COLORS.amber,
      },
      {
        name: 'Confirmed',
        value: stats.bookingsConfirmed,
        fill: CHART_COLORS.emerald,
      },
      {
        name: 'Cancelled',
        value: stats.bookingsCancelled,
        fill: CHART_COLORS.rose,
      },
    ],
    [
      stats.bookingsPending,
      stats.bookingsConfirmed,
      stats.bookingsCancelled,
    ],
  )

  const bookingsByStatusChart = useMemo(
    () => bookingsByStatus.filter((item) => item.value > 0),
    [bookingsByStatus],
  )

  const assignmentChart = useMemo(
    () => [
      {
        name: 'Assigned',
        value: stats.assignedCount,
        fill: CHART_COLORS.emerald,
      },
      {
        name: 'Unassigned',
        value: stats.unassignedCount,
        fill: CHART_COLORS.rose,
      },
    ],
    [stats.assignedCount, stats.unassignedCount],
  )

  const assignmentChartVisible = useMemo(
    () => assignmentChart.filter((item) => item.value > 0),
    [assignmentChart],
  )

  const kpis = useMemo(() => {
    const base = [
      {
        key: 'businesses',
        to: '/businesses',
        icon: PiBuildings,
        label: 'Businesses',
        value: stats.orgCount,
        sublabel: isSuperadmin
          ? `${stats.assignedCount} assigned · ${stats.unassignedCount} unassigned`
          : 'Organizations you can manage',
        tone: 'sky',
      },
      {
        key: 'products',
        to: '/products',
        icon: PiPackage,
        label: 'Products',
        value: stats.productTotal,
        sublabel: `${stats.productPublished} published · ${stats.productDraft} draft`,
        tone: 'emerald',
      },
      {
        key: 'inventory',
        to: '/inventory',
        icon: PiWarehouse,
        label: 'Inventory alerts',
        value: stats.inventoryAlertCount,
        sublabel: 'Low or out of stock',
        tone: stats.inventoryAlertCount > 0 ? 'amber' : 'zinc',
      },
      {
        key: 'rooms',
        to: '/hotel-rooms',
        icon: PiBed,
        label: 'Open rooms',
        value: stats.openRooms,
        sublabel:
          stats.closedRooms > 0
            ? `${stats.closedRooms} closed`
            : 'Available for booking',
        tone: 'sky',
      },
      {
        key: 'pending',
        to: '/hotel-rooms',
        icon: PiCalendarBlank,
        label: 'Pending reservations',
        value: stats.pendingCount,
        sublabel: 'Awaiting approval',
        tone: stats.pendingCount > 0 ? 'amber' : 'zinc',
      },
      {
        key: 'revenue',
        to: '/hotel-rooms',
        icon: PiCurrencyDollar,
        label: 'Confirmed booking value',
        value: formatPrice(stats.confirmedValue),
        sublabel: 'From confirmed stays',
        tone: 'emerald',
      },
    ]

    if (isSuperadmin) {
      base.splice(1, 0, {
        key: 'unassigned',
        to: '/businesses',
        icon: PiUsersThree,
        label: 'Unassigned businesses',
        value: stats.unassignedCount,
        sublabel: 'Need an admin assigned',
        tone: stats.unassignedCount > 0 ? 'rose' : 'zinc',
      })
    }

    return base
  }, [stats, isSuperadmin])

  const pendingRows = stats.pendingBookings.slice(0, ATTENTION_LIMIT)
  const alertRows = stats.inventoryAlerts.slice(0, ATTENTION_LIMIT)

  if (isLoading) {
    return <Loading message="Loading dashboard..." />
  }

  return (
    <FormFieldProvider rounded="rounded-xl">
      <div className="mx-auto w-full space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionTitle
            icon={PiCirclesFour}
            title={`Welcome back, ${displayName}`}
            description={subtitle}
          />
          <Button
            type="button"
            variant="outlined"
            onClick={() => void load()}
            className="h-10 px-4"
          >
            Refresh
          </Button>
        </div>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div
          className={cn(
            'grid gap-4',
            isSuperadmin
              ? 'sm:grid-cols-2 xl:grid-cols-4'
              : 'sm:grid-cols-2 xl:grid-cols-3',
          )}
        >
          {kpis.map((kpi) => (
            <KpiTile
              key={kpi.key}
              to={kpi.to}
              icon={kpi.icon}
              label={kpi.label}
              value={kpi.value}
              sublabel={kpi.sublabel}
              tone={kpi.tone}
            />
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
                Analytics
              </h2>
              <p className="mt-0.5 text-sm text-zinc-500">
                Charts matched to each metric for clearer reading.
              </p>
            </div>
            <PiChartBar className="icon size-5 text-zinc-300" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard
              title="Catalog by type"
              description="Businesses and products across verticals"
              icon={PiBuildings}
              tone="emerald"
              stat={stats.orgCount}
              className="lg:col-span-2"
              chartHeight="h-64"
            >
              {catalogByType.length === 0 ? (
                <ChartEmpty />
              ) : (
                <MultiLineChart
                  data={catalogByType}
                  series={[
                    {
                      dataKey: 'businesses',
                      name: 'Businesses',
                      color: CHART_COLORS.amber,
                    },
                    {
                      dataKey: 'products',
                      name: 'Products',
                      color: CHART_COLORS.teal,
                    },
                  ]}
                />
              )}
            </ChartCard>

            <ChartCard
              title="Products by status"
              description="Current product distribution"
              icon={PiPackage}
              tone="sky"
              stat={stats.productTotal}
              footer={<StatusGrid items={productsByStatus} />}
            >
              {productsByStatusChart.length === 0 ? (
                <ChartEmpty />
              ) : (
                <DonutChart data={productsByStatusChart} />
              )}
            </ChartCard>

            <ChartCard
              title="Inventory health"
              description="Current stock distribution"
              icon={PiWarehouse}
              tone="amber"
              stat={
                stats.inventoryInStock +
                stats.inventoryLow +
                stats.inventoryOut
              }
              footer={<StatusGrid items={inventoryHealth} />}
            >
              {inventoryHealthChart.length === 0 ? (
                <ChartEmpty label="No inventory records yet" />
              ) : (
                <DonutChart data={inventoryHealthChart} />
              )}
            </ChartCard>

            <ChartCard
              title="Rooms availability"
              description="Open vs closed lodging inventory"
              icon={PiBed}
              tone="emerald"
              stat={stats.openRooms + stats.closedRooms}
              footer={<StatusGrid items={roomsHealth} />}
            >
              {roomsHealthChart.length === 0 ? (
                <ChartEmpty label="No rooms yet" />
              ) : (
                <DonutChart data={roomsHealthChart} />
              )}
            </ChartCard>

            <ChartCard
              title="Reservations by status"
              description="Current reservation distribution"
              icon={PiCalendarBlank}
              tone="amber"
              stat={
                stats.bookingsPending +
                stats.bookingsConfirmed +
                stats.bookingsCancelled
              }
              footer={<StatusGrid items={bookingsByStatus} />}
            >
              {bookingsByStatusChart.length === 0 ? (
                <ChartEmpty label="No reservations yet" />
              ) : (
                <DonutChart data={bookingsByStatusChart} />
              )}
            </ChartCard>

            {isSuperadmin ? (
              <ChartCard
                title="Business assignment"
                description="How many businesses already have an admin"
                icon={PiUsersThree}
                tone="rose"
                stat={stats.orgCount}
                className="lg:col-span-2"
                footer={<StatusGrid items={assignmentChart} />}
              >
                {assignmentChartVisible.length === 0 ? (
                  <ChartEmpty />
                ) : (
                  <DonutChart data={assignmentChartVisible} />
                )}
              </ChartCard>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <AttentionPanel
            title="Pending reservations"
            icon={PiCalendarBlank}
            viewAllTo="/hotel-rooms"
            emptyLabel="No pending reservations."
          >
            {pendingRows.map((booking) => (
              <li key={booking.id}>
                <Link
                  to="/hotel-rooms"
                  className="flex items-start justify-between gap-3 px-5 py-3.5 transition hover:bg-zinc-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-900">
                      {booking.guestName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {booking.organizationName} ·{' '}
                      {formatDate(booking.checkIn)} →{' '}
                      {formatDate(booking.checkOut)}
                    </p>
                  </div>
                  <Badge tone="amber">Pending</Badge>
                </Link>
              </li>
            ))}
          </AttentionPanel>

          <AttentionPanel
            title="Inventory alerts"
            icon={PiWarning}
            viewAllTo="/inventory"
            emptyLabel="Stock levels look healthy."
          >
            {alertRows.map((row) => {
              const out = !row.inStock
              return (
                <li key={row.id}>
                  <Link
                    to="/inventory"
                    className="flex items-start justify-between gap-3 px-5 py-3.5 transition hover:bg-zinc-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-900">
                        {row.product?.name || 'Product'}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-zinc-500">
                        {row.organizationName} · {row.available} available
                      </p>
                    </div>
                    <Badge tone={out ? 'rose' : 'amber'}>
                      {out ? 'Out of stock' : 'Low stock'}
                    </Badge>
                  </Link>
                </li>
              )
            })}
          </AttentionPanel>
        </div>

        <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Quick links</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/businesses">
              <Button type="button" variant="outlined" className="h-10 gap-2 px-4">
                <PiBuildings className="icon size-4" />
                Businesses
              </Button>
            </Link>
            <Link to="/products">
              <Button type="button" variant="outlined" className="h-10 gap-2 px-4">
                <PiPackage className="icon size-4" />
                Products
              </Button>
            </Link>
            <Link to="/inventory">
              <Button type="button" variant="outlined" className="h-10 gap-2 px-4">
                <PiWarehouse className="icon size-4" />
                Inventory
              </Button>
            </Link>
            <Link to="/hotel-rooms">
              <Button type="button" variant="outlined" className="h-10 gap-2 px-4">
                <PiBed className="icon size-4" />
                Hotel rooms
              </Button>
            </Link>
          </div>
        </section>

        {stats.orgCount === 0 && !error ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-14 text-center">
            <PiBuildings className="icon mx-auto size-10 text-zinc-300" />
            <p className="mt-3 text-sm font-medium text-zinc-800">
              No businesses yet
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {isSuperadmin
                ? 'Create a business to start seeing platform metrics.'
                : 'Ask a superadmin to assign you to a business.'}
            </p>
            {isSuperadmin ? (
              <Link to="/businesses" className="mt-4 inline-flex">
                <Button type="button" className="h-10 gap-2 px-4">
                  <PiCheckCircle className="icon size-4" />
                  Go to businesses
                </Button>
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </FormFieldProvider>
  )
}
