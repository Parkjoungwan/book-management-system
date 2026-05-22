import { useState } from 'react'
import { BOOKS_URL, OPENAI_IMAGE_URL } from '../../constants/api'

export default function CoverGenerator({ book, onCoverSaved }) {
  const [apiKey, setApiKey] = useState(
    import.meta.env.VITE_OPENAI_API_KEY || ''
  )
  const [quality, setQuality] = useState('low')
  const [size, setSize] = useState('1024x1536')
  const [outputFormat, setOutputFormat] = useState('png')

  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState('')

  // 프롬프트 구성
  const buildPrompt = () => {
    const base = `A beautiful book cover for a book titled "${book.title}"`
    const author = book.author ? ` by ${book.author}` : ''
    const content = book.content
      ? `. The book is about: ${book.content.slice(0, 200)}`
      : ''
    return (
      base +
      author +
      content +
      '. Professional book cover design, high quality illustration, visually appealing.'
    )
  }

  // AI 표지 생성
  const handleGenerate = async () => {
    setError('')

    if (!apiKey.trim()) {
      setError('OpenAI API Key를 입력해주세요.')
      return
    }

    setIsGenerating(true)
    setPreviewUrl(null)

    try {
      const prompt = buildPrompt()

      const res = await fetch(OPENAI_IMAGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-image-2',
          prompt,
          n: 1,
          size,
          quality,
          output_format: outputFormat,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        const msg = errData?.error?.message || ''
        if (res.status === 401) throw new Error(`API Key가 유효하지 않습니다. (401) ${msg}`)
        if (res.status === 429) throw new Error(`요청 한도를 초과했습니다. 잠시 후 재시도해주세요. (429)`)
        if (res.status === 400) throw new Error(`잘못된 요청입니다. (400) ${msg}`)
        throw new Error(`OpenAI 오류가 발생했습니다. (${res.status}) ${msg}`)
      }

      const data = await res.json()
      const b64Json = data?.data?.[0]?.b64_json
      if (!b64Json) throw new Error('이미지 데이터를 받지 못했습니다. 응답을 확인해주세요.')

      const imageSrc = `data:image/${outputFormat};base64,${b64Json}`
      setPreviewUrl(imageSrc)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  // 생성된 표지 json-server에 저장
  const handleSave = async () => {
    if (!previewUrl) return
    setIsSaving(true)
    setError('')
    try {
      const res = await fetch(`${BOOKS_URL}/${book.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coverImageUrl: previewUrl,
          updatedAt: new Date().toISOString(),
        }),
      })
      if (!res.ok) throw new Error('표지 저장에 실패했습니다.')

      onCoverSaved(previewUrl)   // 부모 상태 업데이트
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

        {/* 비용 안내 */}
        <p className="cover-generator-notice">
          ⚠️ AI 이미지 생성 시 OpenAI API 비용이 발생합니다. 품질이 낮을수록 비용이 절감됩니다.
        </p>

        {/* 에러 */}
        {error && <div className="cover-generator-error">⚠️ {error}</div>}

        {/* 생성된 표지 미리보기 */}
        {previewUrl && (
          <div className="cover-preview-wrap">
            <img
              src={previewUrl}
              alt="생성된 표지 미리보기"
              className="cover-preview-img"
            />
            <div className="cover-preview-actions">
              <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)', marginBottom: 4 }}>
                ✅ 표지가 생성되었습니다.<br />저장하시겠습니까?
              </p>
              <button
                className="btn btn-success btn-sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? '저장 중...' : '💾 이 표지로 저장'}
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={handleGenerate}
                disabled={isGenerating || isSaving}
              >
                🔄 다시 생성
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPreviewUrl(null)}
                disabled={isSaving}
              >
                취소
              </button>
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
