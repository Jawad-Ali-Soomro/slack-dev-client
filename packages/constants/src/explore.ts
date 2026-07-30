/** Product catalog categories (shop / pharmacy). Hotels & hostels use property pages. */
export const exploreCategories = [
  {
    id: 'pharmacy',
    label: 'Pharmacy',
    businessType: 'pharmacy',
    placeholder: 'Search medicines & care',
  },
  {
    id: 'products',
    label: 'Shop',
    businessType: 'e-commerce',
    placeholder: 'Search products & brands',
  },
] as const

export type ExploreCategoryId = (typeof exploreCategories)[number]['id']

export const exploreHeroSlides = [
  {
    id: 'hotels',
    eyebrow: 'Hotels',
    title: 'Stay somewhere great',
    subtitle: 'Browse rooms by location and book open inventory.',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80',
  },
  {
    id: 'hostels',
    eyebrow: 'Hostels',
    title: 'Travel light, meet more',
    subtitle: 'Find hostels by city and reserve a room for your dates.',
    image:
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1920&q=80',
  },
  {
    id: 'pharmacy',
    eyebrow: 'Pharmacy',
    title: 'Health essentials nearby',
    subtitle: 'OTC, supplements, and care products from verified pharmacies.',
    image:
      'https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'products',
    eyebrow: 'Shop',
    title: 'Discover local products',
    subtitle: 'Explore curated e-commerce picks from marketplace stores.',
    image:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80',
  },
] as const
