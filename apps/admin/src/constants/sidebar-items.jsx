import {
  PiBed,
  PiBriefcase,
  PiBuildings,
  PiChartBar,
  PiCirclesFour,
  PiCubeDuotone,
  PiSealPercent,
  PiUser,
  PiWallet,
  PiWarehouse,
} from 'react-icons/pi'
import { PRODUCT_STATUS_OPTIONS } from '@multi-tenants/constants'

const iconClass = 'h-[1.15rem] w-[1.15rem]'

const statusItems = [
  { label: 'All products', to: '/products', end: true },
  ...PRODUCT_STATUS_OPTIONS.map((item) => ({
    label: item.label,
    to: `/products/${item.value}`,
    end: true,
  })),
]

const sidebarItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: <PiCirclesFour className={`icon ${iconClass}`} />,
  },
  {
    label: 'Businesses',
    to: '/businesses',
    icon: <PiBuildings className={`icon ${iconClass}`} />,
  },
  {
    label: 'Products',
    icon: <PiBriefcase className={`icon ${iconClass}`} />,
    items: statusItems,
  },
  {
    label: 'Inventory',
    to: '/inventory',
    icon: <PiWarehouse className={`icon ${iconClass}`} />,
  },
  {
    label: 'Hotel rooms',
    to: '/hotel-rooms',
    icon: <PiCubeDuotone className={`icon ${iconClass}`} />,
  },
  {
    label: 'Customers',
    icon: <PiUser className={`icon ${iconClass}`} />,
    items: [
      { label: 'All customers', to: '/customers' },
      { label: 'Segments', to: '/customers/segments' },
    ],
  },
  {
    label: 'Shop',
    to: '/shop',
    icon: <PiWallet className={`icon ${iconClass}`} />,
  },
  {
    label: 'Income',
    icon: <PiChartBar className={`icon ${iconClass}`} />,
    items: [
      { label: 'Earnings', to: '/income' },
      { label: 'Payouts', to: '/income/payouts' },
    ],
  },
  {
    label: 'Promote',
    to: '/promote',
    icon: <PiSealPercent className={`icon ${iconClass}`} />,
  },
]

export default sidebarItems
