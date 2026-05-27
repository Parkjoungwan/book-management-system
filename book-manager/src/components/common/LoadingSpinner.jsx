export default function LoadingSpinner({ message = '불러오는 중...' }) {
  return (
    <div className="loading-wrap">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  )
}
