import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TITLE_MAX_LENGTH = 30
const AUTHOR_MAX_LENGTH = 20
const CONTENT_MIN_LENGTH = 10
const CONTENT_MAX_LENGTH = 1000

/* 
BookForm은 등록 페이지와 수정 페이지에서 함께 사용하는 공용 폼입니다.
수정 페이지에서는 initialData={book}을 넘겨서 기존 도서 정보를 폼의 초기값으로 보여줍니다. 
등록 페이지에서는 초기값이 비어 있기 때문에 새 도서 입력 폼처럼 동작합니다.
initialData : 기존 도서 데이터, onSubmit : 저장 버튼을 눌렀을 때 실행할 함수, submitLabel : 버튼 문구
*/

export default function BookForm({ initialData = {}, onSubmit, submitLabel = '저장' }) {
  const navigate = useNavigate()

  const initialForm = {
    title: initialData.title || '',
    author: initialData.author || '',
    content: initialData.content || '',
  }

  const [form, setForm] = useState(initialForm)
  // 입력값은 form 상태 하나로 관리합니다. title, author, content를 객체 형태로 묶어서 관리하기 때문에 입력 필드가 늘어나도 같은 방식으로 처리할 수 있습니다.

  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasChanges =
    form.title !== initialForm.title ||
    form.author !== initialForm.author ||
    form.content !== initialForm.content

  const validate = () => {
    const errs = {}
    const title = form.title.trim()
    const author = form.author.trim()
    const content = form.content.trim()

    if (!title) errs.title = '제목은 필수 입력 항목입니다.'
    else if (title.length > TITLE_MAX_LENGTH) {
      errs.title = `제목은 ${TITLE_MAX_LENGTH}자 이하로 입력해주세요.`
    }

    if (author.length > AUTHOR_MAX_LENGTH) {
      errs.author = `저자는 ${AUTHOR_MAX_LENGTH}자 이하로 입력해주세요.`
    }

    if (!content) errs.content = '내용은 필수 입력 항목입니다.'
    else if (content.length < CONTENT_MIN_LENGTH) {
      errs.content = `내용은 ${CONTENT_MIN_LENGTH}자 이상 입력해주세요.`
    } else if (content.length > CONTENT_MAX_LENGTH) {
      errs.content = `내용은 ${CONTENT_MAX_LENGTH}자 이하로 입력해주세요.`
    }

    return errs
  }
  // 제목과 내용은 필수 입력값입니다. 비어 있으면 서버 요청을 보내지 않고 에러 메세지를 보여줍니다. 저자는 선택값입니다.

  const handleChange = (e) => {
  const { name, value } = e.target

  // 1. 각 필드별 최대 글자 수 기준 설정
  let maxLength = CONTENT_MAX_LENGTH
  let fieldName = '내용'
  if (name === 'title') {
    maxLength = TITLE_MAX_LENGTH
    fieldName = '제목'
  } else if (name === 'author') {
    maxLength = AUTHOR_MAX_LENGTH
    fieldName = '저자'
  }

  // 2. 만약 입력된 값이 최대 글자 수를 초과하려고 하면?
  if (value.length > maxLength) {
    // 최대 글자수만큼만 잘라서 상태에 반영 (강제로 입력 막기)
    const truncatedValue = value.slice(0, maxLength)
    setForm(prev => ({ ...prev, [name]: truncatedValue }))
    
    // 동시에 하단에 경고 메시지 띄우기
    setErrors(prev => ({ 
      ...prev, 
      [name]: `${fieldName}은(는) ${maxLength}자 이하로 입력해주세요.` 
    }))
    return // 함수를 여기서 종료하여 더 이상의 입력을 무시합니다.
  }

  // 3. 글자 수 제한 안쪽일 때는 정상적으로 입력 허용 및 에러 제거
  setForm(prev => ({ ...prev, [name]: value }))
  if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
}
// 각 input의 name 속성을 이용해서 어떤 필드가 바뀌었는지 판단합니다. 그래서 제목, 저자, 내용 입력칸이 모두 같은 handleChange 함수를 사용할 수 있습니다.

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
      await onSubmit({
        title: form.title.trim(),
        author: form.author.trim(),
        content: form.content.trim(),
      }) // 폼 컴포넌트는 직접 API 요청을 하지 않습니다. 대신 부모 컴포넌트에서 받은 onSubmit 함수를 실행합니다. 이 구조 덕분에 같은 폼을 등록 페이지에서는 POST로,
    } catch (err) { // 수정 페이지에서는 PATCH로 다르게 사용할 수 있습니다.
      setSubmitError(err.message || '저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (
      hasChanges &&
      !window.confirm('입력한 내용이 저장되지 않습니다. 정말 나가시겠습니까?')
    ) {
      return
    }

    navigate(-1)
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
            className={`form-input ${errors.author ? 'error' : ''}`}
            placeholder="저자명을 입력하세요"
            value={form.author}
            onChange={handleChange}
          />
          {errors.author && <p className="form-error">{errors.author}</p>}
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
          <button // 취소버튼
            type="button"
            className="btn btn-ghost"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            취소
          </button>
        </div>
      </div>
    </form>
  )
}
