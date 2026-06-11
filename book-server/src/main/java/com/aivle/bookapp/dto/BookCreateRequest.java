package com.aivle.bookapp.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 도서 등록 요청 DTO (POST /books)
 * - 클라이언트가 보낼 수 있는 필드만 노출 (id, createdAt, updatedAt 차단)
 * - 검증 규칙: 제목·내용 필수, 저자 선택
 */
public record BookCreateRequest(

        @NotBlank(message = "제목은 필수입니다.")
        String title,

        String author,

        @NotBlank(message = "내용은 필수입니다.")
        String content
) {
}
