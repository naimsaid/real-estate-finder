package com.realestatefinder.domain;

import java.util.Objects;

/** A city in which a property is located. */
public record City(String name, String postalCode) {

    public City {
        name = requireText(name, "name");
        postalCode = requireText(postalCode, "postalCode");
    }

    private static String requireText(String value, String field) {
        Objects.requireNonNull(value, field + " must not be null");
        if (value.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        return value.trim();
    }
}
