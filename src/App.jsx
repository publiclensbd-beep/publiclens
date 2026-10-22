import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import ArticlePage from './pages/ArticlePage.jsx'
import SearchPage from './pages/SearchPage.jsx'
import NotFound from './pages/NotFound.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function ComingSoon({ title }) {
  return (
    <section>
      <h1>{title}</h1>
      <div className="notice-box">এই অংশটি পরের ধাপে যোগ হবে।</div>
    </section>
  )
}

export default function App() {
  const { pathname } = useLocation()
  const inAdmin = pathname.startsWith('/admin')

  if (inAdmin) {
    return (
      <>
        <ScrollToTop />
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="articles" element={<ComingSoon title="খবর" />} />
            <Route path="articles/new" element={<ComingSoon title="নতুন খবর" />} />
            <Route path="categories" element={<ComingSoon title="ক্যাটেগরি" />} />
            <Route path="*" element={<ComingSoon title="পাতা পাওয়া যায়নি" />} />
          </Route>
        </Routes>
      </>
    )
  }

  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="container main-area">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/article/:slug" element={<ArticlePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
