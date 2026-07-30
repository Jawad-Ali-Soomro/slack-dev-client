import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PiFirstAidKit,
  PiPackage,
  PiShoppingBag,
} from 'react-icons/pi'
import {
  getPublicCatalogFiltersRequest,
  listPublicProductsRequest,
  unwrapPaginated,
} from '@multi-tenants/api'
import { exploreCategories, formatBusinessTypeLabel } from '@multi-tenants/constants'
import Pagination from './pagination.jsx'
import ListingBanner from './listing-banner.jsx'
import {
  MarketplaceFilterDropdown,
  MarketplaceFilterLabel,
  MarketplaceFiltersModal,
  MarketplaceSearchBar,
  marketplaceFilterInputClass,
  useFiltersModal,
} from './marketplace-filters.jsx'
import { mapProductToListing, CATALOG_PAGE_SIZE } from './explore-utils.js'

const BANNER_ICONS = {
  pharmacy: PiFirstAidKit,
  'e-commerce': PiShoppingBag,
  default: PiPackage,
}

const SORT_LABELS = {
  featured: 'Featured',
  newest: 'Newest',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  name: 'Name A–Z',
}

const EMPTY_META = {
  page: 1,
  limit: CATALOG_PAGE_SIZE,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
}

function defaultFilters(businessType) {
  return {
    q: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: 'featured',
    featured: false,
    type: businessType || '',
  }
}

function ProductTile({ item }) {
  return (
    <Link
      to={`/products/${item.id}`}
      className="group block text-end transition border-zinc-200 overflow-hidden pb-10"
    >
      <div className="relative aspect-square overflow-hidden bg-zinc-100 icon">
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover transition icon duration-700 group-hover:scale-[1.04]"
        />
        {!item.inStock ? (
          <span className="absolute left-3 top-3 bg-zinc-950 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase">
            Out of stock
          </span>
        ) : null}
      </div>
      <p className="mt-4 truncate text-sm font-medium tracking-wide text-zinc-900 uppercase">
        {item.title}
      </p>
      <p className="mt-1 text-sm text-zinc-500">{item.price}</p>
    </Link>
  )
}

function ListingSkeleton({ count = 9 }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square bg-zinc-200/80" />
          <div className="mx-auto mt-4 h-3 w-2/3 bg-zinc-200/80" />
          <div className="mx-auto mt-2 h-3 w-1/3 bg-zinc-200/80" />
        </div>
      ))}
    </div>
  )
}

