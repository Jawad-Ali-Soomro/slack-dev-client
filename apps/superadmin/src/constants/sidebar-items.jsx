import {
  PiBed,
  PiBriefcase,
  PiBuildings,
  PiChartBar,
  PiCirclesFour,
  PiCubeDuotone,
  PiGear,
  PiSealPercent,
  PiUsers,
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
    icon: <PiUsers className={`icon ${iconClass}`} />,
    items: [
      { label: 'Users', to: '/users' },
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
      { label: 'Reports', to: '/reports' },
      { label: 'Payouts', to: '/income/payouts' },
    ],
  },
  {
    label: 'Promote',
    to: '/promote',
    icon: <PiSealPercent className={`icon ${iconClass}`} />,
  },
  {
    label: 'Settings',
    to: '/profile',
    icon: <PiGear className={`icon ${iconClass}`} />,
  },
]

export default sidebarItems
