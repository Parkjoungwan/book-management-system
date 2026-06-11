package com.aivle.bookapp.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookCover {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String imageUrl;

    private String quality;
    private String size;
    private String outputFormat;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
