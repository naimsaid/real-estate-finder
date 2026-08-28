package com.realestatefinder.presentation.mapper;

import com.realestatefinder.domain.Listing;
import com.realestatefinder.domain.Property;
import com.realestatefinder.presentation.dto.ListingSearchResult;
import java.util.Objects;

/** Maps a domain listing to its concise search representation. */
public final class ListingSearchResultMapper {

    public ListingSearchResult toSearchResult(Listing listing) {
        Objects.requireNonNull(listing, "listing must not be null");
        Property property = listing.property();
        String imageUrl = listing.imageUrls().isEmpty() ? null : listing.imageUrls().getFirst();
        return new ListingSearchResult(
                listing.id(),
                listing.title(),
                listing.mode(),
                listing.price().amount(),
                listing.price().currency().getCurrencyCode(),
                property.type(),
                property.surface().squareMeters(),
                property.city().name(),
                property.district().name(),
                property.rooms(),
                listing.score().value(),
                imageUrl,
                listing.publishedAt());
    }
}
