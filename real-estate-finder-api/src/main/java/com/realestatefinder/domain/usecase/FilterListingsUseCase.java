package com.realestatefinder.domain.usecase;

import com.realestatefinder.domain.Listing;
import java.util.List;
import java.util.Objects;

/** Applies domain criteria to a collection of listings. */
public final class FilterListingsUseCase {

    public List<Listing> execute(List<Listing> listings, ListingFilter filter) {
        Objects.requireNonNull(listings, "listings must not be null");
        Objects.requireNonNull(filter, "filter must not be null");
        return listings.stream().filter(listing -> matches(listing, filter)).toList();
    }

    private boolean matches(Listing listing, ListingFilter filter) {
        Objects.requireNonNull(listing, "listing must not be null");
        return (filter.mode() == null || listing.mode() == filter.mode())
                && (filter.city() == null
                        || filter.city().isBlank()
                        || listing.property().city().name().equalsIgnoreCase(filter.city())
                        || listing.property().district().name().equalsIgnoreCase(filter.city())
                        || listing.property().city().postalCode().equalsIgnoreCase(filter.city()))
                && (filter.propertyType() == null || listing.property().type() == filter.propertyType())
                && (filter.maximumPrice() == null
                        || listing.price().amount().compareTo(filter.maximumPrice()) <= 0)
                && (filter.minimumSurface() == null
                        || listing.property().surface().squareMeters().compareTo(filter.minimumSurface()) >= 0)
                && (filter.minimumRooms() == null || listing.property().rooms() >= filter.minimumRooms())
                && listing.property().amenities().containsAll(filter.amenities());
    }
}
