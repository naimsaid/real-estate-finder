package com.realestatefinder.presentation.mapper;

import com.realestatefinder.domain.Listing;
import com.realestatefinder.domain.Property;
import com.realestatefinder.presentation.dto.ListingResponse;
import java.util.Objects;

/** Maps a domain listing to its complete public representation. */
public final class ListingResponseMapper {

    public ListingResponse toResponse(Listing listing) {
        Objects.requireNonNull(listing, "listing must not be null");
        Property property = listing.property();
        return new ListingResponse(
                listing.id(),
                listing.title(),
                listing.description(),
                listing.mode(),
                listing.price().amount(),
                listing.price().currency().getCurrencyCode(),
                property.type(),
                property.surface().squareMeters(),
                property.city().name(),
                property.city().postalCode(),
                property.district().name(),
                property.rooms(),
                property.bedrooms(),
                property.bathrooms(),
                property.amenities(),
                listing.score().value(),
                listing.imageUrls(),
                listing.publishedAt(),
                listing.updatedAt());
    }
}
