import {
  formatLodgingAttributeLabel,
  isLodgingBusinessType,
} from '@multi-tenants/constants'
import { getAssetUrl } from '@multi-tenants/config'

export const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80'

export const FALLBACK_PROPERTY_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'

export const CATEGORY_ROUTES = {
  hotels: '/hotels',
  hostels: '/hostels',
  pharmacy: '/pharmacy',
  products: '/explore',
  explore: '/explore',
}

/** Items per page for explore / catalog / property listings */
export const CATALOG_PAGE_SIZE = 6

export function formatPrice(price, businessType) {
  const formatted = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(Number(price) || 0)

  if (isLodgingBusinessType(businessType)) {
    return `${formatted} / night`
  }

  return formatted
}

export function mapProductToListing(product) {
  const cover = product.images?.[0]?.url
  const attrs = product.attributes ?? {}
  const location = [attrs.area, attrs.city].filter(Boolean).join(', ')
  const lodgingBits = [
    formatLodgingAttributeLabel('climate', attrs.climate),
    formatLodgingAttributeLabel('stayDays', attrs.stayDays),
  ].filter(Boolean)

  const metaParts = [
    product.category?.name,
    location,
    product.organizationName,
    ...lodgingBits,
  ].filter(Boolean)

  return {
    id: product.id,
    title: product.name,
    meta: metaParts.join(' · ') || 'Marketplace listing',
    price: formatPrice(product.price, product.businessType),
    image: cover ? getAssetUrl(cover) : FALLBACK_PRODUCT_IMAGE,
    businessType: product.businessType,
    organizationSlug: product.organizationSlug,
    organizationName: product.organizationName,
    inStock: isLodgingBusinessType(product.businessType)
      ? true
      : Boolean(product.inStock),
  }
}
