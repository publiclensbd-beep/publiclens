import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ArticleCard from '../components/ArticleCard.jsx'
import { CATEGORIES } from '../data/categories.js'
import {
  getFeatured,
  getLatest,
  getPopular,
  getByCategory,
} from '../data/articleService.js'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [latest, setLatest] = useState([])
  const [popular, setPopular] = useState([])
  const [byCategory, setByCategory] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      const [f, l, p] = await Promise.all([
        getFeatured(3),
        getLatest(6),
        getPopular(5),
      ])
      const cats = {}
      for (const c of CATEGORIES) {
        const list = await getByCategory(c.slug)
        cats[c.slug] = list.slice(0, 3)
      }
      if (!active) return
      setFeatured(f)
      setLatest(l)
      setPopular(p)
      setByCategory(cats)
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  document.title = 'PublicLens — সত্যের চোখে, বিশ্বের খবর'

  if (loading) {
    return <div className="notice-box">লোড হচ্ছে...</div>
  }

  const [main, ...others] = featured

  return (
    <>
      {main && (
        <div className="hero-grid">
          <div className="hero-main">
            <ArticleCard article={main} />
          </div>
          <div className="hero-side">
            {others.map((a) => (
              <ArticleCard key={a.slug} article={a} showExcerpt={false} />
            ))}
          </div>
        </div>
      )}

      <div className="layout">
        <section>
          <h2 className="section-title">
            <span>সর্বশেষ খবর</span>
          </h2>
          {latest.map((a) => (
            <ArticleCard key={a.slug} article={a} variant="list" />
          ))}
        </section>

        <aside>
          <h2 className="section-title">
            <span>জনপ্রিয় খবর</span>
          </h2>
          <ol className="popular-list">
            {popular.map((a) => (
              <li key={a.slug}>
                <Link to={'/article/' + a.slug}>{a.title}</Link>
              </li>
            ))}
          </ol>
        </aside>
      </div>

      {CATEGORIES.map((c) => {
        const list = byCategory[c.slug] || []
        if (list.length === 0) return null
        return (
          <section key={c.slug}>
            <h2 className="section-title">
              <Link to={'/category/' + c.slug}>
                <span>{c.name}</span>
              </Link>
            </h2>
            <div className="card-grid">
              {list.map((a) => (
                <ArticleCard key={a.slug} article={a} showExcerpt={false} />
              ))}
            </div>
          </section>
        )
      })}
    </>
  )
          }
