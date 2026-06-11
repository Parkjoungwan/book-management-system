package com.aivle.bookapp.exception;

public class BookCoverNotFoundException extends RuntimeException {
    public BookCoverNotFoundException(Long id) {
        super("표지를 찾을 수 없습니다. id: " + id);
    }
}
