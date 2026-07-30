import { createBrowserRouter } from 'react-router-dom'
import { ProtectedProvider, PublicProvider } from '@multi-tenants/auth'
import AppShell from '../layouts/app-shell'
import ProtectedLayout from '../layouts/protected-layout'
import PublicLayout from '../layouts/public-layout'
import NotFoundPage from '../pages/not-found'
import AboutPage from '../pages/public/about'
import LandingPage from '../pages/public/landing'
import OrganizationPage from '../pages/public/organization'
import RegisterPage from '../pages/public/register'
import LoginPage from '../pages/public/login'
import DashboardPage from '../pages/protected/dashboard'
import ProfilePage from '../pages/protected/profile'
import BusinessesPage from '../pages/protected/businesses'
import BusinessDetailPage from '../pages/protected/business-detail'
import ProductsPage from '../pages/protected/products'
import InventoryPage from '../pages/protected/inventory'
import HotelRoomsPage from '../pages/protected/hotel-rooms'
import UsersPage from '../pages/protected/users'

const APP_ID = 'superadmin'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        element: <PublicProvider appId={APP_ID} />,
        children: [
          {
            element: <PublicLayout />,
            children: [
              { index: true, element: <LandingPage /> },
              { path: 'about', element: <AboutPage /> },
              { path: 'organization/:type', element: <OrganizationPage /> },
            ],
          },
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },
      {
        element: <ProtectedProvider appId={APP_ID} />,
        children: [
          {
            element: <ProtectedLayout />,
            children: [
              { path: 'dashboard', element: <DashboardPage /> },
              { path: 'profile', element: <ProfilePage /> },
              { path: 'businesses', element: <BusinessesPage /> },
              { path: 'businesses/:id', element: <BusinessDetailPage /> },
              { path: 'products', element: <ProductsPage /> },
              { path: 'products/:status', element: <ProductsPage /> },
              { path: 'product', element: <ProductsPage /> },
              { path: 'product/overview', element: <ProductsPage /> },
              { path: 'inventory', element: <InventoryPage /> },
              { path: 'hotel-rooms', element: <HotelRoomsPage /> },
              { path: 'users', element: <UsersPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
