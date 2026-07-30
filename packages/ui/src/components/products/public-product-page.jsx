import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  PiArrowLeft,
  PiBuildings,
  PiCalendarCheck,
  PiFirstAidKit,
  PiHouseLine,
  PiLightning,
  PiMapPin,
  PiMapTrifold,
  PiPackage,
  PiPhone,
  PiShoppingCart,
  PiStar,
  PiTag,
  PiStorefront,
} from 'react-icons/pi'
import {
  getPublicProductRequest,
  listPublicProductsRequest,
  unwrapPaginated,
} from '@multi-tenants/api'
import { useAuth, useLoginModal } from '@multi-tenants/auth'
import {
  formatBusinessTypeLabel,
  isLodgingBusinessType,
} from '@multi-tenants/constants'
import { getAssetUrl } from '@multi-tenants/config'
import { cn } from '@multi-tenants/utils'
import { useCart } from '../../contexts/cart-context.jsx'
import Button from '../button.jsx'
import Loading from '../loading.jsx'
import RoomBookingDialog from '../hotel/room-booking-modal.jsx'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'

const SUGGESTED_LIMIT = 8

const BUSINESS_TYPE_ICONS = {
  'hotel-management': PiBuildings,
  'hostel-management': PiHouseLine,
  pharmacy: PiFirstAidKit,
  'e-commerce': PiStorefront,
}

function formatPrice(price, businessType) {
  const formatted = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(Number(price) || 0)

  if (isLodgingBusinessType(businessType)) {
    return `${formatted} / night`
  }

  return formatted
}

function suggestionScore(candidate, current) {
  const candidateAttrs = candidate.attributes ?? {}
  const currentAttrs = current.attributes ?? {}
  const sameCategory =
    (candidate.categoryId &&
      current.categoryId &&
      candidate.categoryId === current.categoryId) ||
    (candidate.category?.id &&
      current.category?.id &&
      candidate.category.id === current.category.id) ||
    (candidate.category?.name &&
      current.category?.name &&
      candidate.category.name === current.category.name)

  let score = 0

  if (sameCategory) {
    score += 4
  }
  if (
    candidateAttrs.city &&
    currentAttrs.city &&
    candidateAttrs.city.toLowerCase() === currentAttrs.city.toLowerCase()
  ) {
    score += 3
  }
  if (
    candidateAttrs.area &&
    currentAttrs.area &&
    candidateAttrs.area.toLowerCase() === currentAttrs.area.toLowerCase()
  ) {
    score += 2
  }
  if (
    candidate.organizationId &&
    current.organizationId &&
    candidate.organizationId === current.organizationId
  ) {
    score += 2
  }
  if (candidate.isFeatured) score += 1

  return score
}

function DetailBadge({ children, icon: Icon, className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex h-10 min-w-[8.5rem] items-center justify-start gap-2 rounded-full border px-3 text-xs font-semibold',
        className,
      )}
    >
      {Icon ? <Icon className="icon size-4 shrink-0" aria-hidden /> : null}
      <span className="truncate">{children}</span>
    </span>
  )
}

function DetailChip({ label, value, icon: Icon, className = '' }) {
  return (
    <div
      className={cn(
        'flex min-h-12 items-center gap-3 border border-zinc-200 px-4',
        className,
      )}
    >
      {Icon ? (
        <span className="flex shrink-0 items-center justify-center rounded-xl">
          <Icon className="icon size-4" aria-hidden />
        </span>
      ) : null}
      <div className="min-w-0 text-left">
        {/* <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
          {label}
        </dt> */}
        <dd className="mt-0.5 truncate text-sm font-medium text-zinc-800">
          {value}
        </dd>
      </div>
    </div>
  )
}

function SuggestedProductCard({ product }) {
  const cover = product.images?.[0]?.url

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block overflow-hidden border-zinc-200 pb-10 text-end transition"
    >
      <div className="aspect-square overflow-hidden bg-zinc-100 icon">
        <img
          src={cover ? getAssetUrl(cover) : FALLBACK_IMAGE}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition icon duration-700 group-hover:scale-[1.04]"
        />
      </div>
      <p className="mt-4 truncate text-sm font-medium tracking-wide text-zinc-900 uppercase">
        {product.name}
      </p>
      <p className="mt-1 text-sm text-zinc-500">
        {formatPrice(product.price, product.businessType)}
      </p>
    </Link>
  )
}

