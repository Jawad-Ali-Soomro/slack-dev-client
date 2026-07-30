export const BUSINESS_TYPES = [
  {
    value: 'e-commerce',
    label: 'E-Commerce',
  },
  {
    value: 'hotel-management',
    label: 'Hotel Management',
  },
  {
    value: 'hostel-management',
    label: 'Hostel Management',
  },
  {
    value: 'pharmacy',
    label: 'Pharmacy',
  },
] as const

export type BusinessType = (typeof BUSINESS_TYPES)[number]['value']

export const BUSINESS_TYPE_OPTIONS = BUSINESS_TYPES.map((type) => ({
  value: type.value,
  label: type.label,
}))

export const PRODUCT_CATEGORIES_BY_BUSINESS: Record<BusinessType, string[]> = {
  'e-commerce': [
    'Electronics',
    'Fashion',
    'Home & Living',
    'Beauty',
    'Sports',
    'Other',
  ],
  'hotel-management': [
    'Single Bedroom',
    'Double Bedroom',
    'Shared Room',
    'Suite',
    'Family Room',
    'Other',
  ],
  'hostel-management': [
    'Single Bedroom',
    'Shared Dorm',
    'Private Room',
    'Twin Room',
    'Other',
  ],
  pharmacy: [
    'OTC Medicines',
    'Prescription',
    'Supplements',
    'Personal Care',
    'First Aid',
    'Other',
  ],
}

export const DEFAULT_PRODUCT_CATEGORIES = [
  'General',
  'Featured',
  'Seasonal',
  'Other',
]

export const PRODUCT_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'deleted', label: 'Deleted' },
] as const

export type ProductStatus = (typeof PRODUCT_STATUSES)[number]['value']

export const PRODUCT_STATUS_OPTIONS = PRODUCT_STATUSES.map((item) => ({
  value: item.value,
  label: item.label,
}))

/** Status values shown in create/edit forms (deleted is set via delete action). */
export const PRODUCT_STATUS_FORM_OPTIONS = PRODUCT_STATUS_OPTIONS.filter(
  (item) => item.value !== 'deleted',
)

export const PUBLISHED_PRODUCT_STATUS: ProductStatus = 'published'

export function isProductStatus(value?: string | null): value is ProductStatus {
  return PRODUCT_STATUSES.some((item) => item.value === value)
}

export function formatProductStatusLabel(status?: string | null): string {
  if (!status) return 'Draft'
  return (
    PRODUCT_STATUSES.find((item) => item.value === status)?.label ?? status
  )
}

export const LODGING_BUSINESS_TYPES: BusinessType[] = [
  'hotel-management',
  'hostel-management',
]

export const LODGING_CLIMATE_OPTIONS = [
  { value: 'ac', label: 'AC' },
  { value: 'non-ac', label: 'Non-AC' },
] as const

export const LODGING_BATHROOM_OPTIONS = [
  { value: 'private', label: 'Private bathroom' },
  { value: 'shared', label: 'Shared bathroom' },
] as const

export const LODGING_MEAL_PLAN_OPTIONS = [
  { value: 'none', label: 'Room only' },
  { value: 'breakfast', label: 'Breakfast included' },
  { value: 'half-board', label: 'Half board' },
  { value: 'full-board', label: 'Full board' },
] as const

export const LODGING_VIEW_OPTIONS = [
  { value: 'none', label: 'No preference' },
  { value: 'city', label: 'City view' },
  { value: 'garden', label: 'Garden view' },
  { value: 'pool', label: 'Pool view' },
  { value: 'mountain', label: 'Mountain view' },
] as const

export type ProductLodgingAttributes = {
  climate?: (typeof LODGING_CLIMATE_OPTIONS)[number]['value']
  bathroom?: (typeof LODGING_BATHROOM_OPTIONS)[number]['value']
  mealPlan?: (typeof LODGING_MEAL_PLAN_OPTIONS)[number]['value']
  view?: (typeof LODGING_VIEW_OPTIONS)[number]['value']
  stayDays?: number
  maxGuests?: number
  bedCount?: number
  city?: string
  area?: string
  country?: string
  address?: string
  notes?: string
}

export function isLodgingBusinessType(
  businessType?: string | null,
): boolean {
  return LODGING_BUSINESS_TYPES.includes(businessType as BusinessType)
}

export function getProductCategoriesForBusiness(
  businessType?: string | null,
): string[] {
  if (businessType && businessType in PRODUCT_CATEGORIES_BY_BUSINESS) {
    return [...PRODUCT_CATEGORIES_BY_BUSINESS[businessType as BusinessType]]
  }

  return [...DEFAULT_PRODUCT_CATEGORIES]
}

export function isCategoryAllowedForBusiness(
  businessType: string | null | undefined,
  category: string,
): boolean {
  if (!businessType || !(businessType in PRODUCT_CATEGORIES_BY_BUSINESS)) {
    return true
  }

  const allowed = PRODUCT_CATEGORIES_BY_BUSINESS[businessType as BusinessType]
  return allowed.some(
    (item) => item.toLowerCase() === category.trim().toLowerCase(),
  )
}

export function formatBusinessTypeLabel(type?: string | null): string {
  if (!type) return '—'
  const match = BUSINESS_TYPES.find((item) => item.value === type)
  return match?.label ?? type
}

export function formatLodgingAttributeLabel(
  key: keyof ProductLodgingAttributes,
  value?: string | number | null,
): string | null {
  if (value == null || value === '') return null

  if (key === 'climate') {
    return LODGING_CLIMATE_OPTIONS.find((item) => item.value === value)?.label ?? String(value)
  }
  if (key === 'bathroom') {
    return (
      LODGING_BATHROOM_OPTIONS.find((item) => item.value === value)?.label ??
      String(value)
    )
  }
  if (key === 'mealPlan') {
    return (
      LODGING_MEAL_PLAN_OPTIONS.find((item) => item.value === value)?.label ??
      String(value)
    )
  }
  if (key === 'view') {
    return (
      LODGING_VIEW_OPTIONS.find((item) => item.value === value)?.label ??
      String(value)
    )
  }
  if (key === 'stayDays') {
    return `${value} night${Number(value) === 1 ? '' : 's'}`
  }
  if (key === 'maxGuests') {
    return `${value} guest${Number(value) === 1 ? '' : 's'}`
  }
  if (key === 'bedCount') {
    return `${value} bed${Number(value) === 1 ? '' : 's'}`
  }
  if (key === 'city' || key === 'area' || key === 'country' || key === 'address') {
    return String(value)
  }

  return String(value)
}
