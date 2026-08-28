package com.realestatefinder.domain.usecase;

import com.realestatefinder.domain.Amenity;
import com.realestatefinder.domain.City;
import com.realestatefinder.domain.District;
import com.realestatefinder.domain.Listing;
import com.realestatefinder.domain.ListingMode;
import com.realestatefinder.domain.Price;
import com.realestatefinder.domain.Property;
import com.realestatefinder.domain.PropertyType;
import com.realestatefinder.domain.Score;
import com.realestatefinder.domain.Surface;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

final class ListingFixture {

    private ListingFixture() {}

    static Listing listing(
            String title,
            ListingMode mode,
            PropertyType type,
            String city,
            String district,
            int price,
            int surface,
            int rooms,
            int score,
            Instant publishedAt,
            Amenity... amenities) {
        Property property = new Property(
                type,
                new Surface(BigDecimal.valueOf(surface)),
                new City(city, "75001"),
                new District(district),
                rooms,
                Math.max(0, rooms - 1),
                1,
                Set.of(amenities));
        return new Listing(
                UUID.randomUUID(),
                title,
                "Description de " + title,
                mode,
                Price.euros(BigDecimal.valueOf(price)),
                property,
                new Score(score),
                List.of(),
                publishedAt,
                publishedAt);
    }
}
