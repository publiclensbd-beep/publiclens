import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient.js'
import { useCategoriesReload } from '../../lib/CategoriesProvider.jsx'
import './admin.css'

function rememberMessage(msg) {
  try {
    sessionStorage.setItem('pl_flash', msg)
  } catch (e) {
    // ignore
  }
}

export default function AdminCategories() {
  const reloadCategories = useCategoriesReload()
  const [rows, setRows] = useState([])
  const [names, setNames] = useState({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [newName, setNewName] = useState('')

  async function load() {
    const { data, error: err } = await supabase
      .from('categories')
      .select('slug,name,sort_order')
      .order('sort_order', { ascending: true })
    if (err) {
      setError('তথ্য আনা যায়নি: ' + err.message)
    } else {
      setRows(data || [])
      const map = {}
      for (const c of data || []) {
        map[c.slug] = c.name
      }
      setNames(map)
    }
    setLoading(false)
  }

  useEffect(() => {
    document.title = 'ক্যাটেগরি | PublicLens অ্যাডমিন'
    try {
      const saved = sessionStorage.getItem('pl_flash')
      if (saved) {
        setMessage(saved)
        sessionStorage.removeItem('pl_flash')
      }
    } catch (e) {
      // ignore
    }
    load()
  }, [])

  async function finish(msg) {
    rememberMessage(msg)
    setMessage(msg)
    await load()
    await reloadCategories()
  }

  async function saveName(c) {
    const name = (names[c.slug] || '').trim()
    if (!name) {
      setError('নাম খালি রাখা যাবে না।')
      return
    }
    setBusy(true)
    setError('')
    setMessage('')
    const { data, error: err } = await supabase
      .from('categories')
      .update({ name })
      .eq('slug', c.slug)
      .select('slug')
    setBusy(false)
    if (err || !data || data.length === 0) {
      setError('সেভ হয়নি। ' + (err ? err.message : 'অনুমতি নেই।'))
      return
    }
    await finish('ক্যাটেগরির নাম সেভ হয়েছে।')
  }

  async function move(i, dir) {
    const a = rows[i]
    const b = rows[i + dir]
    if (!a || !b) return
    setBusy(true)
    setError('')
    setMessage('')
    const r1 = await supabase
      .from('categories')
      .update({ sort_order: b.sort_order })
      .eq('slug', a.slug)
      .select('slug')
    const r2 = await supabase
      .from('categories')
      .update({ sort_order: a.sort_order })
      .eq('slug', b.slug)
      .select('slug')
    setBusy(false)
    const failed =
      r1.error || r2.error || !r1.data || !r1.data.length || !r2.data || !r2.data.length
    if (failed) {
      setError('ক্রম বদল হয়নি।')
      await load()
      return
    }
    await finish('ক্রম বদলানো হয়েছে।')
  }

  async function deleteCategory(c) {
    if (rows.length <= 1) {
      setError('শেষ ক্যাটেগরিটি মোছা যাবে না।')
      return
    }
    if (!window.confirm('"' + c.name + '" ক্যাটেগরি মুছে ফেলবেন?')) return
    setBusy(true)
    setError('')
    setMessage('')
    const { data, error: err } = await supabase
      .from('categories')
      .delete()
      .eq('slug', c.slug)
      .select('slug')
    setBusy(false)
    if (err && err.code === '23503') {
      setError('এই ক্যাটেগরিতে খবর আছে। আগে খবরগুলো অন্য ক্যাটেগরিতে নিন বা মুছুন।')
      return
    }
    if (err || !data || data.length === 0) {
      setError('মোছা যায়নি। ' + (err ? err.message : 'অনুমতি নেই।'))
      return
    }
    await finish('ক্যাটেগরি মুছে ফেলা হয়েছে।')
  }

  async function addCategory(e) {
    e.preventDefault()
    const slug = newSlug.trim().toLowerCase()
    const name = newName.trim()
    setError('')
    setMessage('')
    if (!name) {
      setError('ক্যাটেগরির নাম লিখুন।')
      return
    }
    if (!/^[a-z0-9-]{2,40}$/.test(slug)) {
      setError('কোডে শুধু ইংরেজি ছোট হাতের অক্ষর, সংখ্যা ও - চলবে (২-৪০ অক্ষর)।')
      return
    }
    const maxOrder = rows.reduce((m, c) => Math.max(m, c.sort_order || 0), 0)
    setBusy(true)
    const { data, error: err } = await supabase
      .from('categories')
      .insert({ slug, name, sort_order: maxOrder + 1 })
      .select('slug')
    setBusy(false)
    if (err && err.code === '23505') {
      setError('এই কোড আগে থেকেই আছে।')
      return
    }
    if (err || !data || data.length === 0) {
      setError('যোগ হয়নি। ' + (err ? err.message : 'অনুমতি নেই।'))
      return
    }
    setNewSlug('')
    setNewName('')
    await finish('নতুন ক্যাটেগরি যোগ হয়েছে।')
  }

  return (
    <section>
      <h1>ক্যাটেগরি</h1>

      {message && <p className="msg-ok">{message}</p>}
      {error && <p className="login-error">{error}</p>}
      {loading && <div className="notice-box">লোড হচ্ছে...</div>}

      {!loading && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ক্রম</th>
                <th>নাম</th>
                <th>কোড</th>
                <th>কাজ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => (
                <tr key={c.slug}>
                  <td>
                    <div className="admin-actions">
                      <button
                        className="btn-small btn-outline"
                        disabled={busy || i === 0}
                        onClick={() => move(i, -1)}
                      >
                        ↑
                      </button>
                      <button
                        className="btn-small btn-outline"
                        disabled={busy || i === rows.length - 1}
                        onClick={() => move(i, 1)}
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="form-row">
                      <input
                        type="text"
                        value={names[c.slug] || ''}
                        onChange={(e) =>
                          setNames({ ...names, [c.slug]: e.target.value })
                        }
                      />
                    </div>
                  </td>
                  <td>{c.slug}</td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className="btn-small"
                        disabled={busy || (names[c.slug] || '').trim() === c.name}
                        onClick={() => saveName(c)}
                      >
                        সেভ
                      </button>
                      <button
                        className="btn-small btn-danger"
                        disabled={busy}
                        onClick={() => deleteCategory(c)}
                      >
                        মুছুন
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="section-title">
        <span>নতুন ক্যাটেগরি</span>
      </h2>

      <form className="form-grid" onSubmit={addCategory}>
        <div className="form-row">
          <label htmlFor="newName">নাম (বাংলায়)</label>
          <input
            id="newName"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label htmlFor="newSlug">কোড (ইংরেজিতে)</label>
          <input
            id="newSlug"
            type="text"
            autoCapitalize="none"
            autoCorrect="off"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value.toLowerCase())}
          />
          <p className="hint">
            যেমন: health। কোডটি পরে বদলানো যাবে না।
          </p>
        </div>

        <div className="admin-actions">
          <button type="submit" className="btn-small" disabled={busy}>
            যোগ করুন
          </button>
        </div>
      </form>
    </section>
  )
        }
