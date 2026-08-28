package com.realestatefinder.presentation.dto;

import com.realestatefinder.domain.ListingMode;
import com.realestatefinder.domain.PropertyType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Concise listing representation returned by searches. */
public record ListingSearchResult(
        UUID id,
        String title,
        ListingMode mode,
        BigDecimal price,
        String currency,
        PropertyType propertyType,
        BigDecimal surface,
        String city,
        String district,
        int rooms,
        int score,
        String imageUrl,
        Instant publishedAt) {}
