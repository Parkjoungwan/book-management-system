# 도서관리시스템
> AI를 활용한 도서표지 이미지 생성 | KT AIVLE School AI 트랙 미니프로젝트 5차

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | React 19, Vite, react-router-dom |
| Backend | Spring Boot 3.2, Spring Data JPA, H2 Database |
| AI | OpenAI API — GPT Image 2 |
| 협업 | GitHub |

---

## 프로젝트 구조

```
4th_miniproject/
├── book-manager/          # Frontend (React + Vite)
│   └── src/
│       ├── components/    # BookCard, BookForm, CoverGenerator 등
│       ├── pages/         # BooksPage, BookDetailPage, BookCreatePage, BookEditPage
│       └── constants/     # API URL 상수
├── book-server/           # Backend (Spring Boot)
│   └── src/main/java/com/aivle/bookapp/
│       ├── domain/        # Book, BookCover Entity
│       ├── repository/    # BookRepository, BookCoverRepository
│       ├── service/       # BookService, BookCoverService (@Transactional)
│       ├── controller/    # BookController, BookCoverController (REST API)
│       ├── dto/           # BookCoverRequest, BookCoverResponse 등
│       ├── exception/     # BookNotFoundException, BookCoverNotFoundException, GlobalExceptionHandler
│       └── config/        # WebConfig (CORS)
└── docs/
    ├── erd.svg            # Book / BookCover ERD
    └── api_spec.svg       # API 명세서
```

---

## 실행 방법

> **터미널 2개** 필요 (Frontend / Backend 각각)

### Backend 실행

```bash
# IntelliJ에서 book-server/ 폴더 열기
# BookappApplication.java → Run
```

또는 Maven으로 직접 실행:

```bash
cd book-server
./mvnw spring-boot:run
```

→ `http://localhost:8080` 기동 확인  
→ H2 콘솔: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/bookdb`, 비밀번호 없음)

### Frontend 실행

> ⚠️ Windows PowerShell 최초 1회 설정 (관리자 권한)
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

```bash
cd book-manager
npm install
npm run dev
```

→ `http://localhost:5173` 접속

---

## API 명세서

![API 명세서](docs/api_spec.svg)

**필드 표기:** `*` 필수 필드 · `?` 선택 필드 (생략 가능)

### 오류 응답

요청이 실패하면 아래 형태의 JSON을 상태 코드와 함께 반환합니다.

```json
{
  "status": 404,
  "message": "도서를 찾을 수 없습니다. id: 99",
  "errors": null
}
```

| 상태 | 발생 상황 | 예외 | 비고 |
|------|-----------|------|------|
| `404` | 존재하지 않는 도서/표지 id로 조회·수정·삭제 | `BookNotFoundException`, `BookCoverNotFoundException` | — |
| `400` | 필수 필드 누락 등 입력값 검증 실패 | `MethodArgumentNotValidException` | 실패한 필드별 메시지를 `errors` 맵에 담아 반환 |
| `400` | 다른 도서에 속한 표지를 활성화·삭제 시도 (소유권 불일치) | `IllegalArgumentException` | `coverId`가 경로의 `bookId`에 속하지 않을 때 |

> **검증 실패(`400`)** 예시 — `errors`에 필드별 사유 포함:
> ```json
> {
>   "status": 400,
>   "message": "입력값이 올바르지 않습니다.",
>   "errors": { "title": "제목은 필수입니다." }
> }
> ```

---

## ERD

![ERD](docs/erd.svg)

> BOOK : BOOK_COVER = 1 : N (cascade=ALL, orphanRemoval=true)

---

## AI 표지 생성 흐름

```
React → POST /books/{id}/cover/generate (Backend 프록시)
      → Backend → OpenAI API 호출
      → b64_json 응답 → Data URL 변환
      → Book.coverImageUrl 저장 + BookCover 이력 저장
```

1. 도서 상세 페이지 → **AI 표지 생성** 패널 열기
2. OpenAI API Key 입력
3. 품질 / 크기 옵션 선택 → **✨ AI 표지 생성** 클릭
4. 미리보기 확인 후 **💾 이 표지로 저장** 클릭
5. 표지 이력에서 이전 표지 조회 및 대표 표지 변경 가능

> ⚠️ API Key는 소스코드에 하드코딩하거나 GitHub에 업로드하지 마세요.  
> `.env.local`에 `VITE_OPENAI_API_KEY=sk-...` 형태로 설정 가능합니다.
