import { useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext.jsx'
import './admin.css'

export default function AdminLogin() {
  const { session, isAdmin, loading, signIn, signOut, configured } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    document.title = 'অ্যাডমিন লগইন | PublicLens'
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { error: err } = await signIn(email.trim(), password)
    setBusy(false)
    if (err) {
      setError('ইমেইল বা পাসওয়ার্ড ঠিক নয়। আবার চেষ্টা করুন।')
    }
  }

  if (!configured) {
    return (
      <div className="login-wrap">
        <div className="login-card">
          <h1>অ্যাডমিন লগইন</h1>
          <p className="login-error">
            ডাটাবেস সংযোগ চালু নেই। Cloudflare-এর Build variables পরীক্ষা করুন।
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="notice-box">লোড হচ্ছে...</div>
  }

  if (session && isAdmin) {
    return <Navigate to="/admin" replace />
  }

  if (session && !isAdmin) {
    return (
      <div className="login-wrap">
        <div className="login-card">
          <h1>অনুমতি নেই</h1>
          <p className="login-error">
            এই অ্যাকাউন্টে অ্যাডমিনের অনুমতি নেই।
          </p>
          <button className="btn" onClick={signOut}>
            লগআউট
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="logo-mark" style={{ margin: '0 auto 10px' }}>
          P
        </div>
        <h1>PublicLens অ্যাডমিন</h1>

        <label htmlFor="email">ইমেইল</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">পাসওয়ার্ড</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="login-error">{error}</p>}

        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'অপেক্ষা করুন...' : 'লগইন'}
        </button>

        <p style={{ marginTop: '14px', fontSize: '14px' }}>
          <Link to="/">← সাইটে ফিরুন</Link>
        </p>
      </form>
    </div>
  )
        }
