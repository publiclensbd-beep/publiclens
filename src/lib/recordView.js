import { supabase, isSupabaseConfigured } from './supabaseClient.js'

export async function recordView(rawSlug) {
  if (!isSupabaseConfigured || !rawSlug) return

  let slug = rawSlug
  try {
    slug = decodeURIComponent(rawSlug)
  } catch (e) {
    return
  }

  const key = 'pl_viewed_' + slug
  try {
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
  } catch (e) {
    // সেশন স্টোরেজ না থাকলেও গণনা চলবে
  }

  const { error } = await supabase.rpc('increment_views', { p_slug: slug })
  if (error) {
    console.error('view count error:', error.message)
  }
}
