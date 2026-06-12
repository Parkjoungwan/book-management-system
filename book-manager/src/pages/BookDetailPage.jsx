import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { BOOKS_URL } from '../constants/api'
import CoverGenerator from '../components/book/CoverGenerator'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import { authFetch } from '../utils/authFetch'

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
  const [covers, setCovers] = useState([])          // 표지 이력 갤러리 추가
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [saveModal, setSaveModal] = useState(false)
  const [galleryActionId, setGalleryActionId] = useState(null) // 진행 중인 갤러리 액션 coverId

  // AI 표지 생성기 토글 상태
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(true)
  const generatorInitialized = useRef(false)
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const isOwner = Boolean(user?.userId && book?.ownerId && user.userId === book.ownerId)

  useEffect(() => {
    if (book && !generatorInitialized.current) {
      generatorInitialized.current = true
      setIsGeneratorOpen(!book.coverImageUrl)
    }
  }, [book])

  // 도서 상세 정보 불러오기
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BOOKS_URL}/${id}`)

      if (res.status === 403) {
        throw new Error('본인이 등록한 도서만 상세 조회할 수 있습니다.')
      }

      if (res.status === 404) {
        throw new Error('해당 도서를 찾을 수 없습니다.')
      }

      if (!res.ok) {
        throw new Error(`서버 오류 (${res.status})`)
      }

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

  // 표지 이력 갤러리 불러오기
  useEffect(() => {
    if (!id || !isOwner) return
    const loadCovers = async () => {
      try {
        const res = await authFetch(`${BOOKS_URL}/${id}/covers`)
        if (!res.ok) return 
        const data = await res.json()
        setCovers(data)
      } catch {
        // 갤러리 로딩 실패는 무시
      }
    }
    loadCovers()
  }, [id, isOwner])

  // 도서 삭제
  const handleDelete = async () => {
    if (!whileGenerating()) return
    if (!window.confirm(`"${book.title}" 도서를 삭제하시겠습니까?`)) return
    try {
      const res = await authFetch(`${BOOKS_URL}/${id}`, { method: 'DELETE' }) 
      // http://localhost:3000/books/1 DELETE 요청 보내고 응답 오면 res에 저장
      if (!res.ok) throw new Error('삭제에 실패했습니다.')  
        // ok 아닐 경우 throw로 에러 강제 발생 -> catch로 
      navigate('/') // 메인 목록 페이지로 이동
    } catch (err) {
      setError(err.message)
    }
  }

  // AI 표지 이력에 저장 후 갤러리 갱신 (isActive:false로 저장됨 -> 대표 표지는 따로 지정)
  const handleCoverSaved = (savedCover) => {
    setCovers(prev => [savedCover, ...prev])
    setSaveModal(true)
  }

  // 갤러리 썸네일 클릭 → 대표 표지 지정 (PATCH activate)
  const handleSelectCover = async (coverId) => {
    if (galleryActionId) return
    setGalleryActionId(coverId)
    try {
      const res = await authFetch(
        `${BOOKS_URL}/${id}/covers/${coverId}/activate`,
        { method: 'PATCH' }
      )
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || '대표 표지 지정에 실패했습니다.')
      }
      const updated = await res.json() // isActive:true

      // 갤러리 isActive 상태 일괄 갱신
      setCovers(prev => prev.map(c => ({ ...c, isActive: c.id === coverId })))
      // 상세 페이지 대표 표지 즉시 반영
      setBook(prev => ({ ...prev, coverImageUrl: updated.imageUrl }))
    } catch (err) {
      alert(err.message)
    } finally {
      setGalleryActionId(null)
    }
  }

  // 갤러리 삭제 버튼 -> 표지 단건 삭제 (DELETE)
  const handleDeleteCover = async (e, cover) => {
    e.stopPropagation() // 썸네일 클릭(activate) 방지
    if (galleryActionId) return
    if (!window.confirm('이 표지를 삭제하시겠습니까?')) return

    setGalleryActionId(cover.id)
    try {
      const res = await authFetch(
        `${BOOKS_URL}/${id}/covers/${cover.id}`,
        { method: 'DELETE' }
      )
      if (!res.ok) throw new Error('삭제에 실패했습니다.')

      setCovers(prev => prev.filter(c => c.id !== cover.id))
      // 대표 표지였다면 coverImageUrl 초기화
      if (cover.isActive) {
        setBook(prev => ({ ...prev, coverImageUrl: null }))
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setGalleryActionId(null)
    }
  }

  const whileGenerating = () => {
    if (!isGenerating) return true
    return window.confirm(
      'AI 이미지 생성 중입니다. 진행하면 생성 작업이 취소될 수 있습니다. 계속하시겠습니까?'
    )
  }

  if (isLoading) return <main className="page"><LoadingSpinner message="도서 정보를 불러오는 중..." /></main>
  if (error) return <main className="page"><ErrorMessage message={error} /></main>
  if (!book) return null

  return (
    <main className="page">
      {/* 뒤로 가기 */}
      <Link
        to="/"
        className="back-link"
        onClick={(e) => {
          if (!whileGenerating()) e.preventDefault()
        }}
      >
        ← 도서 목록으로
      </Link>

      <div className="book-detail">
        {/* 왼쪽: 표지 + 갤러리 + AI 생성기 */}
        <div className="book-detail-cover-col">
          {/* 대표 표지 */}
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

          {/* 표지 이력 갤러리 (토글) */}
          {isOwner && covers.length > 0 && (
            <div className="generator-toggle">
              <button
                className="generator-toggle-btn"
                onClick={() => setIsGalleryOpen(prev => !prev)}
                aria-expanded={isGalleryOpen}
              >
                <span className="generator-toggle-label">
                  <span>🖼️</span>
                  <span>표지 이력</span>
                  <span style={{ fontWeight: 400, color: 'var(--gray-400)', fontSize: '0.8rem' }}>{covers.length}개</span>
                </span>
                <span className={`generator-toggle-chevron${isGalleryOpen ? ' open' : ''}`}>▾</span>
              </button>
              <div className={`generator-collapse${isGalleryOpen ? ' open' : ''}`}>
                <div className="cover-gallery">
                  <div className="cover-gallery-grid">
                    {covers.map(cover => (
                      <div
                        key={cover.id}
                        className={`cover-thumb-wrap${cover.isActive ? ' active' : ''}${galleryActionId === cover.id ? ' loading' : ''}`}
                        onClick={() => !cover.isActive && handleSelectCover(cover.id)}
                      >
                        <img
                          src={cover.imageUrl}
                          alt="표지 이력"
                          className="cover-thumb-img"
                        />
                        {cover.isActive && (
                          <span className="cover-thumb-active-badge">대표</span>
                        )}
                        {galleryActionId === cover.id ? (
                          <div className="cover-thumb-spinner" />
                        ) : (
                          <button
                            className="cover-thumb-delete"
                            onClick={(e) => handleDeleteCover(e, cover)}
                            title="삭제"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI 표지 생성기 (토글) */}
          {isOwner && (
          <div className="generator-toggle">
            <button
              className="generator-toggle-btn"
              onClick={() => setIsGeneratorOpen(prev => !prev)}
              aria-expanded={isGeneratorOpen}
            >
              <span className="generator-toggle-label">
                <span>✨</span>
                <span>AI 표지 생성</span>
              </span>
              <span className={`generator-toggle-chevron${isGeneratorOpen ? ' open' : ''}`}>▾</span>
            </button>
            <div className={`generator-collapse${isGeneratorOpen ? ' open' : ''}`}>
              <CoverGenerator
                book={book}
                onCoverSaved={handleCoverSaved}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
              />
            </div>
          </div>
          )}
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
          {isOwner && (
          <div className="book-detail-actions">
            <Link
              to={`/books/${id}/edit`}
              className="btn btn-outline"
              onClick={(e) => {
                if (!whileGenerating()) e.preventDefault()
              }}
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
          )}
        </div>
      </div>

      {/* 저장 완료 모달 */}
      {saveModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ flexDirection: 'column', alignItems: 'center', gap: 16, maxWidth: 340 }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-800)', textAlign: 'center' }}>
              💾 표지 이력에 저장되었습니다!
            </p>
            <p style={{ fontSize: '0.88rem', color: 'var(--gray-500)', textAlign: 'center' }}>
              왼쪽 갤러리에서 썸네일을 클릭하면<br/>대표 표지로 지정할 수 있습니다.
            </p>
            <button className="btn btn-primary" onClick={() => setSaveModal(false)}>
              확인
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
