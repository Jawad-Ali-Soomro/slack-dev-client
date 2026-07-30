import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  PiBed,
  PiBuildings,
  PiCalendarBlank,
  PiCaretDown,
  PiCubeDuotone,
  PiHouseLine,
  PiMagnifyingGlass,
  PiMapPin,
  PiMinus,
  PiPlus,
  PiUser,
  PiX,
} from 'react-icons/pi'
import {
  getPublicHotelFiltersRequest,
  listPublicHotelsRequest,
  unwrapPaginated,
} from '@multi-tenants/api'
import {
  formatBusinessTypeLabel,
  isLodgingBusinessType,
} from '@multi-tenants/constants'
import { getAssetUrl } from '@multi-tenants/config'
import { cn } from '@multi-tenants/utils'
import Button from '../button.jsx'
import Pagination from './pagination.jsx'
import { FALLBACK_PROPERTY_IMAGE, CATALOG_PAGE_SIZE } from './explore-utils.js'

const HERO_BY_TYPE = {
  'hotel-management':
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80',
  'hostel-management':
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1920&q=80',
}

const BANNER_ICONS = {
  'hotel-management': PiBuildings,
  'hostel-management': PiHouseLine,
}

const EMPTY_META = {
  page: 1,
  limit: CATALOG_PAGE_SIZE,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function addDaysISO(iso, days) {
  const date = new Date(`${iso}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function formatDisplayDate(iso) {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(`${iso}T00:00:00`))
  } catch {
    return iso
  }
}

function Stepper({ label, value, min = 0, max = 16, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm font-medium text-zinc-800">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex size-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <PiMinus className="icon size-3.5" />
        </button>
        <span className="w-6 text-center text-sm font-semibold tabular-nums text-zinc-900">
          {value}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="flex size-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <PiPlus className="icon size-3.5" />
        </button>
      </div>
    </div>
  )
}

function PropertySearchBar({
  destination,
  onDestinationChange,
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  adults,
  childrenCount,
  rooms,
  onAdultsChange,
  onChildrenChange,
  onRoomsChange,
  citySuggestions = [],
  onSearch,
  isSearching = false,
  compact = false,
}) {
  const [occupancyOpen, setOccupancyOpen] = useState(false)
  const [destFocused, setDestFocused] = useState(false)
  const occupancyRef = useRef(null)

  useEffect(() => {
    if (!occupancyOpen) return undefined
    function handleClick(event) {
      if (!occupancyRef.current?.contains(event.target)) {
        setOccupancyOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [occupancyOpen])

  const occupancyLabel = `${adults} adult${adults === 1 ? '' : 's'} · ${childrenCount} ${
    childrenCount === 1 ? 'child' : 'children'
  } · ${rooms} room${rooms === 1 ? '' : 's'}`

  const filteredCities = useMemo(() => {
    const q = destination.trim().toLowerCase()
    if (!q) return citySuggestions.slice(0, 8)
    return citySuggestions
      .filter((city) => city.toLowerCase().includes(q))
      .slice(0, 8)
  }, [citySuggestions, destination])

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        setOccupancyOpen(false)
        onSearch?.()
      }}
      className={cn(
        'property-search-bar relative z-20 w-full rounded-xl p-5 border-amber-400 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.28)]',
        compact ? 'animate-hero-entry' : 'animate-hero-entry animate-delay-300',
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        {/* Destination */}
        <div className="relative min-w-0 flex-1 border-b border-zinc-200 lg:border-b-0 lg:border-r">
          <label className="flex cursor-text items-center gap-3 px-4 py-3.5 sm:px-5 sm:py-4">
            <PiCubeDuotone className="icon size-5 shrink-0 text-zinc-400" />
            <span className="min-w-0 flex-1">
             
              <input
                type="text"
                value={destination}
                onChange={(event) => onDestinationChange(event.target.value)}
                onFocus={() => setDestFocused(true)}
                onBlur={() => {
                  window.setTimeout(() => setDestFocused(false), 150)
                }}
                placeholder="Where are you going?"
                className="mt-0.5 w-full bg-transparent text-[15px] font-semibold text-zinc-900 outline-none placeholder:font-medium placeholder:text-zinc-800"
                autoComplete="off"
                aria-label="Destination"
              />
            </span>
            {destination ? (
              <button
                type="button"
                aria-label="Clear destination"
                onClick={() => onDestinationChange('')}
                className="text-zinc-400 transition hover:text-zinc-700"
              >
                <PiX className="icon size-4" />
              </button>
            ) : null}
          </label>

          {destFocused && filteredCities.length > 0 ? (
            <ul className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-xl">
              {filteredCities.map((city) => (
                <li key={city}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-zinc-800 transition hover:bg-zinc-50"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onDestinationChange(city)
                      setDestFocused(false)
                    }}
                  >
                    <PiMapPin className="icon size-4 text-zinc-400" />
                    {city}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Dates */}
        <div className="relative min-w-0 flex-[1.15] border-b border-zinc-200 lg:border-b-0 lg:border-r">
          <div className="flex w-full items-center gap-3 px-4 py-3.5 sm:px-5 sm:py-4">
            <PiCalendarBlank className="icon size-5 shrink-0 text-zinc-400" />
            <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2 sm:gap-3">
              <label className="min-w-0">
               
                <input
                  type="date"
                  value={checkIn}
                  min={todayISO()}
                  onChange={(event) => {
                    const next = event.target.value
                    onCheckInChange(next)
                    if (checkOut && next >= checkOut) {
                      onCheckOutChange(addDaysISO(next, 1))
                    }
                  }}
                  className="mt-0.5 w-full bg-transparent text-[15px] font-semibold text-zinc-900 outline-none"
                  aria-label="Check-in date"
                />
              </label>
              <label className="min-w-0">
              
                <input
                  type="date"
                  value={checkOut}
                  min={addDaysISO(checkIn || todayISO(), 1)}
                  onChange={(event) => onCheckOutChange(event.target.value)}
                  className="mt-0.5 w-full bg-transparent text-[15px] font-semibold text-zinc-900 outline-none"
                  aria-label="Check-out date"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Occupancy */}
        <div ref={occupancyRef} className="relative min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setOccupancyOpen((open) => !open)}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left sm:px-5 sm:py-4"
            aria-expanded={occupancyOpen}
          >
            <PiUser className="icon size-5 shrink-0 text-zinc-400" />
            <span className="min-w-0 flex-1">
             
              <span className="mt-0.5 block truncate text-[15px] font-semibold text-zinc-900">
                {occupancyLabel}
              </span>
            </span>
            <PiCaretDown
              className={cn(
                'icon size-4 shrink-0 text-zinc-400 transition',
                occupancyOpen && 'rotate-180',
              )}
            />
          </button>

          {occupancyOpen ? (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl sm:left-auto sm:right-0 sm:w-72">
              <Stepper
                label="Adults"
                value={adults}
                min={1}
                max={16}
                onChange={onAdultsChange}
              />
              <Stepper
                label="Children"
                value={childrenCount}
                min={0}
                max={10}
                onChange={onChildrenChange}
              />
              <Stepper
                label="Rooms"
                value={rooms}
                min={1}
                max={8}
                onChange={onRoomsChange}
              />
              <Button
                type="button"
                variant="outlined"
                className="mt-3 h-10 w-full rounded-lg px-4 text-sm"
                onClick={() => setOccupancyOpen(false)}
              >
                Done
              </Button>
            </div>
          ) : null}
        </div>

        {/* Search */}
        <div className="shrink-0 p-2 sm:p-2.5">
          <button
            type="submit"
            disabled={isSearching}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 text-base font-semibold text-white transition hover:bg-primary-dark disabled:opacity-70 lg:h-full lg:min-w-[140px]"
          >
            <PiMagnifyingGlass className="icon size-5" />
            {isSearching ? 'Searching…' : 'Search'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default function PropertyListing({ businessType }) {
  const lodging = isLodgingBusinessType(businessType)
  const title = formatBusinessTypeLabel(businessType)
  const shortTitle =
    businessType === 'hostel-management' ? 'Hostels' : 'Hotels'
  const heroImage = HERO_BY_TYPE[businessType] ?? FALLBACK_PROPERTY_IMAGE
  const BannerIcon = BANNER_ICONS[businessType] || PiBuildings

  const [searchParams, setSearchParams] = useSearchParams()
  const resultsRef = useRef(null)

  const initialSearched = searchParams.get('searched') === '1'

  const [destination, setDestination] = useState(
    () => searchParams.get('q') || searchParams.get('city') || '',
  )
  const [checkIn, setCheckIn] = useState(
    () => searchParams.get('checkIn') || todayISO(),
  )
  const [checkOut, setCheckOut] = useState(
    () => searchParams.get('checkOut') || addDaysISO(todayISO(), 2),
  )
  const [adults, setAdults] = useState(() =>
    Math.max(1, Number(searchParams.get('adults')) || 2),
  )
  const [childrenCount, setChildrenCount] = useState(() =>
    Math.max(0, Number(searchParams.get('children')) || 0),
  )
  const [rooms, setRooms] = useState(() =>
    Math.max(1, Number(searchParams.get('rooms')) || 1),
  )

  const [hasSearched, setHasSearched] = useState(initialSearched)
  const [applied, setApplied] = useState(() =>
    initialSearched
      ? {
          q: searchParams.get('q') || '',
          city: searchParams.get('city') || '',
          checkIn: searchParams.get('checkIn') || todayISO(),
          checkOut: searchParams.get('checkOut') || addDaysISO(todayISO(), 2),
          adults: Math.max(1, Number(searchParams.get('adults')) || 2),
          children: Math.max(0, Number(searchParams.get('children')) || 0),
          rooms: Math.max(1, Number(searchParams.get('rooms')) || 1),
        }
      : null,
  )

  const [page, setPage] = useState(1)
  const [hotels, setHotels] = useState([])
  const [meta, setMeta] = useState(EMPTY_META)
  const [filterOptions, setFilterOptions] = useState({
    cities: [],
    countries: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!lodging) return undefined
    let cancelled = false
    async function loadFilters() {
      try {
        const data = await getPublicHotelFiltersRequest(businessType)
        if (!cancelled) {
          setFilterOptions({
            cities: data?.cities ?? [],
            countries: data?.countries ?? [],
          })
        }
      } catch {
        /* keep defaults */
      }
    }
    void loadFilters()
    return () => {
      cancelled = true
    }
  }, [businessType, lodging])

  const load = useCallback(async () => {
    if (!lodging || !applied) {
      setHotels([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const cityMatch = filterOptions.cities.find(
        (city) => city.toLowerCase() === applied.q.trim().toLowerCase(),
      )
      const result = unwrapPaginated(
        await listPublicHotelsRequest({
          businessType,
          q: applied.q || undefined,
          city: applied.city || cityMatch || undefined,
          sort: 'name',
          page,
          limit: CATALOG_PAGE_SIZE,
        }),
      )
      setHotels(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load properties',
      )
      setHotels([])
      setMeta(EMPTY_META)
    } finally {
      setIsLoading(false)
    }
  }, [applied, businessType, filterOptions.cities, lodging, page])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!hasSearched || !applied) return
    window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }, [hasSearched, applied, page])

  function handleSearch() {
    if (!destination.trim()) {
      setError('Enter a destination to search')
      return
    }
    if (!checkIn || !checkOut) {
      setError('Please select check-in and check-out dates')
      return
    }
    if (checkOut <= checkIn) {
      setError('Check-out must be after check-in')
      return
    }

    const next = {
      q: destination.trim(),
      city: '',
      checkIn,
      checkOut,
      adults,
      children: childrenCount,
      rooms,
    }

    const cityMatch = filterOptions.cities.find(
      (city) => city.toLowerCase() === next.q.toLowerCase(),
    )
    if (cityMatch) {
      next.city = cityMatch
    }

    setError('')
    setPage(1)
    setApplied(next)
    setHasSearched(true)

    const params = new URLSearchParams()
    params.set('searched', '1')
    if (next.q) params.set('q', next.q)
    if (next.city) params.set('city', next.city)
    params.set('checkIn', next.checkIn)
    params.set('checkOut', next.checkOut)
    params.set('adults', String(next.adults))
    params.set('children', String(next.children))
    params.set('rooms', String(next.rooms))
    setSearchParams(params, { replace: true })
  }

  function hotelDetailTo(hotel) {
    const params = new URLSearchParams()
    if (applied?.checkIn) params.set('checkIn', applied.checkIn)
    if (applied?.checkOut) params.set('checkOut', applied.checkOut)
    if (applied?.adults) params.set('adults', String(applied.adults))
    if (applied?.children != null) {
      params.set('children', String(applied.children))
    }
    if (applied?.rooms) params.set('rooms', String(applied.rooms))
    const query = params.toString()
    return `/hotels/${hotel.slug || hotel.id}${query ? `?${query}` : ''}`
  }

  if (!lodging) return null

  const searchBarProps = {
    destination,
    onDestinationChange: setDestination,
    checkIn,
    checkOut,
    onCheckInChange: setCheckIn,
    onCheckOutChange: setCheckOut,
    adults,
    childrenCount,
    rooms,
    onAdultsChange: setAdults,
    onChildrenChange: setChildrenCount,
    onRoomsChange: setRooms,
    citySuggestions: filterOptions.cities,
    onSearch: handleSearch,
    isSearching: isLoading && hasSearched,
  }

  return (
    <div className="marketplace-display overflow-x-hidden bg-white pb-24">
      <section
        className={cn(
          'relative isolate w-full overflow-hidden',
          hasSearched ? 'min-h-[52vh]' : 'min-h-[88vh]',
        )}
      >
        <img
          src={heroImage}
          alt=""
          className="marketplace-kenburns absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-slate-900/45 to-slate-950/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(39,189,144,0.18),_transparent_55%)]" />

        <div
          className={cn(
            'relative z-10 mx-auto flex w-full max-w-6xl flex-col px-4 sm:px-6',
            hasSearched
              ? 'justify-end pb-10 pt-28'
              : 'min-h-[88vh] justify-center py-24',
          )}
        >
          <div className={cn(!hasSearched && 'mb-10 text-center')}>
            <p className="animate-hero-entry inline-flex items-center gap-2 text-xs font-semibold tracking-[0.28em] text-white/70 uppercase">
              <BannerIcon className="icon size-4" />
              {shortTitle}
            </p>
            <h1
              className={cn(
                'animate-hero-entry animate-delay-150 mt-4 font-semibold tracking-tight text-white',
                hasSearched
                  ? 'text-3xl md:text-4xl'
                  : 'text-4xl md:text-6xl md:leading-[1.05]',
              )}
            >
              {hasSearched
                ? `Find your next ${shortTitle.toLowerCase().slice(0, -1)}`
                : `Where to next?`}
            </h1>
            {!hasSearched ? (
              <p className="animate-hero-entry animate-delay-300 mx-auto mt-4 max-w-xl text-base text-zinc-200 md:text-lg">
                Search {title.toLowerCase()} by destination, pick your dates,
                and book open rooms in minutes.
              </p>
            ) : null}
          </div>

          <PropertySearchBar {...searchBarProps} compact={hasSearched} />

          {error && !hasSearched ? (
            <p className="animate-hero-entry mt-4 rounded-lg border border-red-200/40 bg-red-950/40 px-4 py-3 text-center text-sm text-red-100 backdrop-blur-sm">
              {error}
            </p>
          ) : null}
        </div>
      </section>

      {hasSearched ? (
        <section
          ref={resultsRef}
          className="mx-auto w-full max-w-7xl scroll-mt-8 px-6 pt-12"
        >
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
                Available {shortTitle.toLowerCase()}
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                {applied?.q
                  ? `Results near “${applied.q}”`
                  : `All ${shortTitle.toLowerCase()}`}
                {applied?.checkIn && applied?.checkOut
                  ? ` · ${formatDisplayDate(applied.checkIn)} – ${formatDisplayDate(applied.checkOut)}`
                  : ''}
                {` · ${applied?.adults ?? 2} adult${(applied?.adults ?? 2) === 1 ? '' : 's'}`}
                {applied?.rooms
                  ? ` · ${applied.rooms} room${applied.rooms === 1 ? '' : 's'}`
                  : ''}
              </p>
            </div>
            {!isLoading ? (
              <p className="text-xs font-medium tracking-[0.18em] text-zinc-400 uppercase">
                {meta.total} propert{meta.total === 1 ? 'y' : 'ies'}
              </p>
            ) : null}
          </div>

          {error ? (
            <p className="mb-8 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {isLoading ? (
            <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="aspect-[4/5] bg-zinc-200/80" />
                  <div className="mt-4 h-4 w-2/3 rounded bg-zinc-200/80" />
                  <div className="mt-2 h-3 w-1/3 rounded bg-zinc-200/70" />
                </div>
              ))}
            </div>
          ) : hotels.length === 0 ? (
            <div className="border border-dashed border-zinc-200 px-6 py-20 text-center">
              <PiBuildings className="icon mx-auto size-10 text-zinc-300" />
              <p className="mt-3 text-sm font-medium text-zinc-800">
                No {shortTitle.toLowerCase()} match this search
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Try another destination or clear the location and search again.
              </p>
            </div>
          ) : (
            <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
              {hotels.map((hotel, index) => {
                const cover = hotel.logo?.url
                  ? getAssetUrl(hotel.logo.url)
                  : FALLBACK_PROPERTY_IMAGE
                const location = [hotel.city, hotel.country]
                  .filter(Boolean)
                  .join(', ')

                return (
                  <Link
                    key={hotel.id}
                    to={hotelDetailTo(hotel)}
                    className="group block animate-hero-entry"
                    style={{
                      animationDelay: `${Math.min(index, 8) * 60}ms`,
                    }}
                  >
                    <div className="aspect-[4/5] overflow-hidden bg-zinc-100">
                      <img
                        src={cover}
                        alt={hotel.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="mt-4 space-y-1.5">
                      <h3 className="text-base font-semibold tracking-wide text-zinc-900">
                        {hotel.name}
                      </h3>
                      {location ? (
                        <p className="inline-flex items-center gap-1.5 text-sm text-zinc-500">
                          <PiMapPin className="icon size-3.5" />
                          {location}
                        </p>
                      ) : null}
                      <p className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                        <PiBed className="icon size-3.5" />
                        {hotel.openRoomCount ?? hotel.roomCount ?? 0} rooms open
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            limit={meta.limit}
            onPageChange={setPage}
          />
        </section>
      ) : null}
    </div>
  )
}
