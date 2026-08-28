package com.realestatefinder.presentation.mapper;

import com.realestatefinder.domain.City;
import com.realestatefinder.domain.District;
import com.realestatefinder.domain.Listing;
import com.realestatefinder.domain.Price;
import com.realestatefinder.domain.Property;
import com.realestatefinder.domain.Score;
import com.realestatefinder.domain.Surface;
import com.realestatefinder.presentation.dto.ListingRequest;
import java.time.Instant;
import java.util.Currency;
import java.util.Objects;
import java.util.UUID;

/** Maps listing creation data to the domain. */
public final class ListingRequestMapper {

    public Listing toDomain(
            ListingRequest request, UUID id, Score score, Instant publishedAt, Instant updatedAt) {
        Objects.requireNonNull(request, "request must not be null");
        Property property = new Property(
                request.propertyType(),
                new Surface(request.surface()),
                new City(request.city(), request.postalCode()),
                new District(request.district()),
                request.rooms(),
                request.bedrooms(),
                request.bathrooms(),
                request.amenities());

        return new Listing(
                id,
                request.title(),
                request.description(),
                request.mode(),
                new Price(request.price(), Currency.getInstance(request.currency())),
                property,
                score,
                request.imageUrls(),
                publishedAt,
                updatedAt);
    }
}
