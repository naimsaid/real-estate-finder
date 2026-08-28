package com.realestatefinder.domain;

import java.util.Objects;

/** A district within a city. */
public record District(String name) {

    public District {
        Objects.requireNonNull(name, "name must not be null");
        if (name.isBlank()) {
            throw new IllegalArgumentException("name must not be blank");
        }
        name = name.trim();
    }
}
