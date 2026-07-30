import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PiArrowLeft, PiArrowRight, PiMagnifyingGlass } from 'react-icons/pi'
import { listPublicProductsRequest, unwrapPaginated } from '@multi-tenants/api'
import { exploreCategories } from '@multi-tenants/constants'
import { cn } from '@multi-tenants/utils'
import Button from '../button.jsx'
import {
  CATEGORY_ROUTES,
  mapProductToListing,
} from './explore-utils.js'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1920&q=80'

const CATEGORY_VISUALS = {
  hotels: {
    image:
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80',
    label: 'Hotels',
    route: CATEGORY_ROUTES.hotels,
  },
  hostels: {
    image:
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=900&q=80',
    label: 'Hostels',
    route: CATEGORY_ROUTES.hostels,
  },
  pharmacy: {
    image:
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80',
    label: 'Pharmacy',
    route: CATEGORY_ROUTES.pharmacy,
  },
  products: {
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    label: 'Shop',
    route: CATEGORY_ROUTES.products,
  },
}

const FEATURED_LOOKS = [
  {
    id: 'stay',
    handle: '@skyline.stays',
    image:
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    to: '/hotels',
  },
  {
    id: 'travel',
    handle: '@harbor.hostels',
    image:
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    to: '/hostels',
  },
  {
    id: 'care',
    handle: '@careplus.rx',
    image:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    to: '/pharmacy',
  },
]

function ProductTile({ item }) {
  return (
    <Link
      to={`/products/${item.id}`}
      className="group block text-end transition border-zinc-200 overflow-hidden pb-10"
    >
      <div className="aspect-square overflow-hidden bg-zinc-100 icon">
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover transition icon duration-700 group-hover:scale-[1.04]"
        />
      </div>
      <p className="mt-4 truncate uppercase text-sm font-medium tracking-wide text-zinc-900">
        {item.title}
      </p>
      <p className="mt-1 text-sm text-zinc-500">{item.price}</p>
    </Link>
  )
}

function ProductTileSkeleton() {
  return (
    <div className="animate-pulse text-center">
      <div className="aspect-square bg-zinc-200/80" />
      <div className="mx-auto mt-4 h-3 w-2/3 rounded bg-zinc-200/80" />
      <div className="mx-auto mt-2 h-3 w-1/3 rounded bg-zinc-200/80" />
    </div>
  )
}

function CategoryPill({ label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold tracking-wide text-zinc-900 shadow-sm transition group-hover:bg-zinc-50">
      {label}
      <span className="text-zinc-400">|</span>
      <span className="inline-flex items-center gap-1 text-zinc-600">
        See More
        <PiArrowRight className="icon size-3.5" />
      </span>
    </span>
  )
}

