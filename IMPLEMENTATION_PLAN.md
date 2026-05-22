# 구현 계획서
> 도서관리시스템 — AI를 활용한 도서표지 이미지 생성

---

## 1. 프로젝트 폴더 구조

```
4th_miniproject/
├── my-app/                    # React (Vite) 프로젝트
│   ├── src/
│   │   ├── constants/
│   │   │   └── api.js         # API URL 상수 (BASE_URL, OPENAI_URL)
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── Header.jsx
│   │   │   ├── book/
│   │   │   │   ├── BookCard.jsx       # 목록 카드 컴포넌트
│   │   │   │   ├── BookForm.jsx       # 등록/수정 공용 폼
│   │   │   │   └── CoverGenerator.jsx # AI 표지 생성 영역
│   │   │   └── common/
│   │   │       ├── LoadingSpinner.jsx
│   │   │       └── ErrorMessage.jsx
│   │   ├── pages/
│   │   │   ├── BooksPage.jsx          # 도서 목록
│   │   │   ├── BookDetailPage.jsx     # 도서 상세
│   │   │   ├── BookCreatePage.jsx     # 도서 등록
│   │   │   └── BookEditPage.jsx       # 도서 수정
│   │   ├── App.jsx                    # 라우팅 설정
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── db.json                    # json-server 데이터
└── README.md
```

---

## 2. 일차별 구현 계획

### Day 1 — 기획 + 환경설정 + UI 뼈대

#### M1: 기획/설계 (오전, ~13:50)
- [ ] 팀 R&R 확정
- [ ] db.json 필드 구조 확정 (id / title / author / content / coverImageUrl / createdAt / updatedAt)
- [ ] API 엔드포인트 목록 작성 (GET·POST·PATCH·DELETE /books, /books/:id)
- [ ] 4개 화면 UI 스케치 (목록 / 상세 / 등록 / 수정)

#### M2: 개발환경 + UI 뼈대 (오후, ~17:00)

**환경 설정 명령어**
```bash
# json-server 전역 설치
npm install -g json-server

# Vite + React 프로젝트 생성
npm create vite@latest my-app -- --template react
cd my-app && npm install

# (선택) MUI 설치
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled

# 실행 — 터미널 2개 동시 운영
# 터미널 1: json-server
json-server --watch ../db.json --port 3000
# 터미널 2: React
npm run dev
```

**구현 순서**
1. `db.json` 생성 (예시 도서 2~3건 포함)
2. `src/constants/api.js` 작성
   ```js
   export const BASE_URL = 'http://localhost:3000';
   export const BOOKS_URL = `${BASE_URL}/books`;
   export const OPENAI_IMAGE_URL = 'https://api.openai.com/v1/images/generations';
   ```
3. `App.jsx` 라우팅 구조 잡기 (react-router-dom)
4. `Header.jsx` — 앱 제목 + 네비게이션
5. 각 Page 컴포넌트 파일 생성 (하드코딩 Mock 데이터로 렌더링 확인)
6. Git 초기 커밋 (README.md 기본 구조 포함)

---

### Day 2 — CRUD 완성

#### M3: 조회 기능 Read (오전, ~12:00)

**BooksPage.jsx — 도서 목록**
```
useState: books=[], isLoading=false, error=null
useEffect([]):
  try
    fetch GET /books → setBooks
  catch → setError
렌더링: 로딩/에러/빈목록 분기 → BookCard 목록
```

**BookDetailPage.jsx — 도서 상세**
```
useParams: id
useState: book=null, isLoading, error
useEffect([id]):
  fetch GET /books/:id → setBook
렌더링: 표지, 제목, 저자, 내용, 등록일, 수정일
```

**핵심 패턴**
```js
// fetch + useEffect 기본 뼈대
useEffect(() => {
  const load = async () => {
    try {
      const res = await fetch(BOOKS_URL);
      if (!res.ok) throw new Error('서버 오류');
      const data = await res.json();
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  load();
}, []);
```

#### M4: 등록·수정·삭제 CUD (오후, ~17:00)

**POST — 등록**
```js
const handleCreate = async (formData) => {
  const res = await fetch(BOOKS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  });
  if (!res.ok) throw new Error('등록 실패');
  const newBook = await res.json();
  setBooks(prev => [...prev, newBook]);  // 불변성 패턴 ①
};
```

