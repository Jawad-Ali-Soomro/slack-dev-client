import { PiBed, PiCubeDuotone, PiShoppingBag, PiUser } from 'react-icons/pi'

const iconClass = 'h-[1.15rem] w-[1.15rem]'

const sidebarItems = [
  {
    label: 'Profile',
    to: '/profile',
    icon: <PiUser className={`icon ${iconClass}`} />,
  },
  {
    label: 'Bookings',
    to: '/bookings',
    icon: <PiCubeDuotone className={`icon ${iconClass}`} />,
  },
  {
    label: 'Orders',
    to: '/orders',
    icon: <PiShoppingBag className={`icon ${iconClass}`} />,
  },
]

export default sidebarItems
