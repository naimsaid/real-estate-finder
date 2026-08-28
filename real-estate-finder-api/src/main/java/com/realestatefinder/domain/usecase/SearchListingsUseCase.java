package com.realestatefinder.domain.usecase;

import com.realestatefinder.domain.Listing;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

/** Searches listings by their textual description and location. */
public final class SearchListingsUseCase {

    public List<Listing> execute(List<Listing> listings, String query) {
        Objects.requireNonNull(listings, "listings must not be null");
        Objects.requireNonNull(query, "query must not be null");
        String normalizedQuery = normalize(query);
        if (normalizedQuery.isEmpty()) {
            return List.copyOf(listings);
        }
        return listings.stream().filter(listing -> matches(listing, normalizedQuery)).toList();
    }

    private boolean matches(Listing listing, String query) {
        Objects.requireNonNull(listing, "listing must not be null");
        String searchableText = String.join(
                " ",
                listing.title(),
                listing.description(),
                listing.property().city().name(),
                listing.property().city().postalCode(),
                listing.property().district().name());
        return normalize(searchableText).contains(query);
    }

    private String normalize(String value) {
        return value.trim().toLowerCase(Locale.ROOT);
    }
}