export default function ExploreLanding() {
  const [productsByType, setProductsByType] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [popularIndex, setPopularIndex] = useState(0)

  const loadCatalog = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const groups = await Promise.all(
        exploreCategories.map(async (category) => {
          const items = await listPublicProductsRequest({
            businessType: category.businessType,
            limit: 12,
            page: 1,
          })
          return [
            category.id,
            unwrapPaginated(items).items.map(mapProductToListing),
          ]
        }),
      )
      setProductsByType(Object.fromEntries(groups))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load marketplace',
      )
      setProductsByType({})
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCatalog()
  }, [loadCatalog])

  const allProducts = useMemo(() => {
    return exploreCategories.flatMap(
      (category) => productsByType[category.id] ?? [],
    )
  }, [productsByType])

  const gridProducts = allProducts.slice(0, 6)
  const popularProducts = allProducts.slice(0, 8)

  useEffect(() => {
    if (popularProducts.length <= 1) return undefined
    const timer = window.setInterval(() => {
      setPopularIndex((prev) => (prev + 1) % popularProducts.length)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [popularProducts.length])

  const popularItem =
    popularProducts[popularIndex] ?? popularProducts[0] ?? null

  return (
    <div className="marketplace-display overflow-x-hidden icon bg-white pb-24">
      {/* Hero — one composition */}
      <section className="relative isolate icon min-h-[92vh] w-full overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt=""
          className="absolute inset-0 icon rounded-none h-full icon w-full object-cover marketplace-kenburns"
        />
        <div className="absolute inset-0 bg-gradient-to-r icon w-full from-zinc-950/75 via-zinc-950/40 to-zinc-950/20" />
        <div className="relative z-10 mx-auto flex min-h-[92vh] w-full max-w-7xl flex-col icon justify-end px-6 pb-16 pt-36 md:pb-24">
          <p className="animate-hero-entry text-sm font-semibold tracking-[0.35em] text-white uppercase">
            Multi Tenants
          </p>
          <h1 className="animate-hero-entry animate-delay-150 mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl md:leading-[1.05]">
            Where stays meet essentials
          </h1>
          <p className="animate-hero-entry animate-delay-300 mt-4 max-w-md text-base text-zinc-200 md:text-lg">
            Hotels, hostels, pharmacy, and local shops — curated in one place.
          </p>
          <div className="animate-hero-entry animate-delay-450 mt-10 flex flex-wrap gap-3">
            <Link to="/explore">
              <Button className="h-12 rounded-full w-[200px] font-semibold">
                Explore all
              </Button>
            </Link>
            <Link to="/hotels">
              <Button
                variant="outlined"
                className="h-12 rounded-full w-[200px] border-white/40 bg-white/10 px-8 font-semibold text-white hover:bg-white/20"
              >
                Book a stay
              </Button>
            </Link>
          </div>
          <p className="mt-10 text-xs tracking-[0.2em] text-white/55 uppercase">
            Appear different · start a new stay
          </p>
        </div>
      </section>

      {/* Categories For You */}
      <section className="mx-auto w-full max-w-7xl px-6 pt-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
            Categories For You
          </h2>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
          >
            View All Categories
            <PiArrowRight className="icon size-4" />
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 lg:grid-rows-2 lg:gap-5">
          <Link
            to={CATEGORY_VISUALS.hotels.route}
            className="group relative min-h-[420px] overflow-hidden bg-zinc-100 lg:row-span-2"
          >
            <img
              src={CATEGORY_VISUALS.hotels.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/50 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5">
              <CategoryPill label={CATEGORY_VISUALS.hotels.label} />
            </div>
          </Link>

          <Link
            to={CATEGORY_VISUALS.hostels.route}
            className="group relative min-h-[200px] overflow-hidden bg-zinc-100"
          >
            <img
              src={CATEGORY_VISUALS.hostels.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/45 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5">
              <CategoryPill label={CATEGORY_VISUALS.hostels.label} />
            </div>
          </Link>

          <Link
            to={CATEGORY_VISUALS.pharmacy.route}
            className="group relative min-h-[200px] overflow-hidden bg-zinc-100"
          >
            <img
              src={CATEGORY_VISUALS.pharmacy.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/45 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5">
              <CategoryPill label={CATEGORY_VISUALS.pharmacy.label} />
            </div>
          </Link>
        </div>
      </section>

      {/* Product grid */}
      <section className="mx-auto w-full max-w-7xl px-6 pt-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
              Fresh listings
            </h2>
            <p className="mt-2 max-w-md text-sm text-zinc-500">
              Live shop and pharmacy products from verified businesses.
            </p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
          >
            View all
            <PiArrowRight className="icon size-4" />
          </Link>
        </div>

        {error ? (
          <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }, (_, i) => (
                <ProductTileSkeleton key={i} />
              ))
            : gridProducts.map((item) => (
                <ProductTile key={item.id} item={item} />
              ))}
        </div>

        {!isLoading && gridProducts.length === 0 ? (
          <p className="mt-8 text-center text-sm text-zinc-500">
            No published listings yet. Check back soon.
          </p>
        ) : null}
      </section>

      {/* Featured Collection */}
      <section className="mx-auto w-full max-w-7xl px-6 pt-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
              Featured Collection
            </h2>
            <p className="mt-2 max-w-lg text-sm text-zinc-500">
              Spotlight properties and care brands shaping the marketplace this
              season.
            </p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
          >
            View All Collections
            <PiArrowRight className="icon size-4" />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {FEATURED_LOOKS.map((look) => (
            <Link key={look.id} to={look.to} className="group block">
              <div className="aspect-[3/4] overflow-hidden bg-zinc-100">
                <img
                  src={look.image}
                  alt=""
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <p className="mt-4 text-center text-sm font-medium tracking-wide text-zinc-600">
                {look.handle}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular This Year */}
      <section className="mx-auto w-full max-w-7xl px-6 pt-20">
        <div className="grid items-stretch gap-8 lg:grid-cols-2">
          <div className="relative min-h-[480px] overflow-hidden bg-zinc-100">
            <img
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 to-transparent" />
          </div>

          <div className="flex flex-col justify-center px-2 py-6 lg:px-8">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
              Popular This Year
            </h2>
            <p className="mt-3 max-w-md text-sm text-zinc-500">
              Standout shop and pharmacy picks shoppers keep coming back to.
            </p>

            {popularItem ? (
              <div className="mt-10 flex items-center gap-4 border border-zinc-200 bg-zinc-50 p-4">
                <button
                  type="button"
                  aria-label="Previous popular listing"
                  onClick={() =>
                    setPopularIndex(
                      (prev) =>
                        (prev - 1 + popularProducts.length) %
                        popularProducts.length,
                    )
                  }
                  className="flex size-9 shrink-0 items-center justify-center border border-zinc-200 bg-white text-zinc-700 transition hover:border-zinc-900"
                >
                  <PiArrowLeft className="icon size-4" />
                </button>

                <Link
                  to={`/products/${popularItem.id}`}
                  className="flex min-w-0 flex-1 items-center gap-4"
                >
                  <div className="size-20 shrink-0 overflow-hidden bg-zinc-200">
                    <img
                      src={popularItem.image}
                      alt={popularItem.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-900">
                      {popularItem.title}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {popularItem.price}
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  aria-label="Next popular listing"
                  onClick={() =>
                    setPopularIndex(
                      (prev) => (prev + 1) % popularProducts.length,
                    )
                  }
                  className="flex size-9 shrink-0 items-center justify-center border border-zinc-200 bg-white text-zinc-700 transition hover:border-zinc-900"
                >
                  <PiArrowRight className="icon size-4" />
                </button>
              </div>
            ) : (
              <p className="mt-10 text-sm text-zinc-500">
                Popular picks will appear here once listings go live.
              </p>
            )}

            <Link to="/explore" className="mt-8 inline-flex w-fit">
              <Button className="h-11 rounded-full px-6 font-semibold">
                Browse explore
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
