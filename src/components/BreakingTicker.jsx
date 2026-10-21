import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBreaking } from '../data/articleService.js'

export default function BreakingTicker() {
  const [items, setItems] = useState([])

  useEffect(() => {
    let active = true
    getBreaking().then((list) => {
      if (active) setItems(list)
    })
    return () => {
      active = false
    }
  }, [])

  if (items.length === 0) return null

  return (
    <div className="ticker">
      <div className="container">
        <div className="ticker-label">ব্রেকিং</div>
        <div className="ticker-viewport">
          <div className="ticker-track">
            {items.map((a) => (
              <Link key={a.slug} to={'/article/' + a.slug}>
                ● {a.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
