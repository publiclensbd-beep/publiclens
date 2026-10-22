const DEFAULT_CATEGORIES = [
  { slug: 'bangladesh', name: 'বাংলাদেশ' },
  { slug: 'politics', name: 'রাজনীতি' },
  { slug: 'international', name: 'আন্তর্জাতিক' },
  { slug: 'economy', name: 'অর্থনীতি' },
  { slug: 'sports', name: 'খেলাধুলা' },
  { slug: 'technology', name: 'প্রযুক্তি' },
  { slug: 'entertainment', name: 'বিনোদন' },
]

export const CATEGORIES = DEFAULT_CATEGORIES.map((c) => ({ ...c }))

export function setCategories(list) {
  if (!Array.isArray(list) || list.length === 0) return
  const next = list.map((c) => ({ slug: c.slug, name: c.name }))
  CATEGORIES.splice(0, CATEGORIES.length, ...next)
}

export function getCategoryName(slug) {
  const found = CATEGORIES.find((c) => c.slug === slug)
  return found ? found.name : slug
}