export default function PublicProductPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const { openLoginModal } = useLoginModal()
  const [product, setProduct] = useState(null)
  const [suggested, setSuggested] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isRoomBookingOpen, setIsRoomBookingOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!productId) return
      setIsLoading(true)
      setError('')
      setSuggested([])
      setAddedToCart(false)
      setIsRoomBookingOpen(false)
      try {
        const data = await getPublicProductRequest(productId)
        if (cancelled) return

        setProduct(data)
        setActiveImage(0)

        if (data?.businessType) {
          try {
            const catalog = await listPublicProductsRequest({
              businessType: data.businessType,
              limit: 24,
              page: 1,
            })
            if (cancelled) return

            const related = unwrapPaginated(catalog)
              .items.filter((item) => item.id !== data.id)
              .sort(
                (a, b) => suggestionScore(b, data) - suggestionScore(a, data),
              )
              .slice(0, SUGGESTED_LIMIT)

            setSuggested(related)
          } catch {
            if (!cancelled) setSuggested([])
          }
        }
      } catch (err) {
        if (!cancelled) {
          setProduct(null)
          setSuggested([])
          setError(
            err instanceof Error ? err.message : 'Failed to load product',
          )
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
    void load()
    return () => {
      cancelled = true
    }
  }, [productId])

  const images = useMemo(() => {
    const list = (product?.images ?? [])
      .map((image) => ({
        id: image.id,
        url: image.url ? getAssetUrl(image.url) : '',
      }))
      .filter((image) => image.url)

    if (!list.length) {
      return [{ id: 'fallback', url: FALLBACK_IMAGE }]
    }
    return list
  }, [product])

  const attrs = product?.attributes ?? {}
  const isLodging = isLodgingBusinessType(product?.businessType)
  const inStock = isLodging ? true : Boolean(product?.inStock)

  const locationLabel = [attrs.area, attrs.city, attrs.country]
    .filter(Boolean)
    .join(', ')

  const detailItems = isLodging
    ? []
    : [
        product?.category?.name
          ? {
              label: 'Category',
              value: product.category.name,
              icon: PiTag,
              className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            }
          : null,
        attrs.city
          ? {
              label: 'City',
              value: attrs.city,
              icon: PiMapPin,
              className: 'border-rose-200 bg-rose-50 text-rose-700',
            }
          : null,
        attrs.area
          ? {
              label: 'Area',
              value: attrs.area,
              icon: PiMapTrifold,
              className: 'border-pink-200 bg-pink-50 text-pink-700',
            }
          : null,
        attrs.country
          ? {
              label: 'Country',
              value: attrs.country,
              icon: PiMapPin,
              className: 'border-amber-200 bg-amber-50 text-amber-700',
            }
          : null,
        attrs.address
          ? {
              label: 'Address',
              value: attrs.address,
              icon: PiBuildings,
              className: 'border-zinc-200 bg-zinc-50 text-zinc-700',
            }
          : null,
      ].filter(Boolean)

  function handleAddToCart() {
    if (!product || isLodgingBusinessType(product.businessType) || !product.inStock)
      return
    addItem(product)
    setAddedToCart(true)
    window.setTimeout(() => setAddedToCart(false), 1800)
  }

  function handleBuyNow() {
    if (!product || isLodgingBusinessType(product.businessType) || !product.inStock)
      return
    addItem(product)
    navigate('/cart')
  }

  function handleBookNow() {
    if (!product) return
    if (!isAuthenticated) {
      openLoginModal({
        stayOnPage: true,
        onSuccess: () => {
          setIsRoomBookingOpen(true)
        },
      })
      return
    }
    setIsRoomBookingOpen(true)
  }

  if (isLoading) {
    return <Loading message="Loading product..." />
  }

  if (!product) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-24 text-center">
        <PiPackage className="icon mx-auto size-12 text-zinc-300" />
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900">
          Product not found
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          {error || 'This listing may have been removed.'}
        </p>
        <Link to="/" className="mt-6 inline-flex">
          <Button className="gap-2 px-5">
            <PiArrowLeft className="icon size-4" />
            Back to marketplace
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full mt-10 max-w-7xl px-6 pb-20 pt-28 md:max-w-7xl">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-primary"
      >
        <PiArrowLeft className="icon size-4" />
        Back to marketplace
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div>
          <div className="aspect-[16/11] overflow-hidden rounded-3xl bg-zinc-100">
            <img
              src={images[activeImage]?.url || FALLBACK_IMAGE}
              alt={product.name}
              className="icon h-full w-full object-cover"
            />
          </div>
          {images.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={cn(
                    'h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition',
                    index === activeImage
                      ? 'border-primary'
                      : 'border-transparent opacity-80 hover:opacity-100',
                  )}
                >
                  <img
                    src={image.url}
                    alt=""
                    className="h-full w-full icon object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            {product.businessType ? (
              <DetailBadge
                icon={BUSINESS_TYPE_ICONS[product.businessType] || PiPackage}
                className="border-sky-200 bg-sky-50 text-sky-800"
              >
                {formatBusinessTypeLabel(product.businessType)}
              </DetailBadge>
            ) : null}
            {!isLodging && product.category?.name ? (
              <DetailBadge
                icon={PiTag}
                className="border-emerald-200 bg-emerald-50 text-emerald-800"
              >
                {product.category.name}
              </DetailBadge>
            ) : null}
            {product.isFeatured ? (
              <DetailBadge
                icon={PiStar}
                className="border-amber-200 bg-amber-50 text-amber-800"
              >
                Featured
              </DetailBadge>
            ) : null}
            {!isLodging ? (
              <DetailBadge
                icon={PiPackage}
                className={
                  inStock
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-rose-200 bg-rose-50 text-rose-800'
                }
              >
                {inStock ? 'In stock' : 'Out of stock'}
              </DetailBadge>
            ) : null}
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
              {product.name}
            </h1>
            {locationLabel ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-zinc-500">
                <PiMapPin className="icon size-4 shrink-0" />
                {locationLabel}
              </p>
            ) : null}
          </div>

          <p className="text-3xl font-bold text-emerald-600">
            {formatPrice(product.price, product.businessType)}
          </p>

          {product.organizationName ? (
            <Link
              to={`/organization/${product.businessType || 'e-commerce'}`}
              className="inline-flex items-center gap-2 text-sm text-zinc-600 transition hover:text-primary"
            >
              <PiBuildings className="icon size-4" />
              {product.organizationName}
            </Link>
          ) : null}

          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-600">
              {product.description?.trim() || 'No description provided.'}
            </p>
          </div>

          {detailItems.length ? (
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">
                Product details
              </h2>
              <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                {detailItems.map((item) => (
                  <DetailChip
                    key={`${item.label}-${item.value}`}
                    label={item.label}
                    value={item.value}
                    icon={item.icon}
                    className={item.className}
                  />
                ))}
              </dl>
            </div>
          ) : null}

          {isLodging ? (
            <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              Choose room type, AC, and other preferences when you book — rooms
              update to match your selection.
            </p>
          ) : null}

          <div className="grid grid-cols-2 gap-3 pt-2">
            {!isLodging && !inStock ? (
              <p className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                This product is currently out of stock.
              </p>
            ) : null}
            {isLodging ? (
              <>
                <Button
                  onClick={handleBookNow}
                  className="h-12 gap-2 px-6 font-semibold"
                >
                  <PiCalendarCheck className="icon size-4" />
                  Book now
                </Button>
                <Link
                  to={`/organization/${product.businessType}`}
                  className="w-full"
                >
                  <Button
                    variant="outlined"
                    className="w-full h-12 flex items-center justify-center gap-3"
                  >
                    <PiPhone className="icon size-4" />
                    Contact manager
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button
                  onClick={handleBuyNow}
                  disabled={!inStock}
                  className="h-12 gap-2 px-6 font-semibold"
                >
                  <PiLightning className="icon size-4" />
                  Buy now
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="h-12 gap-2 px-6 font-semibold"
                >
                  <PiShoppingCart className="icon size-4" />
                  {addedToCart ? 'Added to cart' : 'Add to cart'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <RoomBookingDialog
        isOpen={isRoomBookingOpen}
        onClose={() => setIsRoomBookingOpen(false)}
        organizationId={product.organizationId}
        organizationSlug={product.organizationSlug}
        organizationName={product.organizationName}
        businessType={product.businessType}
      />

      {suggested.length ? (
        <section className="mt-16 border-t border-zinc-100 pt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Suggested for you
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              More {formatBusinessTypeLabel(product.businessType).toLowerCase()}{' '}
              listings based on category, location, and seller.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {suggested.map((item) => (
              <SuggestedProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
