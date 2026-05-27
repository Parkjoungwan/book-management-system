import { useState, useEffect, useRef } from 'react'
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
  const [isGenerating, setIsGenerating] = useState(false)
  const [saveModal, setSaveModal] = useState(false)  // 추가

  // AI 표지 생성기 토글 상태
  // - 커버 이미지가 있으면 닫힌 채로 시작, 없으면 열린 채로 시작
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false)
  const generatorInitialized = useRef(false)

  useEffect(() => {
    if (book && !generatorInitialized.current) {
      generatorInitialized.current = true
      setIsGeneratorOpen(!book.coverImageUrl)
    }
  }, [book])


  //useEffect : 도서 상세 정보 불러오기 -> 서버에서 불러옴
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
    if (!whileGenerating()) return
    if (!window.confirm(`"${book.title}" 도서를 삭제하시겠습니까?`)) return
    try {
      const res = await fetch(`${BOOKS_URL}/${id}`, { method: 'DELETE' }) 
      // http://localhost:3000/books/1 DELETE 요청 보내고 응답 오면 res에 저장
      if (!res.ok) throw new Error('삭제에 실패했습니다.')  
        // ok 아닐 경우 throw로 에러 강제 발생 -> catch로 
      navigate('/') // 메인 목록 페이지로 이동
    } catch (err) {
      setError(err.message)
    }
  }

  // AI 표지 저장 후 상태 즉시 반영 (토스트메시지에서 모달로 수정)
  const handleCoverSaved = (newCoverUrl) => {
   setBook(prev => ({ ...prev, coverImageUrl: newCoverUrl }))
    setSaveModal(true)
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
        {/* 왼쪽: 표지 + AI 생성기 */}
        <div className="book-detail-cover-col">
          {book.coverImageUrl ? ( //조건부 렌더링 시작
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

          {/* AI 표지 생성기 (토글) */}
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
              {/* AI 표지 생성기 */}
              <CoverGenerator
                book={book}
                onCoverSaved={handleCoverSaved}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
              />
            </div>
          </div>
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
              onClick={(e) => {
                if (!whileGenerating()) e.preventDefault()
              }}
            >
              ✏️ 수정
            </Link>
            <button
              className="btn btn-danger-outline"
              onClick={handleDelete} //버튼 클릭하면 handleDelete 함수 실행 : 확인창->delete 요청
            >
              🗑️ 삭제
            </button>
          </div>
        </div>
      </div>
          
      {/* 모달 추가 */}
      {saveModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ flexDirection: 'column', alignItems: 'center', gap: 16, maxWidth: 340 }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-800)' }}>
              ✅ 표지가 저장되었습니다!
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
