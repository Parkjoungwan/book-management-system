package com.aivle.bookapp.dto;

import com.aivle.bookapp.domain.BookCover;
import java.time.LocalDateTime;

// PR#13의 BookResponse.from(Book) 팩토리 패턴 동일 적용
public record BookCoverResponse(
        Long id,
        Long bookId,
        String imageUrl,
        String quality,
        String size,
        String outputFormat,
        Boolean isActive,
        LocalDateTime createdAt
) {
    public static BookCoverResponse from(BookCover cover) {
        return new BookCoverResponse(
                cover.getId(),
                cover.getBook().getId(),
                cover.getImageUrl(),
                cover.getQuality(),
                cover.getSize(),
                cover.getOutputFormat(),
                cover.getIsActive(),
                cover.getCreatedAt()
        );
    }
}
