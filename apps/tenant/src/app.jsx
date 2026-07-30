import { RouterProvider } from 'react-router-dom'
import {
  AuthModalProvider,
  AuthProvider,
  UserProvider,
} from '@multi-tenants/auth'
import { SidebarProvider, CartProvider } from '@multi-tenants/ui'
import { router } from './routes'

export default function App() {
  return (
    <AuthProvider>
      <AuthModalProvider>
        <UserProvider>
          <SidebarProvider>
            <CartProvider>
              <RouterProvider router={router} />
            </CartProvider>
          </SidebarProvider>
        </UserProvider>
      </AuthModalProvider>
    </AuthProvider>
  )
}
