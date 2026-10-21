import { DEMO_ARTICLES } from './demoArticles.js'

// নতুন খবর আগে দেখাতে তারিখ অনুযায়ী সাজানো
function sortByDate(list) {
  return [...list].sort((a, b) => new Date(b.date) - new Date(a.date))
}

export async function getLatest(limit = 20) {
  return sortByDate(DEMO_ARTICLES).slice(0, limit)
}

export async function getFeatured(limit = 3) {
  return sortByDate(DEMO_ARTICLES.filter((a) => a.featured)).slice(0, limit)
}

export async function getBreaking() {
  return sortByDate(DEMO_ARTICLES.filter((a) => a.breaking))
}

export async function getPopular(limit = 5) {
  return [...DEMO_ARTICLES].sort((a, b) => b.views - a.views).slice(0, limit)
}

export async function getByCategory(categorySlug) {
  return sortByDate(DEMO_ARTICLES.filter((a) => a.category === categorySlug))
}

export async function getArticle(slug) {
  return DEMO_ARTICLES.find((a) => a.slug === slug) || null
}

export async function getRelated(article, limit = 3) {
  if (!article) return []
  return sortByDate(
    DEMO_ARTICLES.filter(
      (a) => a.category === article.category && a.slug !== article.slug
    )
  ).slice(0, limit)
}

export async function searchArticles(query) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return []
  return sortByDate(
    DEMO_ARTICLES.filter((a) => {
      const text = (a.title + ' ' + a.excerpt + ' ' + a.body.join(' ')).toLowerCase()
      return text.includes(q)
    })
  )
}
