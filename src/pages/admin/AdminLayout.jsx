import { useEffect } from 'react'
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext.jsx'
import './admin.css'

export default function AdminLayout() {
  const { session, isAdmin, loading, signOut, configured } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let tag = document.querySelector('meta[name="robots"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute('name', 'robots')
      document.head.appendChild(tag)
    }
    tag.setAttribute('content', 'noindex, nofollow')
    return () => {
      tag.setAttribute('content', 'index, follow')
    }
  }, [])

  if (!configured) {
    return <Navigate to="/admin/login" replace />
  }

  if (loading) {
    return <div className="notice-box">লোড হচ্ছে...</div>
  }

  if (!session || !isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  async function handleLogout() {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  const linkClass = ({ isActive }) => (isActive ? 'active' : '')

  return (
    <>
      <div className="admin-bar">
        <div className="container admin-bar-inner">
          <strong>PublicLens অ্যাডমিন</strong>
          <nav className="admin-nav">
            <NavLink to="/admin" end className={linkClass}>
              ড্যাশবোর্ড
            </NavLink>
            <NavLink to="/admin/articles" end className={linkClass}>
              খবর
            </NavLink>
            <NavLink to="/admin/articles/new" className={linkClass}>
              নতুন খবর
            </NavLink>
            <NavLink to="/admin/categories" className={linkClass}>
              ক্যাটেগরি
            </NavLink>
            <a href="/" target="_blank" rel="noopener noreferrer">
              সাইট দেখুন
            </a>
            <button onClick={handleLogout}>লগআউট</button>
          </nav>
        </div>
      </div>

      <main className="container admin-main">
        <Outlet />
      </main>
    </>
  )
}
