import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ArticleCard from '../components/ArticleCard.jsx'
import { CATEGORIES, getCategoryName } from '../data/categories.js'
import { getByCategory } from '../data/articleService.js'

export default function CategoryPage() {
  const { slug } = useParams()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  const isValid = CATEGORIES.some((c) => c.slug === slug)
  const name = getCategoryName(slug)

  useEffect(() => {
    let active = true
    setLoading(true)
    getByCategory(slug).then((list) => {
      if (!active) return
      setArticles(list)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [slug])

  useEffect(() => {
    document.title = isValid
      ? name + ' | PublicLens'
      : 'ক্যাটেগরি পাওয়া যায়নি | PublicLens'
  }, [isValid, name])

  if (!isValid) {
    return (
      <div className="notice-box">
        <h2>ক্যাটেগরি পাওয়া যায়নি</h2>
        <p>আপনি যে ক্যাটেগরি খুঁজছেন তা নেই।</p>
        <Link to="/" className="btn">
          প্রচ্ছদে ফিরুন
        </Link>
      </div>
    )
  }

  return (
    <section>
      <h1 className="section-title">
        <span>{name}</span>
      </h1>

      {loading && <div className="notice-box">লোড হচ্ছে...</div>}

      {!loading && articles.length === 0 && (
        <div className="notice-box">
          <h2>এই ক্যাটেগরিতে এখনো কোনো খবর নেই</h2>
        </div>
      )}

      {!loading &&
        articles.map((a) => (
          <ArticleCard key={a.slug} article={a} variant="list" />
        ))}
    </section>
  )
    }
