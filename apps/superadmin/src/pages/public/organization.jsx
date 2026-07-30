import { Link, useParams } from 'react-router-dom'
import { organizationTypes } from '@multi-tenants/constants'

export default function OrganizationPage() {
  const { type } = useParams()
  const organization = organizationTypes.find((item) => item.slug === type)

  if (!organization) {
    return (
      <div className="mx-auto max-w-3xl py-40">
        <h1 className="text-3xl font-bold">Organization not found</h1>
        <Link to="/" className="mt-4 inline-block text-primary hover:underline">
          Go home
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl py-40">
      <h1 className="text-4xl font-bold">{organization.label}</h1>
      <p className="mt-4 text-gray-600">
        Organization page for {organization.label}.
      </p>
    </div>
  )
}
