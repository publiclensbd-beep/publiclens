import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  useEffect(() => {
    document.title = 'পাতাটি পাওয়া যায়নি | PublicLens'
  }, [])

  return (
    <div className="notice-box">
      <h2>৪০৪ — পাতাটি পাওয়া যায়নি</h2>
      <p>আপনি যে পাতাটি খুঁজছেন সেটি নেই অথবা সরিয়ে ফেলা হয়েছে।</p>
      <Link to="/" className="btn">
        প্রচ্ছদে ফিরুন
      </Link>
    </div>
  )
}
