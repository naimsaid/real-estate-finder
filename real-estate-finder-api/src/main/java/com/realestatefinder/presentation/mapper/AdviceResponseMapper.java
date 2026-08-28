package com.realestatefinder.presentation.mapper;

import com.realestatefinder.domain.Advice;
import com.realestatefinder.presentation.dto.AdviceResponse;
import java.util.Objects;

/** Maps editorial advice to its public representation. */
public final class AdviceResponseMapper {

    public AdviceResponse toResponse(Advice advice) {
        Objects.requireNonNull(advice, "advice must not be null");
        return new AdviceResponse(
                advice.id(),
                advice.category(),
                advice.title(),
                advice.description(),
                advice.readingTime().toMinutes(),
                advice.imageUrl(),
                advice.publishedOn());
    }
}
