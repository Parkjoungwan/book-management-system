import { useState } from 'react'
import { BOOKS_URL } from '../../constants/api'
import { authFetch } from '../../utils/authFetch'

export default function CoverGenerator({ book, onCoverSaved, isGenerating, setIsGenerating }) {
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY || '')
  const [quality, setQuality] = useState('low')
  const [size, setSize] = useState('1024x1536')
  const [outputFormat, setOutputFormat] = useState('png')
  const [userPrompt, setUserPrompt] = useState('')

  const [isSaving, setIsSaving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    setError('')

    if (!apiKey.trim()) {
      setError('OpenAI API Key를 입력해주세요.')
      return
    }

    setIsGenerating(true)
    setPreviewUrl(null)

    try {
      const res = await authFetch(`${BOOKS_URL}/${book.id}/cover/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, userPrompt, size, quality, outputFormat }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData?.message || `이미지 생성에 실패했습니다. (${res.status})`)
      }

      const data = await res.json()
      setPreviewUrl(data.coverImageUrl)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!previewUrl) return
    setIsSaving(true)
    setError('')
    try {
      const res = await authFetch(`${BOOKS_URL}/${book.id}/covers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: previewUrl,
          quality,
          size,
          outputFormat,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || '표지 저장에 실패했습니다.')
      }

      const saved = await res.json()
      onCoverSaved(saved)
      setPreviewUrl(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="cover-generator">
      {/* 헤더 */}
      <div className="cover-generator-header">
        <span style={{ fontSize: '1.2rem' }}>✨</span>
        <span className="cover-generator-title">AI 표지 생성</span>
        <span className="cover-generator-badge">GPT Image 2</span>
      </div>

      <div className="cover-generator-body">
        {/* API Key 입력 */}
        <div className="cover-generator-field">
          <label className="cover-generator-label">OpenAI API Key</label>
          <input
            type="password"
            className="cover-generator-key-input"
            placeholder="sk-proj-..."
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            disabled={isGenerating}
          />
        </div>

        {/* 옵션 선택 */}
        <div className="cover-generator-field">
          <label className="cover-generator-label">생성 옵션</label>
          <div className="cover-generator-options">
            <select
              className="cover-generator-select"
              value={quality}
              onChange={e => setQuality(e.target.value)}
              disabled={isGenerating}
            >
              <option value="low">품질: 낮음 (빠름, 저비용)</option>
              <option value="medium">품질: 중간</option>
              <option value="high">품질: 높음 (느림, 고비용)</option>
              <option value="auto">품질: 자동</option>
            </select>
            <select
              className="cover-generator-select"
              value={size}
              onChange={e => setSize(e.target.value)}
              disabled={isGenerating}
            >
              <option value="1024x1536">1024×1536 (세로, 권장)</option>
              <option value="1024x1024">1024×1024 (정사각형)</option>
            </select>
            <select
              className="cover-generator-select"
              value={outputFormat}
              onChange={e => setOutputFormat(e.target.value)}
              disabled={isGenerating}
            >
              <option value="png">포맷: PNG (권장)</option>
              <option value="jpeg">포맷: JPEG</option>
              <option value="webp">포맷: WebP</option>
            </select>
          </div>
        </div>

        <div className="cover-generator-field">
          <label className="cover-generator-label">추가 요청 (최대 200자)</label>
          <textarea
            className="cover-generator-textarea"
            value={userPrompt}
            onChange={e => setUserPrompt(e.target.value.slice(0, 200))}
            maxLength={200}
            placeholder="표지에 반영할 스타일, 분위기, 강조하고 싶은 키워드를 입력하세요."
            rows={4}
            disabled={isGenerating}
          />
          <div className="cover-generator-help">
            {userPrompt.length}/200
          </div>
        </div>

        {/* 비용 안내 */}
        <p className="cover-generator-notice">
          ⚠️ AI 이미지 생성 시 OpenAI API 비용이 발생합니다. 품질이 낮을수록 비용이 절감됩니다.
        </p>

        {/* 에러 */}
        {error && <div className="cover-generator-error">⚠️ {error}</div>}

        {/* 생성된 표지 미리보기 모달 */}
        {previewUrl && (
          <div className="modal-overlay">
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <img
                src={previewUrl}
                alt="생성된 표지 미리보기"
                className="modal-preview-img"
              />
              <div className="modal-actions">
                <p className="modal-caption">✅ 표지가 생성되었습니다. 저장하시겠습니까?</p>
                <button className="btn btn-success" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? '저장 중...' : '💾 이력에 저장'}
                </button>
                <button
                  className="btn btn-outline"
                  onClick={handleGenerate}
                  disabled={isGenerating || isSaving}
                >
                  🔄 다시 생성
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setPreviewUrl(null)}
                  disabled={isSaving}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 생성 버튼 */}
        {!previewUrl && (
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{ alignSelf: 'flex-start' }}
          >
            {isGenerating ? (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    width: 14,
                    height: 14,
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                생성 중...
              </>
            ) : (
              '✨ AI 표지 생성'
            )}
          </button>
        )}
      </div>
    </div>
  )
}
