export const organizationTypes = [
  { label: 'Pharmacy', slug: 'pharmacy' },
  { label: 'E-Commerce', slug: 'e-commerce' },
  { label: 'Hotel Management', slug: 'hotel-management' },
  { label: 'Hostel Management', slug: 'hostel-management' },
] as const

export const organizationSampleProducts = {
  pharmacy: {
    title: 'Pharmacy samples',
    description: 'Inventory, prescriptions, and OTC sales.',
    products: [
      {
        name: 'Paracetamol 500mg',
        meta: 'Tablets · 20 pack',
        price: '$4.50',
        image:
          'https://images.unsplash.com/photo-1588718889344-f7bd7a565d20?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      },
      {
        name: 'Vitamin C Immunity',
        meta: 'Supplement · 60 caps',
        price: '$12.00',
        image:
          'https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      },
      {
        name: 'Cough Syrup Plus',
        meta: '120ml bottle',
        price: '$8.25',
        image:
          'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'First Aid Kit',
        meta: 'Home care set',
        price: '$19.99',
        image:
          'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  'e-commerce': {
    title: 'E-commerce samples',
    description: 'Catalog, carts, and checkout flows.',
    products: [
      {
        name: 'Wireless Headphones',
        meta: 'Electronics',
        price: '$89.00',
        image:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Minimal Desk Lamp',
        meta: 'Home & living',
        price: '$42.00',
        image:
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Canvas Tote Bag',
        meta: 'Fashion',
        price: '$28.00',
        image:
          'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Running Sneakers',
        meta: 'Footwear',
        price: '$110.00',
        image:
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  'hotel-management': {
    title: 'Hotel samples',
    description: 'Rooms, bookings, and guest services.',
    products: [
      {
        name: 'Deluxe King Room',
        meta: '1 night · city view',
        price: '$140',
        image:
          'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Executive Suite',
        meta: '1 night · lounge access',
        price: '$260',
        image:
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Breakfast Buffet',
        meta: 'Per guest',
        price: '$24',
        image:
          'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Airport Transfer',
        meta: 'Private sedan',
        price: '$55',
        image:
          'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  'hostel-management': {
    title: 'Hostel samples',
    description: 'Beds, dorms, and stay management.',
    products: [
      {
        name: '4-Bed Mixed Dorm',
        meta: 'Per bed / night',
        price: '$18',
        image:
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Private Twin Room',
        meta: 'Shared bath',
        price: '$46',
        image:
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Locker Rental',
        meta: 'Per stay',
        price: '$5',
        image:
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'City Walking Tour',
        meta: 'Group activity',
        price: '$15',
        image:
          'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
} as const

export {
  exploreCategories,
  exploreHeroSlides,
} from './explore'
export type { ExploreCategoryId } from './explore'
export {
  BUSINESS_TYPES,
  BUSINESS_TYPE_OPTIONS,
  DEFAULT_PRODUCT_CATEGORIES,
  LODGING_BATHROOM_OPTIONS,
  LODGING_BUSINESS_TYPES,
  LODGING_CLIMATE_OPTIONS,
  LODGING_MEAL_PLAN_OPTIONS,
  LODGING_VIEW_OPTIONS,
  PRODUCT_CATEGORIES_BY_BUSINESS,
  PRODUCT_STATUSES,
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_STATUS_FORM_OPTIONS,
  PUBLISHED_PRODUCT_STATUS,
  formatBusinessTypeLabel,
  formatLodgingAttributeLabel,
  formatProductStatusLabel,
  getProductCategoriesForBusiness,
  isCategoryAllowedForBusiness,
  isLodgingBusinessType,
  isProductStatus,
} from './business-types'
export type {
  BusinessType,
  ProductLodgingAttributes,
  ProductStatus,
} from './business-types'
