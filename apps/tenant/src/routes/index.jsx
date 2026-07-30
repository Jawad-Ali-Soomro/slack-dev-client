import { Navigate } from 'react-router-dom'
import { createBrowserRouter } from 'react-router-dom'
import { ProtectedProvider, PublicProvider } from '@multi-tenants/auth'
import AppShell from '../layouts/app-shell'
import ProtectedLayout from '../layouts/protected-layout'
import PublicLayout from '../layouts/public-layout'
import NotFoundPage from '../pages/not-found'
import AboutPage from '../pages/public/about'
import LandingPage from '../pages/public/landing'
import ExplorePage from '../pages/public/explore'
import HotelsPage from '../pages/public/hotels'
import HostelsPage from '../pages/public/hostels'
import PharmacyPage from '../pages/public/pharmacy'
import OrganizationPage from '../pages/public/organization'
import ProductDetailPage from '../pages/public/product-detail'
import HotelDetailPage from '../pages/public/hotel-detail'
import CartPage from '../pages/public/cart'
import RegisterPage from '../pages/public/register'
import LoginPage from '../pages/public/login'
import ProfilePage from '../pages/protected/profile'
import BookingsPage from '../pages/protected/bookings'
import OrdersPage from '../pages/protected/orders'

const APP_ID = 'tenant'

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
              { path: 'explore', element: <ExplorePage /> },
              { path: 'hotels', element: <HotelsPage /> },
              { path: 'hostels', element: <HostelsPage /> },
              { path: 'pharmacy', element: <PharmacyPage /> },
              { path: 'about', element: <AboutPage /> },
              { path: 'organization/:type', element: <OrganizationPage /> },
              { path: 'hotels/:orgIdOrSlug', element: <HotelDetailPage /> },
              { path: 'products/:productId', element: <ProductDetailPage /> },
              { path: 'cart', element: <CartPage /> },
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
              { path: 'dashboard', element: <Navigate to="/profile" replace /> },
              { path: 'profile', element: <ProfilePage /> },
              { path: 'bookings', element: <BookingsPage /> },
              { path: 'orders', element: <OrdersPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
