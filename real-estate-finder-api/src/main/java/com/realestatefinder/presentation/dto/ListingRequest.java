package com.realestatefinder.presentation.dto;

import com.realestatefinder.domain.Amenity;
import com.realestatefinder.domain.ListingMode;
import com.realestatefinder.domain.PropertyType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

/** Data required to create a listing. */
public record ListingRequest(
        @NotBlank String title,
        @NotBlank String description,
        @NotNull ListingMode mode,
        @NotNull @PositiveOrZero BigDecimal price,
        @NotBlank @Pattern(regexp = "[A-Z]{3}") String currency,
        @NotNull PropertyType propertyType,
        @NotNull @Positive BigDecimal surface,
        @NotBlank String city,
        @NotBlank String postalCode,
        @NotBlank String district,
        @Min(1) int rooms,
        @Min(0) int bedrooms,
        @Min(0) int bathrooms,
        @NotNull Set<Amenity> amenities,
        @NotNull List<@NotBlank String> imageUrls) {

    public ListingRequest {
        amenities = amenities == null ? null : Set.copyOf(amenities);
        imageUrls = imageUrls == null ? null : List.copyOf(imageUrls);
    }
}
