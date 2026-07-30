import { Outlet } from 'react-router-dom'
import { LoginModal, SignupModal } from '@multi-tenants/auth'

const APP_ID = 'admin'

export default function AppShell() {
  return (
    <>
      <Outlet />
      <LoginModal appId={APP_ID} />
      <SignupModal />
    </>
  )
}
