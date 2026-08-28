package com.realestatefinder.domain;

import java.math.BigDecimal;
import java.util.Objects;

/** A surface area expressed in square metres. */
public record Surface(BigDecimal squareMeters) {

    public Surface {
        Objects.requireNonNull(squareMeters, "squareMeters must not be null");
        if (squareMeters.signum() <= 0) {
            throw new IllegalArgumentException("squareMeters must be positive");
        }
    }
}
