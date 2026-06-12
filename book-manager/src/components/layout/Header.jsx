import { Link, useNavigate } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const isLoggedIn = Boolean(localStorage.getItem('token'))

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          <span className="header-logo-icon">📚</span>
          <span className="header-logo-text">
            도서관리 <span>시스템</span>
          </span>
        </Link>

        <nav className="header-nav">
          {isLoggedIn ? (
            <>
              <span className="header-user">{user?.name}님</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                로그인
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}