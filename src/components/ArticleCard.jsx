import { Link } from 'react-router-dom'
import { getCategoryName } from '../data/categories.js'

export function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function isDemo(article) {
  return Boolean(article && article.slug && article.slug.startsWith('demo-'))
}

export function Cover({ article }) {
  if (article.cover_image) {
    return (
      <div className="cover">
        <img src={article.cover_image} alt={article.title} loading="lazy" />
      </div>
    )
  }
  return (
    <div className={'cover cover-' + article.category}>
      <span>PublicLens</span>
    </div>
  )
}

export default function ArticleCard({ article, variant = 'card', showExcerpt = true }) {
  const link = '/article/' + article.slug
  const categoryName = getCategoryName(article.category)

  if (variant === 'list') {
    return (
      <Link to={link} className="list-item">
        <Cover article={article} />
        <div>
          <span className="tag">{categoryName}</span>
          {isDemo(article) && <span className="demo-badge">ডেমো</span>}
          <h3>{article.title}</h3>
          <div className="meta">{formatDate(article.date)}</div>
        </div>
      </Link>
    )
  }

  return (
    <Link to={link} className="card">
      <Cover article={article} />
      <div style={{ marginTop: '8px' }}>
        <span className="tag">{categoryName}</span>
        {isDemo(article) && <span className="demo-badge">ডেমো</span>}
      </div>
      <h3>{article.title}</h3>
      {showExcerpt && <p>{article.excerpt}</p>}
      <div className="meta">{formatDate(article.date)}</div>
    </Link>
  )
}
