import { useNavigate, Link } from 'react-router-dom'
import { BOOKS_URL } from '../constants/api'
import BookForm from '../components/book/BookForm'
import { authFetch } from '../utils/authFetch'

export default function BookCreatePage() {
  const navigate = useNavigate()

  const handleSubmit = async (formData) => {
    const now = new Date().toISOString()
    const res = await authFetch(BOOKS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        coverImageUrl: '',
        createdAt: now,
        updatedAt: now,
      }),
    })
    if (!res.ok) throw new Error('도서 등록에 실패했습니다.')
    const newBook = await res.json()
    navigate(`/books/${newBook.id}`)
  }

  return (
    <main className="page">
      <Link to="/" className="back-link">← 도서 목록으로</Link>

      <div className="page-header">
        <div>
          <h1 className="page-title">📝 새 도서 등록</h1>
          <p className="page-subtitle">도서 정보를 입력하고 AI 표지를 생성해보세요</p>
        </div>
      </div>

      <BookForm onSubmit={handleSubmit} submitLabel="등록하기" />
    </main>
  )
}
