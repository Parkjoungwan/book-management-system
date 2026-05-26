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
        const res = await fetch(`${BOOKS_URL}/${id}`) // 수정 페이지에 들어오면 기존 도서 정보를 먼저 불러옵니다. 그래야 입력 폼에 기존 제목, 저자, 내용을 채워 넣을 수 있습니다.
        if (res.status === 404) throw new Error('해당 도서를 찾을 수 없습니다.')
        if (!res.ok) throw new Error(`서버 오류 (${res.status})`)
        const data = await res.json() // await 두 번 -> 응답 -> 데이터
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
    try {
      const res = await fetch(`${BOOKS_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          updatedAt: new Date().toISOString(),
        }),
      })

      if (!res.ok) throw new Error('도서 수정에 실패했습니다.')

      window.alert('도서 정보가 수정되었습니다.')
      navigate(`/books/${id}`)
    } catch (err) {
      setError(err.message)
    }
  }
  /*
  사용자가 수정 완료 버튼을 누르면 BookForm에서 입력값을 넘겨받고, PATCH /books/:id 요청을 보냅니다.
  PATCH는 기존 도서 데이터 중 수정할 값을 갱신하는 요청입니다. 여기서는 제목, 저자, 내용과 함께 updateAt을 현재 시간으로 갱신합니다.
  요청이 성공하면 navigate를 사용해서 다시 상세 페이지로 이동합니다.
  */

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

      {/* 기존 표지 이미지 */}
      {book.coverImageUrl ? (
        <img
          src={book.coverImageUrl}
          alt={`${book.title} 표지`}
          style={{ width: 180, borderRadius: 10, marginBottom: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        />
      ) : (
        <div style={{ marginBottom: 24, color: 'var(--gray-400)' }}>
          📖 표지 없음
        </div>
      )}

      <BookForm
        initialData={book}
        onSubmit={handleSubmit}
        submitLabel="수정 완료"
      />
    </main>
  )
}
