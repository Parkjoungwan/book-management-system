import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { BOOKS_URL } from '../constants/api'
import CoverGenerator from '../components/book/CoverGenerator'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function BookDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [book, setBook] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BOOKS_URL}/${id}`)
        if (res.status === 404) throw new Error('해당 도서를 찾을 수 없습니다.')
        if (!res.ok) throw new Error(`서버 오류 (${res.status})`)
        const data = await res.json()
        setBook(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id])

  // 도서 삭제
  const handleDelete = async () => {
    if (!window.confirm(`"${book.title}" 도서를 삭제하시겠습니까?`)) return
    try {
      const res = await fetch(`${BOOKS_URL}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('삭제에 실패했습니다.')
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  // AI 표지 저장 후 상태 즉시 반영
  const handleCoverSaved = (newCoverUrl) => {
    setBook(prev => ({ ...prev, coverImageUrl: newCoverUrl }))
    showToast('✅ 표지가 저장되었습니다!')
  }

  // 토스트 메시지
  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  if (isLoading) return <main className="page"><LoadingSpinner message="도서 정보를 불러오는 중..." /></main>
  if (error) return <main className="page"><ErrorMessage message={error} /></main>
  if (!book) return null

  return (
    <main className="page">
      {/* 뒤로 가기 */}
      <Link to="/" className="back-link">← 도서 목록으로</Link>

      <div className="book-detail">
        {/* 왼쪽: 표지 + AI 생성기 */}
        <div className="book-detail-cover-col">
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={`${book.title} 표지`}
              className="book-detail-cover"
            />
          ) : (
            <div className="book-detail-cover-placeholder">
              <span className="placeholder-icon">📖</span>
              <p>표지 없음</p>
            </div>
          )}

          {/* AI 표지 생성기 */}
          <CoverGenerator book={book} onCoverSaved={handleCoverSaved} />
        </div>

        {/* 오른쪽: 도서 정보 */}
        <div className="book-detail-info">
          <div>
            <h1 className="book-detail-title">{book.title}</h1>
            <p className="book-detail-author">
              ✍️ {book.author || '저자 미상'}
            </p>
          </div>

          {/* 메타 정보 */}
          <div className="book-meta">
            <span className="book-meta-item">📅 등록: {formatDate(book.createdAt)}</span>
            <span className="book-meta-item">🔄 수정: {formatDate(book.updatedAt)}</span>
          </div>

          {/* 내용 */}
          <div className="book-content-section">
            <p className="book-content-label">도서 내용</p>
            <p className="book-content-text">{book.content || '(내용 없음)'}</p>
          </div>

          {/* 액션 버튼 */}
          <div className="book-detail-actions">
            <Link
              to={`/books/${id}/edit`}
              className="btn btn-outline"
            >
              ✏️ 수정
            </Link>
            <button
              className="btn btn-danger-outline"
              onClick={handleDelete}
            >
              🗑️ 삭제
            </button>
          </div>
        </div>
      </div>

      {/* 토스트 메시지 */}
      {toast && <div className="toast">{toast}</div>}
    </main>
  )
}
