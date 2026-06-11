package com.aivle.bookapp.dto;

import jakarta.validation.constraints.NotBlank;

// PR#13의 DTO 네이밍 컨벤션(Request/Response) 준수
public record BookCoverRequest(
        @NotBlank(message = "이미지 URL은 필수입니다.")
        String imageUrl,
        String quality,
        String size,
        String outputFormat
) {}
