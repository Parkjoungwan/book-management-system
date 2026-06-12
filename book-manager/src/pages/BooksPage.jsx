import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BOOKS_URL } from '../constants/api'
import BookCard from '../components/book/BookCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import { authFetch } from '../utils/authFetch'

export default function BooksPage() {
  const [books, setBooks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 8
  const isLoggedIn = Boolean(localStorage.getItem('token'))
  const currentUserId = JSON.parse(localStorage.getItem('user') || 'null')?.userId

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError('')
      try {
        const searchParam = appliedSearch ? `&search=${encodeURIComponent(appliedSearch)}` : ''
        const res = await fetch(
          `${BOOKS_URL}?page=${page}&size=${pageSize}&sort=createdAt,desc${searchParam}`
        )
        if (!res.ok) throw new Error(`서버 오류 (${res.status})`)
        const data = await res.json()
        setBooks(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [page, appliedSearch])

  const handleSearch = () => {
    setPage(0)
    setSelectedIds([])
    setAppliedSearch(searchInput.trim())
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleSearchReset = () => {
    setSearchInput('')
    setPage(0)
    setSelectedIds([])
    setAppliedSearch('')
  }

  const filtered = books
  const selectableBooks = filtered.filter(book => book.ownerId === currentUserId)

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
    const filteredIds = selectableBooks.map(book => book.id)
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
    for (const id of selectedIds) {
      const res = await authFetch(`${BOOKS_URL}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`도서(${id}) 삭제에 실패했습니다.`)
    }

    const nextTotalElements = totalElements - selectedIds.length
    const nextTotalPages = Math.ceil(nextTotalElements / pageSize)
    const nextPage = Math.min(page, Math.max(nextTotalPages - 1, 0))

    setSelectedIds([])
    setTotalElements(nextTotalElements)
    setTotalPages(nextTotalPages)

    if (nextPage !== page) {
      setPage(nextPage)
    } else {
      const searchParam = appliedSearch ? `&search=${encodeURIComponent(appliedSearch)}` : ''
      const res = await fetch(
        `${BOOKS_URL}?page=${nextPage}&size=${pageSize}&sort=createdAt,desc${searchParam}`
      )
      if (!res.ok) throw new Error(`서버 오류 (${res.status})`)
      const data = await res.json()

      setBooks(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    }

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
          {!isLoading && !error && `총 ${totalElements}권의 도서가 있습니다`}
        </p>
        <Link to={isLoggedIn ? '/books/new' : '/login'} className="btn btn-primary">
          + 새 도서 등록
        </Link>
      </div>

      {/* 검색 */}
      {!isLoading && !error && (books.length > 0 || appliedSearch) && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <input
            type="text"
            className="form-input"
            placeholder="제목 또는 저자로 검색"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            style={{ maxWidth: 360 }}
          />
          <button type="button" className="btn btn-primary" onClick={handleSearch}>
            검색
          </button>
          {appliedSearch && (
            <button type="button" className="btn btn-ghost" onClick={handleSearchReset}>
              초기화
            </button>
          )}
        </div>
      )}

      {/* 다중 선택 삭제 영역 */}
      {!isLoading && !error && selectableBooks.length > 0 && (
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
                selectableBooks.length > 0 &&
                selectableBooks.every(book => selectedIds.includes(book.id))
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
        <ErrorMessage message="도서 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요." />
      )}

      {/* 빈 목록 */}
      {!isLoading && !error && books.length === 0 && !appliedSearch && (
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
      {!isLoading && !error && appliedSearch && books.length === 0 && (
        <div className="empty-wrap">
          <span className="empty-icon">🔍</span>
          <p className="empty-text">"{appliedSearch}"에 대한 검색 결과가 없습니다</p>
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
              {book.ownerId === currentUserId && (
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
              )}

              <BookCard book={book} />
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 12,
            marginTop: 32,
          }}
        >
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => { setPage(prev => Math.max(prev - 1, 0)); setSelectedIds([]) }}
            disabled={page === 0}
          >
            이전
          </button>

          <span style={{ color: '#6b7280', fontSize: 14 }}>
            {page + 1} / {totalPages}
          </span>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => { setPage(prev => Math.min(prev + 1, totalPages - 1)); setSelectedIds([]) }}
            disabled={page >= totalPages - 1}
          >
            다음
          </button>
        </div>
      )}
    </main>
  )
}
