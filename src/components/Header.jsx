import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { CATEGORIES } from '../data/categories.js'
import BreakingTicker from './BreakingTicker.jsx'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const today = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  function handleSearch(e) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    navigate('/search?q=' + encodeURIComponent(q))
    setQuery('')
    setOpen(false)
  }

  const linkClass = ({ isActive }) => (isActive ? 'active' : '')

  return (
    <>
      <div className="topbar">
        <div className="container">
          <span>{today}</span>
          <span>সত্যের চোখে, বিশ্বের খবর</span>
        </div>
      </div>

      <header className="site-header">
        <div className="container">
          <div className="header-row">
            <Link to="/" className="logo" onClick={() => setOpen(false)}>
              <div className="logo-mark">P</div>
              <div>
                <div className="logo-text">PublicLens</div>
                <div className="tagline">সত্যের চোখে, বিশ্বের খবর</div>
              </div>
            </Link>

            <div className="header-actions">
              <form className="search-form" onSubmit={handleSearch}>
                <input
                  type="search"
                  placeholder="খবর খুঁজুন..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit">খুঁজুন</button>
              </form>
              <button
                className="menu-btn"
                onClick={() => setOpen(!open)}
                aria-label="মেনু"
              >
                {open ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </div>

        <div className="nav-wrap">
          <div className="container">
            <nav className={open ? 'nav open' : 'nav'}>
              <NavLink to="/" end className={linkClass} onClick={() => setOpen(false)}>
                প্রচ্ছদ
              </NavLink>
              {CATEGORIES.map((c) => (
                <NavLink
                  key={c.slug}
                  to={'/category/' + c.slug}
                  className={linkClass}
                  onClick={() => setOpen(false)}
                >
                  {c.name}
                </NavLink>
              ))}
              <form className="mobile-search" onSubmit={handleSearch}>
                <input
                  type="search"
                  placeholder="খবর খুঁজুন..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit">খুঁজুন</button>
              </form>
            </nav>
          </div>
        </div>
      </header>

      <BreakingTicker />
    </>
  )
}
