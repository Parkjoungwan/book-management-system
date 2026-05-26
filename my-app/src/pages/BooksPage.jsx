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
  const [selectedIds, setSelectedIds] = useState([])

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

  // 개별 도서 선택 / 선택 해제
  const handleSelectBook = (bookId) => {
    setSelectedIds(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    )
  }

  // 현재 화면에 보이는 검색 결과 기준 전체 선택 / 전체 해제
  const handleSelectAll = () => {
    const filteredIds = filtered.map(book => book.id)
    const isAllSelected = filteredIds.every(id => selectedIds.includes(id))

    if (isAllSelected) {
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)))
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...filteredIds])])
    }
  }

  // 선택한 도서 다중 삭제
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      window.alert('삭제할 도서를 선택해주세요.')
      return
    }

    const ok = window.confirm(`${selectedIds.length}개의 도서를 삭제하시겠습니까?`)
    if (!ok) return

    try {
      const responses = await Promise.all(
        selectedIds.map(id =>
          fetch(`${BOOKS_URL}/${id}`, {
            method: 'DELETE',
          })
        )
      )

      const hasFailed = responses.some(res => !res.ok)
      if (hasFailed) throw new Error('일부 도서 삭제에 실패했습니다.')

      setBooks(prev => prev.filter(book => !selectedIds.includes(book.id)))
      setSelectedIds([])

      window.alert('선택한 도서가 삭제되었습니다.')
    } catch (err) {
      setError(err.message)
    }
  }

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

      {/* 다중 선택 삭제 영역 */}
      {!isLoading && !error && filtered.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={
                filtered.length > 0 &&
                filtered.every(book => selectedIds.includes(book.id))
              }
              onChange={handleSelectAll}
            />
            전체 선택
          </label>

          <button
            type="button"
            className="btn btn-danger-outline"
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
          >
            선택 삭제
          </button>

          {selectedIds.length > 0 && (
            <span style={{ color: '#6b7280', fontSize: 14 }}>
              {selectedIds.length}권 선택됨
            </span>
          )}
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
            <div
              key={book.id}
              style={{
                position: 'relative',
              }}
            >
              <label
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  zIndex: 10,
                  background: 'white',
                  borderRadius: 8,
                  padding: '6px 8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(book.id)}
                  onChange={() => handleSelectBook(book.id)}
                />
              </label>

              <BookCard book={book} />
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
