import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import { CATEGORIES } from '../../data/categories.js'
import './admin.css'

function makeSlug() {
  return (
    'news-' +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 6)
  )
}

export default function ArticleForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0].slug)
  const [author, setAuthor] = useState('PublicLens ডেস্ক')
  const [isFeatured, setIsFeatured] = useState(false)
  const [isBreaking, setIsBreaking] = useState(false)
  const [status, setStatus] = useState('draft')
  const [publishedAt, setPublishedAt] = useState(null)

  const [loading, setLoading] = useState(isEdit)
  const [notFound, setNotFound] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = (isEdit ? 'খবর সম্পাদনা' : 'নতুন খবর') + ' | PublicLens অ্যাডমিন'
    if (!isEdit) return undefined
    let active = true

    async function load() {
      const { data, error: err } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (!active) return
      if (err || !data) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setTitle(data.title || '')
      setExcerpt(data.excerpt || '')
      setBody(data.body || '')
      setCategory(data.category)
      setAuthor(data.author || 'PublicLens ডেস্ক')
      setIsFeatured(Boolean(data.is_featured))
      setIsBreaking(Boolean(data.is_breaking))
      setStatus(data.status)
      setPublishedAt(data.published_at)
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [id, isEdit])

  async function save(targetStatus) {
    setError('')
    if (!title.trim()) {
      setError('শিরোনাম লিখুন।')
      return
    }
    if (targetStatus === 'published' && !body.trim()) {
      setError('প্রকাশ করতে খবরের লেখা দিতে হবে।')
      return
    }

    setBusy(true)
    const now = new Date().toISOString()
    const payload = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      body,
      category,
      author: author.trim() || 'PublicLens ডেস্ক',
      is_featured: isFeatured,
      is_breaking: isBreaking,
      status: targetStatus,
      updated_at: now,
    }
    if (targetStatus === 'published') {
      payload.published_at = publishedAt || now
    }

    let result
    if (isEdit) {
      result = await supabase
        .from('articles')
        .update(payload)
        .eq('id', id)
        .select('id')
    } else {
      payload.slug = makeSlug()
      result = await supabase.from('articles').insert(payload).select('id')
    }
    setBusy(false)

    const { data, error: err } = result
    if (err || !data || data.length === 0) {
      setError('সেভ হয়নি। ' + (err ? err.message : 'অনুমতি নেই।'))
      return
    }
    navigate('/admin/articles')
  }

  if (loading) {
    return <div className="notice-box">লোড হচ্ছে...</div>
  }

  if (notFound) {
    return (
      <div className="notice-box">
        <h2>খবরটি পাওয়া যায়নি</h2>
        <Link to="/admin/articles" className="btn">
          তালিকায় ফিরুন
        </Link>
      </div>
    )
  }

  const isPublishedNow = isEdit && status === 'published'

  return (
    <section>
      <h1>{isEdit ? 'খবর সম্পাদনা' : 'নতুন খবর'}</h1>

      <div className="form-grid">
        <div className="form-row">
          <label htmlFor="title">শিরোনাম *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label htmlFor="excerpt">সারসংক্ষেপ</label>
          <textarea
            id="excerpt"
            style={{ minHeight: '80px' }}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
          <p className="hint">
            হোমপেজে ও সার্চ ইঞ্জিনে দেখানো ছোট বিবরণ (এক-দুই বাক্য)।
          </p>
        </div>

        <div className="form-row">
          <label htmlFor="category">ক্যাটেগরি</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="author">লেখক</label>
          <input
            id="author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label htmlFor="body">খবরের লেখা *</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <p className="hint">
            নতুন অনুচ্ছেদের জন্য এন্টার চেপে নতুন লাইনে লিখুন।
          </p>
        </div>

        <label className="check-row">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
          />
          ফিচার্ড খবর (হোমপেজের উপরে দেখাবে)
        </label>

        <label className="check-row">
          <input
            type="checkbox"
            checked={isBreaking}
            onChange={(e) => setIsBreaking(e.target.checked)}
          />
          ব্রেকিং নিউজ (চলমান বারে দেখাবে)
        </label>

        <p className="hint">
          কভার ছবি আপলোডের সুবিধা পরের ধাপে যোগ হবে।
        </p>

        {error && <p className="login-error">{error}</p>}

        <div className="admin-actions">
          <button
            className="btn-small btn-outline"
            disabled={busy}
            onClick={() => save('draft')}
          >
            {isPublishedNow ? 'অপ্রকাশ করে সেভ' : 'খসড়া সেভ'}
</button>
          <button
            className="btn-small"
            disabled={busy}
            onClick={() => save('published')}
          >
            {isPublishedNow ? 'হালনাগাদ করুন' : 'প্রকাশ করুন'}
          </button>
          <Link to="/admin/articles" className="btn-small btn-outline">
            বাতিল
          </Link>
        </div>
      </div>
    </section>
  )
}
