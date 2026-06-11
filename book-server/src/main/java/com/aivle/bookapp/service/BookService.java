package com.aivle.bookapp.service;

import com.aivle.bookapp.domain.Book;
import com.aivle.bookapp.dto.BookCreateRequest;
import com.aivle.bookapp.dto.BookResponse;
import com.aivle.bookapp.dto.BookUpdateRequest;
import com.aivle.bookapp.dto.CoverGenerateRequest;
import com.aivle.bookapp.exception.BookNotFoundException;
import com.aivle.bookapp.exception.OpenAiException;
import com.aivle.bookapp.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final RestTemplate restTemplate;

    @Transactional(readOnly = true)
    public Page<BookResponse> findAll(Pageable pageable) {
        return bookRepository.findAll(pageable)
                .map(BookResponse::from);
    }

    @Transactional(readOnly = true)
    public BookResponse findById(Long id) {
        return BookResponse.from(getBookOrThrow(id));
    }

    @Transactional
    public BookResponse create(BookCreateRequest request) {
        Book book = Book.builder()
                .title(request.title())
                .author(request.author())
                .content(request.content())
                .build();
        return BookResponse.from(bookRepository.save(book));
    }

    @Transactional
    public BookResponse update(Long id, BookUpdateRequest request) {
        Book book = getBookOrThrow(id);

        if (request.title() != null) book.setTitle(request.title());
        if (request.author() != null) book.setAuthor(request.author());
        if (request.content() != null) book.setContent(request.content());

        return BookResponse.from(bookRepository.save(book));
    }

    @Transactional
    public BookResponse updateCover(Long id, String coverImageUrl) {
        Book book = getBookOrThrow(id);
        book.setCoverImageUrl(coverImageUrl);
        return BookResponse.from(bookRepository.save(book));
    }

    @Transactional
    public void delete(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new BookNotFoundException(id);
        }
        bookRepository.deleteById(id);
    }

    @Transactional
    public BookResponse generateAndSaveCover(Long id, CoverGenerateRequest request) {
        Book book = getBookOrThrow(id);
        String prompt = buildImagePrompt(book, request.userPrompt());
        String b64 = callOpenAi(request.apiKey(), prompt, request.size(), request.quality(), request.outputFormat());
        String format = request.outputFormat() != null ? request.outputFormat() : "png";
        book.setCoverImageUrl("data:image/" + format + ";base64," + b64);
        return BookResponse.from(bookRepository.save(book));
    }

    private String buildImagePrompt(Book book, String userPrompt) {
        StringBuilder sb = new StringBuilder();
        sb.append("A beautiful book cover for a book titled \"").append(book.getTitle()).append("\"");
        if (book.getAuthor() != null && !book.getAuthor().isBlank()) {
            sb.append(" by ").append(book.getAuthor());
        }
        if (book.getContent() != null && !book.getContent().isBlank()) {
            sb.append(". The book is about: ")
              .append(book.getContent(), 0, Math.min(200, book.getContent().length()));
        }
        if (userPrompt != null && !userPrompt.isBlank()) {
            sb.append(". Please reflect the user request: ").append(userPrompt.trim());
        }
        sb.append(". Professional book cover design, high quality illustration, visually appealing.");
        return sb.toString();
    }

    @SuppressWarnings("unchecked")
    private String callOpenAi(String apiKey, String prompt, String size, String quality, String outputFormat) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey.trim());

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-image-2");
        body.put("prompt", prompt);
        body.put("n", 1);
        body.put("size", size != null ? size : "1024x1536");
        body.put("quality", quality != null ? quality : "low");
        body.put("output_format", outputFormat != null ? outputFormat : "png");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://api.openai.com/v1/images/generations",
                    entity,
                    Map.class
            );
            List<Map<String, Object>> data = (List<Map<String, Object>>) response.getBody().get("data");
            String b64Json = (String) data.get(0).get("b64_json");
            if (b64Json == null || b64Json.isBlank()) {
                throw new OpenAiException("이미지 데이터를 받지 못했습니다.");
            }
            return b64Json;
        } catch (HttpClientErrorException e) {
            int status = e.getStatusCode().value();
            if (status == 401) throw new OpenAiException("API Key가 유효하지 않습니다. (401)");
            if (status == 429) throw new OpenAiException("요청 한도를 초과했습니다. 잠시 후 재시도해주세요. (429)");
            if (status == 400) throw new OpenAiException("잘못된 요청입니다. (400)");
            throw new OpenAiException("OpenAI 오류가 발생했습니다. (" + status + ")");
        } catch (ResourceAccessException e) {
            throw new OpenAiException("OpenAI 서버에 연결할 수 없습니다.");
        }
    }

    private Book getBookOrThrow(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new BookNotFoundException(id));
    }
}
