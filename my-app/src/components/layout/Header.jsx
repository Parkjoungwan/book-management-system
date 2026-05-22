import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          <span className="header-logo-icon">📚</span>
          <span className="header-logo-text">
            도서관리 <span>시스템</span>
          </span>
        </Link>

      </div>
    </header>
  )
}
