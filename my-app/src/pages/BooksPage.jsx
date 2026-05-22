import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BOOKS_URL } from '../constants/api'
import BookCard from '../components/book/BookCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

export default function BooksPage() {
  const [books, setBooks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(BOOKS_URL)
        if (!res.ok) throw new Error(`서버 오류 (${res.status})`)
        const data = await res.json()
        setBooks(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // 클라이언트 사이드 검색 필터
  const filtered = books.filter(
    b =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.author || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="page">
      {/* 페이지 헤더 */}
      <div className="page-header">
        <p className="page-subtitle">
          {!isLoading && !error && `총 ${books.length}권의 도서가 있습니다`}
        </p>
        <Link to="/books/new" className="btn btn-primary">
          + 새 도서 등록
        </Link>
      </div>

      {/* 검색 */}
      {!isLoading && !error && books.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <input
            type="text"
            className="form-input"
            placeholder="🔍 제목 또는 저자로 검색"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 360 }}
          />
        </div>
      )}

      {/* 로딩 */}
      {isLoading && <LoadingSpinner message="도서 목록을 불러오는 중..." />}

      {/* 에러 */}
      {!isLoading && error && (
        <ErrorMessage message={`도서 목록을 불러오지 못했습니다. json-server가 실행 중인지 확인해주세요. (${error})`} />
      )}

      {/* 빈 목록 */}
      {!isLoading && !error && books.length === 0 && (
        <div className="empty-wrap">
          <span className="empty-icon">📭</span>
          <p className="empty-text">등록된 도서가 없습니다</p>
          <p className="empty-sub">새 도서를 등록해보세요!</p>
          <Link to="/books/new" className="btn btn-primary" style={{ marginTop: 8 }}>
            + 첫 번째 도서 등록
          </Link>
        </div>
      )}

      {/* 검색 결과 없음 */}
      {!isLoading && !error && books.length > 0 && filtered.length === 0 && (
        <div className="empty-wrap">
          <span className="empty-icon">🔍</span>
          <p className="empty-text">"{search}"에 대한 검색 결과가 없습니다</p>
          <button className="btn btn-ghost" onClick={() => setSearch('')}>
            검색어 초기화
          </button>
        </div>
      )}

      {/* 도서 그리드 */}
      {!isLoading && !error && filtered.length > 0 && (
        <div className="books-grid">
          {filtered.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </main>
  )
}
