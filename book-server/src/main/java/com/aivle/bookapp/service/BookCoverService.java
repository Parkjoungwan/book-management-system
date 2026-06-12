package com.aivle.bookapp.service;

import com.aivle.bookapp.domain.Book;
import com.aivle.bookapp.domain.BookCover;
import com.aivle.bookapp.dto.BookCoverRequest;
import com.aivle.bookapp.dto.BookCoverResponse;
import com.aivle.bookapp.exception.BookCoverNotFoundException;
import com.aivle.bookapp.repository.BookCoverRepository;
import com.aivle.bookapp.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookCoverService {

    private final BookCoverRepository bookCoverRepository;
    private final BookRepository bookRepository;

    @Transactional(readOnly = true)
    public List<BookCoverResponse> findAllByBookId(Long bookId, Long userId) {
        getOwnedBookOrThrow(bookId, userId);
        return bookCoverRepository.findByBookIdOrderByCreatedAtDesc(bookId)
                .stream()
                .map(BookCoverResponse::from)
                .toList();
    }

    @Transactional
    public BookCoverResponse saveCover(Long bookId, BookCoverRequest request, Long userId) {
        Book book = getOwnedBookOrThrow(bookId, userId);
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

    @Transactional
    public BookCoverResponse setActiveCover(Long bookId, Long coverId, Long userId) {
        Book book = getOwnedBookOrThrow(bookId, userId);
        BookCover cover = getCoverForBookOrThrow(bookId, coverId);

        bookCoverRepository.deactivateAllByBookId(bookId);
        cover.setIsActive(true);
        bookCoverRepository.save(cover);

        book.setCoverImageUrl(cover.getImageUrl());
        bookRepository.save(book);

        return BookCoverResponse.from(cover);
    }

    @Transactional
    public void deleteCover(Long bookId, Long coverId, Long userId) {
        Book book = getOwnedBookOrThrow(bookId, userId);
        BookCover cover = getCoverForBookOrThrow(bookId, coverId);

        if (Boolean.TRUE.equals(cover.getIsActive())) {
            book.setCoverImageUrl(null);
            bookRepository.save(book);
        }

        bookCoverRepository.delete(cover);
    }

    private Book getOwnedBookOrThrow(Long bookId, Long userId) {
        return bookRepository.findByIdAndUserId(bookId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "본인이 등록한 도서만 접근할 수 있습니다."
                ));
    }

    private BookCover getCoverForBookOrThrow(Long bookId, Long coverId) {
        BookCover cover = bookCoverRepository.findById(coverId)
                .orElseThrow(() -> new BookCoverNotFoundException(coverId));

        if (!cover.getBook().getId().equals(bookId)) {
            throw new IllegalArgumentException(
                    "표지 id " + coverId + "는 도서 id " + bookId + "에 속하지 않습니다."
            );
        }

        return cover;
    }
}
