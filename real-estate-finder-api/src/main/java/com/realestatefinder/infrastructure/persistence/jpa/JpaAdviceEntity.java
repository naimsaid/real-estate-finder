package com.realestatefinder.infrastructure.persistence.jpa;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "advice",
        indexes =
                @Index(
                        name = "idx_advice_category_published",
                        columnList = "category,published_on"))
public class JpaAdviceEntity {

    @Id private UUID id;

    @Column(nullable = false, length = 80)
    private String category;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 4000)
    private String description;

    @Column(nullable = false)
    private long readingTimeSeconds;

    @Column(nullable = false, length = 2048)
    private String imageUrl;

    @Column(nullable = false)
    private LocalDate publishedOn;

    protected JpaAdviceEntity() {}

    public JpaAdviceEntity(
            UUID id,
            String category,
            String title,
            String description,
            long readingTimeSeconds,
            String imageUrl,
            LocalDate publishedOn) {
        this.id = id;
        this.category = category;
        this.title = title;
        this.description = description;
        this.readingTimeSeconds = readingTimeSeconds;
        this.imageUrl = imageUrl;
        this.publishedOn = publishedOn;
    }

    public UUID getId() {
        return id;
    }

    public String getCategory() {
        return category;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public long getReadingTimeSeconds() {
        return readingTimeSeconds;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public LocalDate getPublishedOn() {
        return publishedOn;
    }
}
