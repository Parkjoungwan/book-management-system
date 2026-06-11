package com.aivle.bookapp.dto;

import com.aivle.bookapp.domain.Book;

import java.time.LocalDateTime;

/**
 * 도서 응답 DTO (모든 조회/등록/수정 응답)
 * - 엔티티를 직접 노출하지 않고 필요한 필드만 외부로 전달
 * - from() 정적 팩토리로 Book → BookResponse 변환을 한 곳에서 관리
 */
public record BookResponse(
        Long id,
        String title,
        String author,
        String content,
        String coverImageUrl,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static BookResponse from(Book book) {
        return new BookResponse(
                book.getId(),
                book.getTitle(),
                book.getAuthor(),
                book.getContent(),
                book.getCoverImageUrl(),
                book.getCreatedAt(),
                book.getUpdatedAt()
        );
    }
}
