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
│       ├── domain/        # Book Entity
│       ├── repository/    # BookRepository (JpaRepository)
│       ├── service/       # BookService (@Transactional)
│       ├── controller/    # BookController (REST API)
│       ├── exception/     # BookNotFoundException, GlobalExceptionHandler
│       └── config/        # WebConfig (CORS)
└── docs/
    ├── erd.png            # Book Entity ERD
    └── api_spec.png       # API 명세서
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
→ H2 콘솔: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:bookdb`, 비밀번호 없음)

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

![API 명세서](docs/api_spec.png)

| # | Method | Endpoint | Request Body | Response | 설명 |
|---|--------|----------|--------------|----------|------|
| 1 | GET | /books | — | 200 + Book[] | 목록 조회 |
| 2 | GET | /books/{id} | — | 200 + Book | 상세 조회 |
| 3 | POST | /books | title*, author*, content | 201 + Book | 등록 |
| 4 | PATCH | /books/{id} | title?, author?, content? | 200 + Book | 부분 수정 |
| 5 | DELETE | /books/{id} | — | 204 No Content | 삭제 |
| 6 | PATCH | /books/{id}/cover | coverImageUrl | 200 + Book | AI 표지 저장 |

> 오류 응답: `404` 도서 없음 · `400` 검증 실패 (필드 오류 포함)

---

## ERD

![ERD](docs/erd.png)

| 필드 | 타입 | 제약 |
|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT |
| title | VARCHAR(255) | NOT NULL |
| author | VARCHAR(255) | NOT NULL |
| content | TEXT | nullable |
| cover_image_url | TEXT | nullable |
| created_at | TIMESTAMP | @CreationTimestamp 자동 설정 |
| updated_at | TIMESTAMP | @UpdateTimestamp 자동 갱신 |

---

## AI 표지 생성 흐름

```
React → OpenAI API (POST + API Key)
      → b64_json 응답
      → Data URL 변환 (data:image/png;base64,...)
      → PATCH /books/{id}/cover 로 Backend 저장
```

1. 도서 상세 페이지 → **AI 표지 생성** 패널 열기
2. OpenAI API Key 입력
3. 품질 / 크기 옵션 선택 → **✨ AI 표지 생성** 클릭
4. 미리보기 확인 후 **💾 이 표지로 저장** 클릭

> ⚠️ API Key는 소스코드에 하드코딩하거나 GitHub에 업로드하지 마세요.  
> `.env.local`에 `VITE_OPENAI_API_KEY=sk-...` 형태로 설정 가능합니다.
