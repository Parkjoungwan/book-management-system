package com.aivle.bookapp.controller;

import com.aivle.bookapp.dto.BookCreateRequest;
import com.aivle.bookapp.dto.BookResponse;
import com.aivle.bookapp.dto.BookUpdateRequest;
import com.aivle.bookapp.dto.CoverGenerateRequest;
import com.aivle.bookapp.dto.CoverUpdateRequest;
import com.aivle.bookapp.service.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.aivle.bookapp.domain.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    // GET /books - 목록 조회
    @GetMapping
    public ResponseEntity<Page<BookResponse>> findAll(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(bookService.findAll(search, pageable));
    }

    // GET /books/{id} - 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.findById(id));
    }

    // POST /books - 등록 (201 Created)
    @PostMapping
    public ResponseEntity<BookResponse> create(
            @Valid @RequestBody BookCreateRequest request,
            @AuthenticationPrincipal User user
    ) {
        BookResponse saved = bookService.create(request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // PATCH /books/{id} - 부분 수정 (title, author, content)
    @PatchMapping("/{id}")
    public ResponseEntity<BookResponse> update(
            @PathVariable Long id,
            @RequestBody BookUpdateRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(bookService.update(id, request, user.getId()));
    }

    // PATCH /books/{id}/cover - AI 표지 URL 저장
    @PatchMapping("/{id}/cover")
    public ResponseEntity<BookResponse> updateCover(
            @PathVariable Long id,
            @RequestBody CoverUpdateRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(bookService.updateCover(id, request.coverImageUrl(), user.getId()));
    }

    // POST /books/{id}/cover/generate - AI 표지 생성 및 DB 저장
    @PostMapping("/{id}/cover/generate")
    public ResponseEntity<BookResponse> generateCover(
            @PathVariable Long id,
            @Valid @RequestBody CoverGenerateRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(bookService.generateAndSaveCover(id, request, user.getId()));
    }

    // DELETE /books/{id} - 삭제 (204 No Content)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        bookService.delete(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
