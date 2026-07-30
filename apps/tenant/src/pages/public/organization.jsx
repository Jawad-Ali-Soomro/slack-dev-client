import { Navigate, useParams } from 'react-router-dom'
import { PropertyListing, CatalogListing } from '@multi-tenants/ui'
import { organizationTypes } from '@multi-tenants/constants'

const ROUTE_REDIRECTS = {
  'hotel-management': '/hotels',
  'hostel-management': '/hostels',
  pharmacy: '/pharmacy',
  'e-commerce': '/explore',
}

export default function OrganizationPage() {
  const { type } = useParams()
  const organization = organizationTypes.find((item) => item.slug === type)

  if (!organization) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">Not found</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Unknown organization type.
        </p>
      </div>
    )
  }

  const redirectTo = ROUTE_REDIRECTS[organization.slug]
  if (redirectTo) {
    return <Navigate to={redirectTo} replace />
  }

  if (
    organization.slug === 'hotel-management' ||
    organization.slug === 'hostel-management'
  ) {
    return <PropertyListing businessType={organization.slug} />
  }

  return (
    <CatalogListing
      title={organization.label}
      description={`Browse live listings from ${organization.label.toLowerCase()} businesses.`}
      businessType={organization.slug}
    />
  )
}
