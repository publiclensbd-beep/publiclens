import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import { getCategoryName } from '../../data/categories.js'
import { formatDate } from '../../components/ArticleCard.jsx'
import './admin.css'

export default function AdminArticles() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [filter, setFilter] = useState('all')

  async function load() {
    const { data, error: err } = await supabase
      .from('articles')
      .select('id,slug,title,category,status,published_at,updated_at')
      .order('updated_at', { ascending: false })
      .limit(500)
    if (err) {
      setError('তথ্য আনা যায়নি: ' + err.message)
    } else {
      setArticles(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    document.title = 'খবর | PublicLens অ্যাডমিন'
    load()
  }, [])

  async function setStatus(a, status) {
    setBusyId(a.id)
    setError('')
    setMessage('')
    const now = new Date().toISOString()
    const changes = { status, updated_at: now }
    if (status === 'published') {
      changes.published_at = a.published_at || now
    }
    const { data, error: err } = await supabase
      .from('articles')
      .update(changes)
      .eq('id', a.id)
      .select('id')
    setBusyId(null)
    if (err || !data || data.length === 0) {
      setError('পরিবর্তন হয়নি। ' + (err ? err.message : 'অনুমতি নেই।'))
      return
    }
    setMessage(status === 'published' ? 'খবরটি প্রকাশ হয়েছে।' : 'খবরটি খসড়ায় ফেরানো হয়েছে।')
    await load()
  }

  async function handleDelete(a) {
    if (!window.confirm('"' + a.title + '" খবরটি স্থায়ীভাবে মুছে ফেলবেন?')) return
    setBusyId(a.id)
    setError('')
    setMessage('')
    const { data, error: err } = await supabase
      .from('articles')
      .delete()
      .eq('id', a.id)
      .select('id')
    setBusyId(null)
    if (err || !data || data.length === 0) {
      setError('মোছা যায়নি। ' + (err ? err.message : 'অনুমতি নেই।'))
      return
    }
    setMessage('খবরটি মুছে ফেলা হয়েছে।')
    await load()
  }

  const shown = articles.filter((a) => filter === 'all' || a.status === filter)

  return (
    <section>
      <h1>খবর</h1>

      <div className="admin-actions" style={{ marginBottom: '12px' }}>
        <Link to="/admin/articles/new" className="btn-small">
          + নতুন খবর
        </Link>
        <div className="form-row" style={{ minWidth: '160px' }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">সব খবর</option>
            <option value="published">প্রকাশিত</option>
            <option value="draft">খসড়া</option>
          </select>
        </div>
      </div>

      {message && <p className="msg-ok">{message}</p>}
      {error && <p className="login-error">{error}</p>}
      {loading && <div className="notice-box">লোড হচ্ছে...</div>}

      {!loading && shown.length === 0 && (
        <div className="notice-box">কোনো খবর পাওয়া যায়নি।</div>
      )}

      {!loading && shown.length > 0 && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>শিরোনাম</th>
                <th>ক্যাটেগরি</th>
                <th>অবস্থা</th>
                <th>হালনাগাদ</th>
                <th>কাজ</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((a) => (
                <tr key={a.id}>
                  <td>{a.title}</td>
                  <td>{getCategoryName(a.category)}</td>
                  <td>
                    {a.status === 'published' ? (
                      <span className="badge-published">প্রকাশিত</span>
                    ) : (
                      <span className="badge-draft">খসড়া</span>
                    )}
                  </td>
                  <td>{formatDate(a.updated_at)}</td>
                  <td>
                    <div className="admin-actions">
                      <Link
                        to={'/admin/articles/' + a.id + '/edit'}
                        className="btn-small btn-outline"
                      >
                        সম্পাদনা
                      </Link>
                      {a.status === 'published' ? (
                        <button
                          className="btn-small btn-outline"
                          disabled={busyId === a.id}
                          onClick={() => setStatus(a, 'draft')}
                        >
                          অপ্রকাশ
                        </button>
                      ) : (
                        <button
                          className="btn-small"
                          disabled={busyId === a.id}
                          onClick={() => setStatus(a, 'published')}
                        >
                          প্রকাশ
                        </button>
                      )}
                      <button
                        className="btn-small btn-danger"
                        disabled={busyId === a.id}
                        onClick={() => handleDelete(a)}
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
    </section>
  )
      }
