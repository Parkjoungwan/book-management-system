package com.aivle.bookapp.dto;

import jakarta.validation.constraints.NotBlank;

public record CoverGenerateRequest(

        @NotBlank(message = "API Key는 필수입니다.")
        String apiKey,

        String userPrompt,
        String size,
        String quality,
        String outputFormat
) {
}
