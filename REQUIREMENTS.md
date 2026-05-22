# 도서관리시스템 요구명세서
> KT AIVLE School AI 트랙 미니프로젝트 4차 — AI를 활용한 도서표지 이미지 생성

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 주제 | AI 표지 생성을 지원하는 도서관리 시스템 (Frontend) |
| 목표 | React + fetch + CRUD 실전 적용 + OpenAI API 외부 연동 |
| 기간 | 3일 (일차별 점진 완성) |
| 최종 산출물 | 소스코드(GitHub) + README.md + 발표자료(PPT) |

---

## 2. 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | React 19, Vite, fetch (브라우저 내장) |
| 데이터 | json-server 0.17.4 (로컬 REST API, db.json) |
| AI | OpenAI API — GPT Image 2 모델 |
| 협업 | GitHub, Vercel (선택) |
| UI 라이브러리 | MUI (Material UI) — 선택 |

---

## 3. 데이터 모델

### 3.1 db.json 구조

```json
{
  "books": [
    {
      "id": 1,
      "title": "별빛 아래의 서점",
      "author": "홍길동",
      "content": "작은 마을 서점의 1년을 담은 에세이",
      "coverImageUrl": "",
      "createdAt": "2026-04-24T09:00:00.000Z",
      "updatedAt": "2026-04-24T09:00:00.000Z"
    }
  ]
}
```

### 3.2 필드 설명

| 필드 | 타입 | 설명 |
|------|------|------|
| id | number | json-server 자동 부여 |
| title | string | 도서 제목 (필수) |
| author | string | 저자명 |
| content | string | 도서 내용 — AI 프롬프트 생성에 활용 |
| coverImageUrl | string | 이미지 URL 또는 Data URL (초기값: 빈 문자열) |
| createdAt | ISO string | 등록일시 |
| updatedAt | ISO string | 수정일시 |

---

## 4. API 엔드포인트

json-server 실행: `npx json-server@0.17.4 --watch db.json --port 3000`

| Method | Endpoint | 설명 | 요청 Body |
|--------|----------|------|-----------|
| GET | /books | 도서 목록 조회 | — |
| GET | /books/:id | 도서 상세 조회 | — |
| POST | /books | 도서 등록 | 전체 필드 (id 제외) |
| PATCH | /books/:id | 도서 수정 / 표지 저장 | 변경 필드만 |
| DELETE | /books/:id | 도서 삭제 | — |

---

## 5. 기능 요구사항

### 5.1 필수 1 — 도서 CRUD (1~2일차)

#### ① 도서 목록 조회
- 도서 제목, 등록일, 표지 이미지(있을 경우) 카드/리스트 형태로 표시
- 컴포넌트 마운트 시 GET /books 자동 로딩 (useEffect)
- 로딩 / 에러 / 빈 목록 상태 처리 필수 (try-catch)

#### ② 도서 상세 조회
- 목록에서 클릭 시 상세 페이지로 이동
- 표지 이미지, 제목, 저자, 등록일, 수정일, 본문 내용 표시
- GET /books/:id 호출로 실제 데이터 렌더링

#### ③ 도서 등록
- [등록] 버튼으로 등록 폼 진입
- 제목, 저자, 내용 입력 필드 구성
- 유효성 검사: 필수 입력 필드 공백 금지
- POST /books 성공 후 목록으로 자동 이동

#### ④ 도서 수정
- [수정] 버튼 클릭 시 기존 정보 자동 불러오기
- 변경된 필드만 PATCH /books/:id 전송
- 폼 상태관리 + 불변성 3패턴 (`...spread`) 적용

#### ⑤ 도서 삭제
- [삭제] 버튼 클릭 시 confirm 확인창 표시
- DELETE /books/:id 성공 후 목록에서 즉시 제거
- 상태 업데이트로 화면 즉시 반영

---

### 5.2 필수 2 — AI 표지 생성 (2일차 오후 ~ 3일차 오전)

#### ⑥ AI 표지 이미지 생성
- 상세 페이지에 [AI 표지 생성] 버튼 배치
- API Key 입력 UI (`password` 타입 input)
- 도서 제목 + 내용으로 프롬프트 구성 후 GPT Image 2 호출
- 생성 중 로딩 상태 표시 및 버튼 비활성화
- 응답 `b64_json` → `data:image/png;base64,...` Data URL 변환
- 에러 처리: 401 (API Key 오류), 429 (Rate Limit), 네트워크 오류

#### OpenAI API 명세

| 항목 | 값 |
|------|-----|
| Method | POST |
| URL | https://api.openai.com/v1/images/generations |
| Header: Content-Type | application/json |
| Header: Authorization | Bearer {userApiKey} |
| Body: model | gpt-image-2 |
| Body: prompt | 도서 제목/내용 기반 구성 |
| Body: n | 1 |
| Body: size | 1024x1536 (권장) |
| Body: quality | low / medium / high / auto (선택) |
| Body: output_format | png (권장) |
| 응답 | data[0].b64_json |

---

### 5.3 권장 — 저장 · UX · 발표 (3일차)

#### ⑦ 생성된 표지 저장
- Data URL을 PATCH /books/:id의 `coverImageUrl` 필드로 저장
- 저장 성공 후 상태(setBooks/setBook) 즉시 업데이트
- 도서 목록 및 상세 페이지에 표지 자동 반영

#### ⑧ UX 완성
- E2E 시나리오 검증 (등록 → 표지 생성 → 저장 전체 플로우)
- 성공/실패 피드백 UI 제공
- 불필요한 `console.log`, 주석 제거

---

### 5.4 도전 — 확장 기능 (여유 시)

#### ⑨ 검색 · 필터
- 도서 목록에서 제목/저자 검색 UI
- `Array.filter()`로 클라이언트 사이드 필터링

#### ⑩ 폼 유효성 검사 강화
- 필수 입력 검사 + 길이 제한
- 인라인 에러 메시지 표시

---

## 6. 화면 구성 (Pages)

| 페이지 | 경로 (예시) | 주요 기능 |
|--------|------------|-----------|
| 도서 목록 | / | 전체 목록 표시, 등록 버튼 |
| 도서 상세 | /books/:id | 상세 정보, AI 표지 생성, 수정/삭제 버튼 |
| 도서 등록 | /books/new | 등록 폼 |
| 도서 수정 | /books/:id/edit | 수정 폼 (기존 데이터 불러오기) |

---

## 7. 비기능 요구사항

| 항목 | 내용 |
|------|------|
| API Key 보안 | 코드 하드코딩 금지, GitHub 업로드 금지 — 화면 input으로 직접 입력 |
| 상태 불변성 | useState 업데이트 시 spread 패턴 준수 |
| 에러 처리 | 모든 fetch 호출에 try-catch + res.ok 체크 |
| 포트 구분 | React: localhost:5173 / json-server: localhost:3000 |

---

## 8. 최종 제출물

| 파일 | 내용 |
|------|------|
| AI_##조.zip | node_modules 제외 소스코드 |
| AI_##조.pptx | 결과보고서 (발표자료) |
| README.md | 서비스 구조, 실행 방법, 주요 화면 스크린샷, API 기능 명시 |
