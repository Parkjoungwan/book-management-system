import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AUTH_URL } from '../constants/api'

function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
      }

      const data = await response.json()

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({
        userId: data.userId,
        email: data.email,
        name: data.name,
      }))

      navigate('/')
    } catch (error) {
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>로그인</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            이메일
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            비밀번호
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="auth-link">
          계정이 없나요? <Link to="/signup">회원가입</Link>
        </p>
      </section>
    </main>
  )
}

export default LoginPage