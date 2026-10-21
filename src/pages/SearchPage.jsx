import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ArticleCard from '../components/ArticleCard.jsx'
import { searchArticles } from '../data/articleService.js'

export default function SearchPage() {
  const [params] = useSearchParams()
  const q = (params.get('q') || '').trim()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = q
      ? '"' + q + '" - সার্চ | PublicLens'
      : 'সার্চ | PublicLens'

    if (!q) {
      setResults([])
      return
    }

    let active = true
    setLoading(true)
    searchArticles(q).then((list) => {
      if (!active) return
      setResults(list)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [q])

  return (
    <section>
      <h1 className="section-title">
        <span>{q ? 'সার্চ ফলাফল: ' + q : 'সার্চ'}</span>
      </h1>

      {!q && (
        <div className="notice-box">
          <p>উপরের সার্চ বক্সে কিছু লিখে খুঁজুন।</p>
        </div>
      )}

      {q && loading && <div className="notice-box">খোঁজা হচ্ছে...</div>}

      {q && !loading && results.length === 0 && (
        <div className="notice-box">
          <h2>কিছু পাওয়া যায়নি</h2>
          <p>অন্য কোনো শব্দ দিয়ে খুঁজে দেখুন।</p>
        </div>
      )}

      {q && !loading && results.length > 0 && (
        <>
          <p className="meta" style={{ marginBottom: '8px' }}>
            {results.length}টি খবর পাওয়া গেছে
          </p>
          {results.map((a) => (
            <ArticleCard key={a.slug} article={a} variant="list" />
          ))}
        </>
      )}
    </section>
  )
            }
