# 도서관리시스템
> AI를 활용한 도서표지 이미지 생성 | KT AIVLE School AI 트랙 미니프로젝트 4차

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | React 19, Vite, react-router-dom |
| 데이터 | json-server (로컬 REST API, db.json) |
| AI | OpenAI API — GPT Image 2 |

---

## 실행 방법

> **터미널 2개**가 필요합니다.

### ⚠️ Windows PowerShell 사용 시 최초 1회 설정

PowerShell은 기본적으로 `.ps1` 스크립트 실행을 차단하기 때문에 `npm` 명령어가 동작하지 않습니다.
**PowerShell을 관리자 권한으로 열고** 아래 명령어를 1회 실행해주세요.

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

> 재부팅 후에도 유지되며 다시 설정할 필요 없습니다.
> PowerShell 대신 **cmd(명령 프롬프트)** 를 사용하면 이 설정 없이도 동작합니다.

---

### 0. 최초 1회 — 의존성 설치 & DB 초기화

```bash
cd my-app
npm install
```

`db.json`은 gitignore 처리되어 있습니다. 최초 1회 루트 디렉토리에서 복사해주세요.

```bash
# 프로젝트 루트(4th_miniproject/)에서 실행
copy db.sample.json db.json
```

> macOS / Linux 환경이라면 `cp db.sample.json db.json`

### 1. json-server 실행 (터미널 1)

```bash
cd my-app
npm run server
```

→ `http://localhost:3000/books` 접속 확인

### 2. React 개발 서버 실행 (터미널 2)

```bash
cd my-app
npm run dev
```

→ `http://localhost:5173` 접속

---

## API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /books | 도서 목록 조회 |
| GET | /books/:id | 도서 상세 조회 |
| POST | /books | 도서 등록 |
| PATCH | /books/:id | 도서 수정 / AI 표지 저장 |
| DELETE | /books/:id | 도서 삭제 |

---

## OpenAI 표지 생성 기능

1. 도서 상세 페이지에서 **AI 표지 생성** 패널을 확인합니다.
2. OpenAI API Key를 입력합니다 (`.env.local`에 미리 설정 가능).
3. 품질/크기 옵션을 선택하고 **✨ AI 표지 생성** 버튼을 클릭합니다.
4. 생성된 이미지를 확인 후 **💾 이 표지로 저장**을 클릭합니다.

> ⚠️ API Key는 절대 소스코드에 하드코딩하거나 GitHub에 업로드하지 마세요.

---

## 데이터 모델 (db.json)

```json
{
  "id": 1,
  "title": "도서 제목",
  "author": "저자명",
  "content": "도서 내용 (AI 프롬프트 생성에 활용)",
  "coverImageUrl": "",
  "createdAt": "2026-04-24T09:00:00.000Z",
  "updatedAt": "2026-04-24T09:00:00.000Z"
}
```
