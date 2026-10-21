export const CATEGORIES = [
  { slug: 'bangladesh', name: 'বাংলাদেশ' },
  { slug: 'politics', name: 'রাজনীতি' },
  { slug: 'international', name: 'আন্তর্জাতিক' },
  { slug: 'economy', name: 'অর্থনীতি' },
  { slug: 'sports', name: 'খেলাধুলা' },
  { slug: 'technology', name: 'প্রযুক্তি' },
  { slug: 'entertainment', name: 'বিনোদন' },
]

export function getCategoryName(slug) {
  const found = CATEGORIES.find((c) => c.slug === slug)
  return found ? found.name : slug
}
