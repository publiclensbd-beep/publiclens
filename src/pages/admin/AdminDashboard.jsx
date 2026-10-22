import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient.js'
import { getCategoryName } from '../../data/categories.js'
import { formatDate } from '../../components/ArticleCard.jsx'
import './admin.css'

function bn(n) {
  return Number(n || 0).toLocaleString('bn-BD')
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, views: 0 })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'ড্যাশবোর্ড | PublicLens অ্যাডমিন'
    let active = true

    async function load() {
      const { data, error: err } = await supabase
        .from('articles')
        .select('slug,title,category,status,views,updated_at')
        .order('updated_at', { ascending: false })
        .limit(1000)

      if (!active) return
      if (err) {
        setError('তথ্য আনা যায়নি: ' + err.message)
        setLoading(false)
        return
      }

      const list = data || []
      setStats({
        total: list.length,
        published: list.filter((a) => a.status === 'published').length,
        draft: list.filter((a) => a.status === 'draft').length,
        views: list.reduce((sum, a) => sum + (a.views || 0), 0),
      })
      setRecent(list.slice(0, 5))
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <section>
      <h1>ড্যাশবোর্ড</h1>

      {loading && <div className="notice-box">লোড হচ্ছে...</div>}
      {error && <p className="login-error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="num">{bn(stats.total)}</div>
              <div className="label">মোট খবর</div>
            </div>
            <div className="stat-card">
              <div className="num">{bn(stats.published)}</div>
              <div className="label">প্রকাশিত</div>
            </div>
            <div className="stat-card">
              <div className="num">{bn(stats.draft)}</div>
              <div className="label">খসড়া</div>
            </div>
            <div className="stat-card">
              <div className="num">{bn(stats.views)}</div>
              <div className="label">মোট ভিউ</div>
            </div>
          </div>

          <h2 className="section-title">
            <span>সর্বশেষ বদলানো খবর</span>
          </h2>

          {recent.length === 0 ? (
            <div className="notice-box">এখনো কোনো খবর নেই।</div>
          ) : (
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>শিরোনাম</th>
                    <th>ক্যাটেগরি</th>
                    <th>অবস্থা</th>
                    <th>হালনাগাদ</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((a) => (
                    <tr key={a.slug}>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  )
                    }
