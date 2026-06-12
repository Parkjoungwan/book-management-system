import { Link } from 'react-router-dom'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function BookCard({ book }) {
  return (
    <Link to={`/books/${book.id}`} className="book-card">
      {book.coverImageUrl ? (
        <img
          src={book.coverImageUrl}
          alt={`${book.title} 표지`}
          className="book-card-cover"
        />
      ) : (
        <div className="book-card-cover-placeholder">
          <span className="placeholder-icon">📘</span>
          <p>표지 없음</p>
        </div>
      )}

      <div className="book-card-body">
        <p className="book-card-title">{book.title}</p>
        <p className="book-card-author">{book.author || '저자 미상'}</p>
        <p className="book-card-date">{formatDate(book.createdAt)}</p>
      </div>
    </Link>
  )
}
