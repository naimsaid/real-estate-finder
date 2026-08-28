package com.realestatefinder.presentation.dto;

import com.realestatefinder.domain.Amenity;
import com.realestatefinder.domain.ListingMode;
import com.realestatefinder.domain.PropertyType;
import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.Set;

/** Data required to create a listing. */
public record ListingRequest(
        String title,
        String description,
        ListingMode mode,
        BigDecimal price,
        String currency,
        PropertyType propertyType,
        BigDecimal surface,
        String city,
        String postalCode,
        String district,
        int rooms,
        int bedrooms,
        int bathrooms,
        Set<Amenity> amenities,
        List<String> imageUrls) {

    public ListingRequest {
        amenities = Set.copyOf(Objects.requireNonNull(amenities, "amenities must not be null"));
        imageUrls = List.copyOf(Objects.requireNonNull(imageUrls, "imageUrls must not be null"));
    }
}
