import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ArticleCard, {
  Cover,
  formatDate,
  isDemo,
} from '../components/ArticleCard.jsx'
import { getCategoryName } from '../data/categories.js'
import { getArticle, getRelated } from '../data/articleService.js'

function toParagraphs(body) {
  if (Array.isArray(body)) return body
  if (typeof body === 'string') {
    return body.split('\n').filter((p) => p.trim() !== '')
  }
  return []
}

function setMetaDescription(text) {
  let tag = document.querySelector('meta[name="description"]')
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', 'description')
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', text)
}

export default function ArticlePage() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setCopied(false)

    async function load() {
      const found = await getArticle(slug)
      const rel = found ? await getRelated(found, 3) : []
      if (!active) return
      setArticle(found)
      setRelated(rel)
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [slug])

  useEffect(() => {
    if (article) {
      document.title = article.title + ' | PublicLens'
      setMetaDescription(article.excerpt || article.title)
    } else if (!loading) {
      document.title = 'খবর পাওয়া যায়নি | PublicLens'
    }
  }, [article, loading])

  if (loading) {
    return <div className="notice-box">লোড হচ্ছে...</div>
  }

  if (!article) {
    return (
      <div className="notice-box">
        <h2>খবরটি পাওয়া যায়নি</h2>
        <p>খবরটি সরানো হয়েছে অথবা ঠিকানাটি ভুল।</p>
        <Link to="/" className="btn">
          প্রচ্ছদে ফিরুন
        </Link>
      </div>
    )
  }

  const pageUrl = window.location.href
  const encodedUrl = encodeURIComponent(pageUrl)
  const encodedTitle = encodeURIComponent(article.title)
  const paragraphs = toParagraphs(article.body)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      window.prompt('লিংকটি কপি করুন:', pageUrl)
    }
  }

  return (
    <>
      <article className="article">
        <div>
          <Link to={'/category/' + article.category} className="tag">
            {getCategoryName(article.category)}
          </Link>
          {isDemo(article) && <span className="demo-badge">ডেমো</span>}
        </div>

        <h1>{article.title}</h1>

        <div className="meta">
          লিখেছেন: {article.author || 'PublicLens ডেস্ক'} ·{' '}
          {formatDate(article.date)}
        </div>

        {isDemo(article) && (
          <div className="demo-notice">
            ⚠️ এটি একটি নমুনা (ডেমো) লেখা। এখানকার ঘটনা, নাম ও তথ্য সম্পূর্ণ
            কাল্পনিক, কোনো আসল খবর নয়।
          </div>
        )}

        <Cover article={article} />

        <div className="article-body">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="share">
          <strong>শেয়ার করুন:</strong>
          <a
            href={'https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>
          <a
            href={'https://wa.me/?text=' + encodedTitle + '%20' + encodedUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
          <a
            href={
              'https://twitter.com/intent/tweet?text=' +
              encodedTitle +
              '&url=' +
              encodedUrl
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            X
          </a>
          <button onClick={copyLink}>
            {copied ? 'কপি হয়েছে ✓' : 'লিংক কপি'}
          </button>
        </div>
      </article>

      {related.length > 0 && (
        <section>
          <h2 className="section-title">
            <span>সম্পর্কিত খবর</span>
          </h2>
          <div className="card-grid">
            {related.map((a) => (
              <ArticleCard key={a.slug} article={a} showExcerpt={false} />
            ))}
          </div>
        </section>
      )}
    </>
  )
        }
