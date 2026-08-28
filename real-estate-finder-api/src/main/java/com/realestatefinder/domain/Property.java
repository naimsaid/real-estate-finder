package com.realestatefinder.domain;

import java.util.Objects;
import java.util.Set;

/** The physical property described by a listing. */
public record Property(
        PropertyType type,
        Surface surface,
        City city,
        District district,
        int rooms,
        int bedrooms,
        int bathrooms,
        Set<Amenity> amenities) {

    public Property {
        Objects.requireNonNull(type, "type must not be null");
        Objects.requireNonNull(surface, "surface must not be null");
        Objects.requireNonNull(city, "city must not be null");
        Objects.requireNonNull(district, "district must not be null");
        if (rooms <= 0 || bedrooms < 0 || bathrooms < 0) {
            throw new IllegalArgumentException("room counts must be consistent and non-negative");
        }
        amenities = Set.copyOf(Objects.requireNonNull(amenities, "amenities must not be null"));
    }
}
