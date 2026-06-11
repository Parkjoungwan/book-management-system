package com.aivle.bookapp.dto;

/**
 * AI 표지 저장 요청 DTO (PATCH /books/{id}/cover)
 * - 기존 Map<String, String> 대신 명시적 타입으로 표현
 */
public record CoverUpdateRequest(
        String coverImageUrl
) {
}
