package com.aivle.bookapp.controller;

import com.aivle.bookapp.dto.BookCoverRequest;
import com.aivle.bookapp.dto.BookCoverResponse;
import com.aivle.bookapp.service.BookCoverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/books/{bookId}/covers")
@RequiredArgsConstructor
public class BookCoverController {

    private final BookCoverService bookCoverService;

    @GetMapping
    public ResponseEntity<List<BookCoverResponse>> getCovers(@PathVariable Long bookId) {
        return ResponseEntity.ok(bookCoverService.findAllByBookId(bookId));
    }

    @PostMapping
    public ResponseEntity<BookCoverResponse> saveCover(
            @PathVariable Long bookId,
            @Valid @RequestBody BookCoverRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookCoverService.saveCover(bookId, request));
    }

    @PatchMapping("/{coverId}/activate")
    public ResponseEntity<BookCoverResponse> setActiveCover(
            @PathVariable Long bookId,
            @PathVariable Long coverId) {
        return ResponseEntity.ok(bookCoverService.setActiveCover(bookId, coverId));
    }

    @DeleteMapping("/{coverId}")
    public ResponseEntity<Void> deleteCover(
            @PathVariable Long bookId,
            @PathVariable Long coverId) {
        bookCoverService.deleteCover(bookId, coverId);
        return ResponseEntity.noContent().build();
    }
}
