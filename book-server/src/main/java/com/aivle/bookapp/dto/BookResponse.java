package com.aivle.bookapp.dto;

import com.aivle.bookapp.domain.Book;

import java.time.LocalDateTime;

public record BookResponse(
        Long id,
        String title,
        String author,
        String content,
        String coverImageUrl,
        Long ownerId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static BookResponse from(Book book) {
        Long ownerId = book.getUser() != null ? book.getUser().getId() : null;

        return new BookResponse(
                book.getId(),
                book.getTitle(),
                book.getAuthor(),
                book.getContent(),
                book.getCoverImageUrl(),
                ownerId,
                book.getCreatedAt(),
                book.getUpdatedAt()
        );
    }
}