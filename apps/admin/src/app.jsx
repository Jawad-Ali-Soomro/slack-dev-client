import { RouterProvider } from 'react-router-dom'
import {
  AuthModalProvider,
  AuthProvider,
  UserProvider,
} from '@multi-tenants/auth'
import { SidebarProvider } from '@multi-tenants/ui'
import { router } from './routes'

export default function App() {
  return (
    <AuthProvider>
      <AuthModalProvider>
        <UserProvider>
          <SidebarProvider>
            <RouterProvider router={router} />
          </SidebarProvider>
        </UserProvider>
      </AuthModalProvider>
    </AuthProvider>
  )
}
