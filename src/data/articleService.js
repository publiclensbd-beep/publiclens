import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'
import { DEMO_ARTICLES } from './demoArticles.js'

const COLUMNS =
  'slug,title,excerpt,body,category,author,cover_image,is_featured,is_breaking,views,published_at'

function normalize(row) {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || '',
    body: row.body || '',
    category: row.category,
    author: row.author,
    cover_image: row.cover_image,
    date: row.published_at,
    featured: row.is_featured,
    breaking: row.is_breaking,
    views: row.views || 0,
  }
}

function published() {
  return supabase.from('articles').select(COLUMNS).eq('status', 'published')
}

async function run(query) {
  const { data, error } = await query
  if (error) {
    console.error('Supabase error:', error.message)
    return []
  }
  return (data || []).map(normalize)
}

function sortByDate(list) {
  return [...list].sort((a, b) => new Date(b.date) - new Date(a.date))
}

const db = {
  getLatest: (limit = 20) =>
    run(published().order('published_at', { ascending: false }).limit(limit)),

  getFeatured: (limit = 3) =>
    run(
      published()
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(limit)
    ),

  getBreaking: () =>
    run(
      published()
        .eq('is_breaking', true)
        .order('published_at', { ascending: false })
        .limit(10)
    ),

  getPopular: (limit = 5) =>
    run(published().order('views', { ascending: false }).limit(limit)),

  getByCategory: (slug) =>
    run(
      published().eq('category', slug).order('published_at', { ascending: false })
    ),

  getArticle: async (slug) => {
    const { data, error } = await published().eq('slug', slug).maybeSingle()
    if (error) {
      console.error('Supabase error:', error.message)
      return null
    }
    return data ? normalize(data) : null
  },

  getRelated: (article, limit = 3) => {
    if (!article) return Promise.resolve([])
    return run(
      published()
        .eq('category', article.category)
        .neq('slug', article.slug)
        .order('published_at', { ascending: false })
        .limit(limit)
    )
  },

  searchArticles: (query) => {
    const q = (query || '').replace(/[,()%_*\\"']/g, ' ').trim()
    if (!q) return Promise.resolve([])
    const p = '%' + q + '%'
    return run(
      published()
        .or('title.ilike.' + p + ',excerpt.ilike.' + p + ',body.ilike.' + p)
        .order('published_at', { ascending: false })
        .limit(30)
    )
  },
}

const demo = {
  getLatest: async (limit = 20) => sortByDate(DEMO_ARTICLES).slice(0, limit),
  getFeatured: async (limit = 3) =>
    sortByDate(DEMO_ARTICLES.filter((a) => a.featured)).slice(0, limit),
  getBreaking: async () => sortByDate(DEMO_ARTICLES.filter((a) => a.breaking)),
  getPopular: async (limit = 5) =>
    [...DEMO_ARTICLES].sort((a, b) => b.views - a.views).slice(0, limit),
  getByCategory: async (slug) =>
    sortByDate(DEMO_ARTICLES.filter((a) => a.category === slug)),
  getArticle: async (slug) => DEMO_ARTICLES.find((a) => a.slug === slug) || null,
  getRelated: async (article, limit = 3) => {
    if (!article) return []
    return sortByDate(
      DEMO_ARTICLES.filter(
        (a) => a.category === article.category && a.slug !== article.slug
      )
    ).slice(0, limit)
  },
  searchArticles: async (query) => {
    const q = (query || '').trim().toLowerCase()
    if (!q) return []
    return sortByDate(
      DEMO_ARTICLES.filter((a) => {
        const text = (a.title + ' ' + a.excerpt + ' ' + a.body.join(' ')).toLowerCase()
        return text.includes(q)
      })
    )
  },
}

const api = isSupabaseConfigured ? db : demo

export const getLatest = (...args) => api.getLatest(...args)
export const getFeatured = (...args) => api.getFeatured(...args)
export const getBreaking = (...args) => api.getBreaking(...args)
export const getPopular = (...args) => api.getPopular(...args)
export const getByCategory = (...args) => api.getByCategory(...args)
export const getArticle = (...args) => api.getArticle(...args)
export const getRelated = (...args) => api.getRelated(...args)
export const searchArticles = (...args) => api.searchArticles(...args)