export default function CatalogListing({
  title,
  description,
  businessType,
  heroImage =
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
}) {
  const BannerIcon = BANNER_ICONS[businessType] || BANNER_ICONS.default

  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(() => defaultFilters(businessType))
  const [page, setPage] = useState(1)
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState(EMPTY_META)
  console.log(meta)
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    businessTypes: [],
    price: { min: 0, max: 0 },
    sortOptions: Object.keys(SORT_LABELS),
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const filterModal = useFiltersModal(filters, defaultFilters(businessType))

  const activeBusinessType = businessType || filters.type || undefined

  useEffect(() => {
    let cancelled = false
    async function loadFilters() {
      try {
        const data = await getPublicCatalogFiltersRequest(businessType)
        if (!cancelled) setFilterOptions(data)
      } catch {
        /* keep defaults */
      }
    }
    void loadFilters()
    return () => {
      cancelled = true
    }
  }, [businessType])

  const load = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const result = unwrapPaginated(
        await listPublicProductsRequest({
          businessType: activeBusinessType,
          q: filters.q || undefined,
          category: filters.category || undefined,
          minPrice: filters.minPrice !== '' ? Number(filters.minPrice) : undefined,
          maxPrice: filters.maxPrice !== '' ? Number(filters.maxPrice) : undefined,
          sort: filters.sort || 'featured',
          featured: filters.featured || undefined,
          page,
          limit: CATALOG_PAGE_SIZE,
        }),
      )
      setItems(result.items.map(mapProductToListing))
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listings')
      setItems([])
      setMeta(EMPTY_META)
    } finally {
      setIsLoading(false)
    }
  }, [activeBusinessType, filters, page])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (page > 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [page])

  const countLabel = useMemo(() => {
    if (isLoading) return 'Loading…'
    return `${meta.total} listing${meta.total === 1 ? '' : 's'}`
  }, [isLoading, meta.total])

  function applySearch(event) {
    event.preventDefault()
    setPage(1)
    setFilters((prev) => ({ ...prev, q: query.trim() }))
  }

  function updateDraft(key, value) {
    filterModal.setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function applyModalFilters() {
    setPage(1)
    setFilters(filterModal.draft)
    filterModal.close()
  }

  function clearModalFilters() {
    const reset = defaultFilters(businessType)
    filterModal.resetDraft()
    setQuery('')
    setPage(1)
    setFilters(reset)
    filterModal.close()
  }

  return (
    <div className="marketplace-display bg-white pb-24 icon">

      <section className="mx-auto w-full max-w-7xl px-6 pt-10 mt-20">
        <MarketplaceSearchBar
          query={query}
          onQueryChange={setQuery}
          onSubmit={applySearch}
          placeholder={`Search ${title.toLowerCase()}…`}
          onOpenFilters={filterModal.open}
        />

        <MarketplaceFiltersModal
          isOpen={filterModal.isOpen}
          onClose={filterModal.close}
          onApply={applyModalFilters}
          onClear={clearModalFilters}
          title="Filter listings"
        >
          {!businessType ? (
            <MarketplaceFilterLabel label="Type">
              <MarketplaceFilterDropdown
                value={filterModal.draft.type}
                onChange={(value) => updateDraft('type', value)}
                placeholder="All types"
                options={[
                  { value: '', label: 'All types' },
                  ...exploreCategories.map((cat) => ({
                    value: cat.businessType,
                    label: cat.label,
                  })),
                ]}
              />
            </MarketplaceFilterLabel>
          ) : null}

          <MarketplaceFilterLabel label="Category">
            <MarketplaceFilterDropdown
              value={filterModal.draft.category}
              onChange={(value) => updateDraft('category', value)}
              placeholder="All categories"
              options={[
                { value: '', label: 'All categories' },
                ...filterOptions.categories.map((cat) => ({
                  value: cat.slug,
                  label: cat.name,
                })),
              ]}
            />
          </MarketplaceFilterLabel>

          <MarketplaceFilterLabel label="Min price">
            <input
              type="number"
              min="0"
              step="0.01"
              value={filterModal.draft.minPrice}
              placeholder={
                filterOptions.price?.min != null
                  ? String(filterOptions.price.min)
                  : '0'
              }
              onChange={(event) => updateDraft('minPrice', event.target.value)}
              className={marketplaceFilterInputClass}
            />
          </MarketplaceFilterLabel>

          <MarketplaceFilterLabel label="Max price">
            <input
              type="number"
              min="0"
              step="0.01"
              value={filterModal.draft.maxPrice}
              placeholder={
                filterOptions.price?.max != null
                  ? String(filterOptions.price.max)
                  : '0'
              }
              onChange={(event) => updateDraft('maxPrice', event.target.value)}
              className={marketplaceFilterInputClass}
            />
          </MarketplaceFilterLabel>

          <MarketplaceFilterLabel label="Sort">
            <MarketplaceFilterDropdown
              value={filterModal.draft.sort}
              onChange={(value) => updateDraft('sort', value)}
              placeholder="Sort by"
              options={(filterOptions.sortOptions?.length
                ? filterOptions.sortOptions
                : Object.keys(SORT_LABELS)
              ).map((key) => ({
                value: key,
                label: SORT_LABELS[key] || key,
              }))}
            />
          </MarketplaceFilterLabel>

          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={filterModal.draft.featured}
              onChange={(event) =>
                updateDraft('featured', event.target.checked)
              }
              className="size-4 border border-zinc-300"
            />
            Featured only
          </label>
        </MarketplaceFiltersModal>

        {activeBusinessType && !businessType ? (
          <p className="mt-4 text-xs text-zinc-500">
            Filtered by {formatBusinessTypeLabel(activeBusinessType)}
          </p>
        ) : null}

        {error ? (
          <p className="mt-8 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-10">
          {isLoading ? (
            <ListingSkeleton />
          ) : items.length === 0 ? (
            <div className="border border-dashed border-zinc-200 px-6 py-20 text-center">
              <PiPackage className="icon mx-auto size-10 text-zinc-300" />
              <p className="mt-3 text-sm font-medium text-zinc-800">
                No listings match these filters
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Try clearing filters or searching something else.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3">
              {items.map((item) => (
                <ProductTile key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={meta.limit}
          onPageChange={setPage}
        />
      </section>
    </div>
  )
}
