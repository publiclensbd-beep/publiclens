import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/categories.js'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="logo">
          <div className="logo-mark">P</div>
          <div>
            <div className="logo-text">PublicLens</div>
            <div className="tagline">সত্যের চোখে, বিশ্বের খবর</div>
          </div>
        </div>

        <div className="footer-cats">
          <Link to="/">প্রচ্ছদ</Link>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to={'/category/' + c.slug}>
              {c.name}
            </Link>
          ))}
        </div>

        <small>
          © {year} PublicLens। এই সাইটে বর্তমানে দেখানো সব খবর নমুনা (ডেমো)
          লেখা, কোনোটিই আসল খবর নয়।
        </small>
      </div>
    </footer>
  )
}
