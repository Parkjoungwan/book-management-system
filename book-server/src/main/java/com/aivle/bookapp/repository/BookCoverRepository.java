package com.aivle.bookapp.repository;

import com.aivle.bookapp.domain.BookCover;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface BookCoverRepository extends JpaRepository<BookCover, Long> {

    List<BookCover> findByBookIdOrderByCreatedAtDesc(Long bookId);

    Optional<BookCover> findByBookIdAndIsActiveTrue(Long bookId);

    @Modifying
    @Query("UPDATE BookCover c SET c.isActive = false WHERE c.book.id = :bookId")
    void deactivateAllByBookId(@Param("bookId") Long bookId);
}
