export default function ErrorMessage({ message }) {
  return (
    <div className="error-box">
      ⚠️ {message || '오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}
    </div>
  )
}
