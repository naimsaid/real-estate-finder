package com.realestatefinder.domain;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/** A real-estate advertisement. */
public record Listing(
        UUID id,
        String title,
        String description,
        ListingMode mode,
        Price price,
        Property property,
        Score score,
        List<String> imageUrls,
        Instant publishedAt,
        Instant updatedAt) {

    public Listing {
        Objects.requireNonNull(id, "id must not be null");
        title = requireText(title, "title");
        description = requireText(description, "description");
        Objects.requireNonNull(mode, "mode must not be null");
        Objects.requireNonNull(price, "price must not be null");
        Objects.requireNonNull(property, "property must not be null");
        Objects.requireNonNull(score, "score must not be null");
        imageUrls = List.copyOf(Objects.requireNonNull(imageUrls, "imageUrls must not be null"));
        Objects.requireNonNull(publishedAt, "publishedAt must not be null");
        Objects.requireNonNull(updatedAt, "updatedAt must not be null");
        if (updatedAt.isBefore(publishedAt)) {
            throw new IllegalArgumentException("updatedAt must not precede publishedAt");
        }
    }

    private static String requireText(String value, String field) {
        Objects.requireNonNull(value, field + " must not be null");
        if (value.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        return value.trim();
    }
}
