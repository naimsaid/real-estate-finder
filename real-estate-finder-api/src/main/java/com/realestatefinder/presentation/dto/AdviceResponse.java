package com.realestatefinder.presentation.dto;

import java.time.LocalDate;
import java.util.UUID;

/** Public representation of editorial advice. */
public record AdviceResponse(
        UUID id,
        String category,
        String title,
        String description,
        long readingTimeMinutes,
        String imageUrl,
        LocalDate publishedOn) {}
