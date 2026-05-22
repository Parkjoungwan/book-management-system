import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function BookForm({ initialData = {}, onSubmit, submitLabel = '저장' }) {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: initialData.title || '',
    author: initialData.author || '',
    content: initialData.content || '',
  })

  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = '제목은 필수 입력 항목입니다.'
    if (!form.content.trim()) errs.content = '내용은 필수 입력 항목입니다.'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // 입력 시 해당 필드 에러 제거
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setIsSubmitting(true)
    setSubmitError('')
    try {
      await onSubmit(form)
    } catch (err) {
      setSubmitError(err.message || '저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-card">
        {/* 제목 */}
        <div className="form-group">
          <label className="form-label" htmlFor="title">
            제목 <span className="required">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className={`form-input ${errors.title ? 'error' : ''}`}
            placeholder="도서 제목을 입력하세요"
            value={form.title}
            onChange={handleChange}
          />
          {errors.title && <p className="form-error">{errors.title}</p>}
        </div>

        {/* 저자 */}
        <div className="form-group">
          <label className="form-label" htmlFor="author">저자</label>
          <input
            id="author"
            name="author"
            type="text"
            className="form-input"
            placeholder="저자명을 입력하세요"
            value={form.author}
            onChange={handleChange}
          />
        </div>

        {/* 내용 */}
        <div className="form-group">
          <label className="form-label" htmlFor="content">
            내용 <span className="required">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            className={`form-textarea ${errors.content ? 'error' : ''}`}
            placeholder="도서 내용이나 줄거리를 입력하세요 (AI 표지 생성에 활용됩니다)"
            value={form.content}
            onChange={handleChange}
          />
          {errors.content && <p className="form-error">{errors.content}</p>}
        </div>

        {/* 서버 에러 */}
        {submitError && (
          <div className="error-box" style={{ marginTop: 16 }}>
            ⚠️ {submitError}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? '저장 중...' : submitLabel}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            취소
          </button>
        </div>
      </div>
    </form>
  )
}
