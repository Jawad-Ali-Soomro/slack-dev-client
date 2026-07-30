import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PiArrowRight, PiBed, PiBuildings, PiMapPin, PiPackage } from 'react-icons/pi'
import { listPublicHotelsRequest, unwrapPaginated } from '@multi-tenants/api'
import {
  formatBusinessTypeLabel,
  isLodgingBusinessType,
} from '@multi-tenants/constants'
import { getAssetUrl } from '@multi-tenants/config'
import Button from '../button.jsx'
import Loading from '../loading.jsx'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'

export default function HotelDirectory({ businessType }) {
  const [hotels, setHotels] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const lodging = isLodgingBusinessType(businessType)

  useEffect(() => {
    if (!lodging) {
      setHotels([])
      setIsLoading(false)
      return
    }

    let cancelled = false
    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const rows = await listPublicHotelsRequest({
          businessType,
          page: 1,
          limit: 48,
        })
        if (!cancelled) setHotels(unwrapPaginated(rows).items)
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load hotels',
          )
          setHotels([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [businessType, lodging])

  if (!lodging) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-24 text-center">
        <PiPackage className="icon mx-auto size-12 text-zinc-300" />
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900">
          Browse {formatBusinessTypeLabel(businessType)}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Hotel booking is available for hotels and hostels. Explore listings
          from the marketplace home.
        </p>
        <Link to="/" className="mt-6 inline-flex">
          <Button className="gap-2 px-5">Back to marketplace</Button>
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return <Loading message="Loading hotels..." />
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 pb-20 pt-28">
      <p className="text-sm font-semibold tracking-[0.2em] text-emerald-700 uppercase">
        Book a stay
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
        {formatBusinessTypeLabel(businessType)}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-500 md:text-base">
        Choose a property, pick your dates, and select available rooms.
      </p>

      {error ? (
        <p className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {hotels.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center">
          <PiBuildings className="icon mx-auto size-10 text-zinc-300" />
          <p className="mt-3 text-sm font-medium text-zinc-800">
            No properties listed yet
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Lodging businesses will appear here once they are active.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {hotels.map((hotel) => {
            const cover = hotel.logo?.url
              ? getAssetUrl(hotel.logo.url)
              : FALLBACK_IMAGE
            const location = [hotel.city, hotel.country]
              .filter(Boolean)
              .join(', ')

            return (
              <Link
                key={hotel.id}
                to={`/hotels/${hotel.slug || hotel.id}`}
                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:border-primary/40"
              >
                <div className="aspect-[16/10] overflow-hidden bg-zinc-100">
                  <img
                    src={cover}
                    alt={hotel.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-3 p-5">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900">
                      {hotel.name}
                    </h2>
                    {location ? (
                      <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-zinc-500">
                        <PiMapPin className="icon size-4" />
                        {location}
                      </p>
                    ) : null}
                  </div>
                  {hotel.description ? (
                    <p className="line-clamp-2 text-sm text-zinc-500">
                      {hotel.description}
                    </p>
                  ) : null}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <p className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600">
                      <PiBed className="icon size-4" />
                      {hotel.roomCount ?? 0} rooms · {hotel.floorCount ?? 0}{' '}
                      floors
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      View
                      <PiArrowRight className="icon size-4" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
