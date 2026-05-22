import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { BOOKS_URL } from '../constants/api'
import BookForm from '../components/book/BookForm'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

export default function BookEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [book, setBook] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // 기존 도서 정보 불러오기
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

  // 수정 제출 — 변경된 필드만 PATCH
  const handleSubmit = async (formData) => {
    const res = await fetch(`${BOOKS_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        updatedAt: new Date().toISOString(),
      }),
    })
    if (!res.ok) throw new Error('도서 수정에 실패했습니다.')
    navigate(`/books/${id}`)
  }

  if (isLoading) return <main className="page"><LoadingSpinner message="도서 정보를 불러오는 중..." /></main>
  if (error) return <main className="page"><ErrorMessage message={error} /></main>
  if (!book) return null

  return (
    <main className="page">
      <Link to={`/books/${id}`} className="back-link">← 상세 페이지로</Link>

      <div className="page-header">
        <div>
          <h1 className="page-title">✏️ 도서 수정</h1>
          <p className="page-subtitle">"{book.title}" 정보를 수정합니다</p>
        </div>
      </div>

      <BookForm
        initialData={book}
        onSubmit={handleSubmit}
        submitLabel="수정 완료"
      />
    </main>
  )
}
