import { Outlet } from 'react-router-dom'
import { Sidebar, useSidebar } from '@multi-tenants/ui'
import sidebarItems from '../constants/sidebar-items'

export default function ProtectedLayout() {
  const { isCollapsed } = useSidebar()

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <Sidebar items={sidebarItems} />
      <main
        className={[
          'flex-1 p-8 transition-[padding] duration-200 ease-out',
          isCollapsed ? 'pl-24' : 'pl-72',
        ].join(' ')}
      >
        <Outlet />
      </main>
    </div>
  )
}