**PATCH — 수정**
```js
const handleUpdate = async (id, changedFields) => {
  const res = await fetch(`${BOOKS_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...changedFields, updatedAt: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error('수정 실패');
  const updated = await res.json();
  setBooks(prev => prev.map(b => b.id === id ? updated : b));  // 불변성 패턴 ②
};
```

**DELETE — 삭제**
```js
const handleDelete = async (id) => {
  if (!window.confirm('삭제하시겠습니까?')) return;
  const res = await fetch(`${BOOKS_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('삭제 실패');
  setBooks(prev => prev.filter(b => b.id !== id));  // 불변성 패턴 ③
};
```

---

### Day 3 — AI 연동 + UX + 발표

#### M5: OpenAI 표지 생성 (오전, ~12:00)

**CoverGenerator.jsx 구현 순서**
1. API Key 입력 `<input type="password">` UI
2. 이미지 크기/품질 선택 옵션 UI (선택)
3. `handleGenerateCover` 함수 구현

```js
const handleGenerateCover = async () => {
  // ① API Key 유효성 검사
  if (!apiKey.trim()) { alert('API Key를 입력하세요.'); return; }

  setIsGenerating(true);
  try {
    // ② 프롬프트 구성
    const prompt = `A book cover for "${book.title}" by ${book.author}. ${book.content}`;

    // ③ OpenAI 호출
    const res = await fetch(OPENAI_IMAGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-2',
        prompt,
        n: 1,
        size: '1024x1536',
        quality: 'low',        // 비용 절감용 기본값
        output_format: 'png',
      }),
    });

    // ④ 에러 처리
    if (!res.ok) {
      if (res.status === 401) throw new Error('API Key를 확인하세요. (401)');
      if (res.status === 429) throw new Error('요청 한도 초과. 잠시 후 재시도하세요. (429)');
      throw new Error(`OpenAI 오류: ${res.status}`);
    }

    // ⑤ b64_json 추출 → Data URL 변환
    const data = await res.json();
    const b64Json = data.data?.[0]?.b64_json;
    if (!b64Json) throw new Error('이미지 데이터를 받지 못했습니다.');
    const imageSrc = `data:image/png;base64,${b64Json}`;

    // ⑥ json-server PATCH 저장 (M6에서 연결)
    await saveCoverImage(book.id, imageSrc);

  } catch (err) {
    setError(err.message);
  } finally {
    setIsGenerating(false);
  }
};
```

#### M6: 저장·UX 완성 + 발표 준비 (오후, ~16:00)

**saveCoverImage 함수**
```js
const saveCoverImage = async (id, imageSrc) => {
  const res = await fetch(`${BOOKS_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coverImageUrl: imageSrc }),
  });
  if (!res.ok) throw new Error('표지 저장 실패');
  // 상태 즉시 반영
  setBook(prev => ({ ...prev, coverImageUrl: imageSrc }));
};
```

**E2E 시나리오 검증 체크리스트**
- [ ] 도서 등록 → 목록에 즉시 표시
- [ ] 도서 상세 진입 → 정보 정확히 표시
- [ ] 도서 수정 → 변경 내용 반영
- [ ] 도서 삭제 → 목록에서 즉시 제거
- [ ] AI 표지 생성 → 이미지 렌더링
- [ ] 표지 저장 → 목록/상세 모두 반영
- [ ] 새로고침 후에도 표지 유지 (json-server에 저장되었는지)

**발표 자료 구성 (PPT)**
1. 팀 소개 및 역할 분담
2. 프로젝트 개요 (주제, 기술 스택, 구성도)
3. 주요 기능 시연 (화면 스크린샷)
4. 구현 과정에서의 어려움 및 해결 방법
5. 개선/확장 아이디어

---

## 3. 기능별 우선순위 요약

| 우선순위 | 기능 | 일차 | 비고 |
|---------|------|------|------|
| **필수** | db.json 설계 + json-server 실행 | Day 1 | 모든 기능의 기반 |
| **필수** | React 라우팅 + 페이지 컴포넌트 | Day 1 | |
| **필수** | 도서 목록 조회 (GET) | Day 2 오전 | useEffect + fetch |
| **필수** | 도서 상세 조회 (GET/:id) | Day 2 오전 | |
| **필수** | 도서 등록 (POST) | Day 2 오후 | 폼 + 불변성 |
| **필수** | 도서 수정 (PATCH) | Day 2 오후 | 변경 필드만 전송 |
| **필수** | 도서 삭제 (DELETE) | Day 2 오후 | confirm 확인 |
| **필수** | AI 표지 생성 (OpenAI 호출) | Day 3 오전 | API Key 입력 UI |
| **권장** | 생성된 표지 json-server 저장 | Day 3 오전 | PATCH coverImageUrl |
| **권장** | 로딩/에러/빈목록 UX 처리 | 전 일정 | try-catch 필수 |
| **권장** | README.md 완성 | Day 3 오후 | 스크린샷 포함 |
| **도전** | 검색/필터 (Array.filter) | Day 3 여유 | |
| **도전** | 폼 유효성 검사 강화 | Day 3 여유 | |

---

## 4. 주요 에러 처리 목록

| 상황 | 처리 방법 |
|------|-----------|
| json-server 미실행 | 에러 메시지 표시 "서버에 연결할 수 없습니다" |
| GET 빈 목록 | "등록된 도서가 없습니다" 안내 문구 |
| POST/PATCH/DELETE 실패 | alert 또는 에러 상태 표시 |
| OpenAI 401 | "API Key를 확인하세요" 안내 |
| OpenAI 429 | "잠시 후 재시도하세요" 안내 |
| b64_json 없음 | "이미지 생성에 실패했습니다" 안내 |

---

## 5. Git 커밋 전략

```
feat: db.json 초기 구조 설정
feat: Vite+React 프로젝트 생성 및 라우팅 구성
feat: 도서 목록 조회 기능 구현 (M3)
feat: 도서 등록/수정/삭제 기능 구현 (M4)
feat: OpenAI GPT Image 2 표지 생성 연동 (M5)
feat: 생성된 표지 json-server 저장 기능 구현 (M6)
fix: API Key 입력 후 생성 버튼 상태 처리
docs: README.md 최종 업데이트
```

---

## 6. 체크리스트 (제출 전)

- [ ] `node_modules` 폴더 제외하고 압축
- [ ] README.md에 실행 방법 명시 (`npm install`, `npm run dev`, json-server 명령어)
- [ ] README.md에 주요 화면 스크린샷 포함
- [ ] 불필요한 `console.log` 제거
- [ ] API Key가 소스코드에 하드코딩되지 않았는지 확인
- [ ] GitHub에 최종 코드 푸시
- [ ] PPT 발표자료 완성
- [ ] 파일명 형식 확인: `AI_##조.zip`, `AI_##조.pptx`
