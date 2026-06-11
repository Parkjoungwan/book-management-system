package com.aivle.bookapp.service;

import com.aivle.bookapp.domain.Book;
import com.aivle.bookapp.domain.BookCover;
import com.aivle.bookapp.dto.BookCoverRequest;
import com.aivle.bookapp.dto.BookCoverResponse;
import com.aivle.bookapp.exception.BookCoverNotFoundException;
import com.aivle.bookapp.exception.BookNotFoundException;
import com.aivle.bookapp.repository.BookCoverRepository;
import com.aivle.bookapp.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookCoverService {

    private final BookCoverRepository bookCoverRepository;
    private final BookRepository bookRepository;

    // GET /books/{bookId}/covers
    @Transactional(readOnly = true)
    public List<BookCoverResponse> findAllByBookId(Long bookId) {
        if (!bookRepository.existsById(bookId)) throw new BookNotFoundException(bookId);
        return bookCoverRepository.findByBookIdOrderByCreatedAtDesc(bookId)
                .stream().map(BookCoverResponse::from).toList();
    }

    // POST /books/{bookId}/covers — 이력 저장 (대표 지정 아님)
    @Transactional
    public BookCoverResponse saveCover(Long bookId, BookCoverRequest request) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException(bookId));
        BookCover cover = BookCover.builder()
                .book(book)
                .imageUrl(request.imageUrl())
                .quality(request.quality())
                .size(request.size())
                .outputFormat(request.outputFormat())
                .isActive(false)
                .build();
        return BookCoverResponse.from(bookCoverRepository.save(cover));
    }

    // PATCH /books/{bookId}/covers/{coverId}/activate — 대표 표지 지정
    // 1) 기존 대표 전부 비활성화  2) 선택 표지 활성화
    // 3) Book.coverImageUrl 동기화 — 기존 프론트 PATCH /books/:id 호환 유지
    @Transactional
    public BookCoverResponse setActiveCover(Long bookId, Long coverId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException(bookId));
        BookCover cover = bookCoverRepository.findById(coverId)
                .orElseThrow(() -> new BookCoverNotFoundException(coverId));
        if (!cover.getBook().getId().equals(bookId)) {
            throw new IllegalArgumentException(
                    "표지 id " + coverId + "는 도서 id " + bookId + "에 속하지 않습니다.");
        }
        bookCoverRepository.deactivateAllByBookId(bookId);
        cover.setIsActive(true);
        bookCoverRepository.save(cover);
        book.setCoverImageUrl(cover.getImageUrl());
        bookRepository.save(book);
        return BookCoverResponse.from(cover);
    }

    // DELETE /books/{bookId}/covers/{coverId}
    @Transactional
    public void deleteCover(Long bookId, Long coverId) {
        if (!bookRepository.existsById(bookId)) throw new BookNotFoundException(bookId);
        BookCover cover = bookCoverRepository.findById(coverId)
                .orElseThrow(() -> new BookCoverNotFoundException(coverId));
        if (Boolean.TRUE.equals(cover.getIsActive())) {
            Book book = bookRepository.findById(bookId)
                    .orElseThrow(() -> new BookNotFoundException(bookId));
            book.setCoverImageUrl(null);
            bookRepository.save(book);
        }
        bookCoverRepository.delete(cover);
    }
}
