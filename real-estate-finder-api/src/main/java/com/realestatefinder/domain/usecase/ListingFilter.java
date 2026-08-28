package com.realestatefinder.domain.usecase;

import com.realestatefinder.domain.Amenity;
import com.realestatefinder.domain.ListingMode;
import com.realestatefinder.domain.PropertyType;
import java.math.BigDecimal;
import java.util.Set;

/** Optional criteria used to filter listings. */
public record ListingFilter(
        ListingMode mode,
        String city,
        PropertyType propertyType,
        BigDecimal maximumPrice,
        BigDecimal minimumSurface,
        Integer minimumRooms,
        Set<Amenity> amenities) {

    public ListingFilter {
        city = city == null ? null : city.trim();
        requireNonNegative(maximumPrice, "maximumPrice");
        requireNonNegative(minimumSurface, "minimumSurface");
        if (minimumRooms != null && minimumRooms < 0) {
            throw new IllegalArgumentException("minimumRooms must not be negative");
        }
        amenities = amenities == null ? Set.of() : Set.copyOf(amenities);
    }

    public static ListingFilter none() {
        return new ListingFilter(null, null, null, null, null, null, Set.of());
    }

    private static void requireNonNegative(BigDecimal value, String field) {
        if (value != null && value.signum() < 0) {
            throw new IllegalArgumentException(field + " must not be negative");
        }
    }
}
