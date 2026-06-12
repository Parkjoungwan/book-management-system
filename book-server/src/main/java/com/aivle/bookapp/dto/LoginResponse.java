package com.aivle.bookapp.dto;

import com.aivle.bookapp.domain.User;
import lombok.Getter;

@Getter
public class LoginResponse {

    private final String token;
    private final Long userId;
    private final String email;
    private final String name;

    public LoginResponse(String token, User user) {
        this.token = token;
        this.userId = user.getId();
        this.email = user.getEmail();
        this.name = user.getName();
    }
}