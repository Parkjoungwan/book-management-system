package com.aivle.bookapp.controller;

import com.aivle.bookapp.dto.BookCoverRequest;
import com.aivle.bookapp.dto.BookCoverResponse;
import com.aivle.bookapp.domain.User;
import com.aivle.bookapp.service.BookCoverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/books/{bookId}/covers")
@RequiredArgsConstructor
public class BookCoverController {

    private final BookCoverService bookCoverService;

    @GetMapping
    public ResponseEntity<List<BookCoverResponse>> getCovers(
            @PathVariable Long bookId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(bookCoverService.findAllByBookId(bookId, user.getId()));
    }

    @PostMapping
    public ResponseEntity<BookCoverResponse> saveCover(
            @PathVariable Long bookId,
            @Valid @RequestBody BookCoverRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookCoverService.saveCover(bookId, request, user.getId()));
    }

    @PatchMapping("/{coverId}/activate")
    public ResponseEntity<BookCoverResponse> setActiveCover(
            @PathVariable Long bookId,
            @PathVariable Long coverId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(bookCoverService.setActiveCover(bookId, coverId, user.getId()));
    }

    @DeleteMapping("/{coverId}")
    public ResponseEntity<Void> deleteCover(
            @PathVariable Long bookId,
            @PathVariable Long coverId,
            @AuthenticationPrincipal User user
    ) {
        bookCoverService.deleteCover(bookId, coverId, user.getId());
        return ResponseEntity.noContent().build();
    }
}
