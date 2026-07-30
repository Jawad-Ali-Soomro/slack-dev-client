import { Outlet } from 'react-router-dom'
import { Footer, Header } from '@multi-tenants/ui'

export default function PublicLayout() {
  return (
    <div className="min-h-screen">
      <Header variant="superadmin" />
      <Outlet />
      <Footer />
    </div>
  )
}
