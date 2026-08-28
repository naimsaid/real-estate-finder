package com.realestatefinder.domain;

import java.time.Duration;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

/** Editorial advice made available to property seekers. */
public record Advice(
        UUID id,
        String category,
        String title,
        String description,
        Duration readingTime,
        String imageUrl,
        LocalDate publishedOn) {

    public Advice {
        Objects.requireNonNull(id, "id must not be null");
        category = requireText(category, "category");
        title = requireText(title, "title");
        description = requireText(description, "description");
        Objects.requireNonNull(readingTime, "readingTime must not be null");
        if (readingTime.isZero() || readingTime.isNegative()) {
            throw new IllegalArgumentException("readingTime must be positive");
        }
        imageUrl = requireText(imageUrl, "imageUrl");
        Objects.requireNonNull(publishedOn, "publishedOn must not be null");
    }

    private static String requireText(String value, String field) {
        Objects.requireNonNull(value, field + " must not be null");
        if (value.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        return value.trim();
    }
}
