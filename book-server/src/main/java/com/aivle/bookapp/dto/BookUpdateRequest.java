package com.aivle.bookapp.dto;

/**
 * 도서 수정 요청 DTO (PATCH /books/{id})
 * - 부분 수정: 전달된 필드만 반영, null 필드는 기존 값 유지
 * - 검증 어노테이션을 두지 않아 일부 필드만 보낼 수 있음
 */
public record BookUpdateRequest(
        String title,
        String author,
        String content
) {
}
