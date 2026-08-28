package com.realestatefinder.domain.usecase;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

/** Keeps and toggles favorite listing identifiers in memory. */
public final class ToggleFavoriteUseCase {

    private final Set<UUID> favoriteIds = new LinkedHashSet<>();

    public boolean execute(UUID listingId) {
        Objects.requireNonNull(listingId, "listingId must not be null");
        if (favoriteIds.remove(listingId)) {
            return false;
        }
        favoriteIds.add(listingId);
        return true;
    }

    public boolean isFavorite(UUID listingId) {
        Objects.requireNonNull(listingId, "listingId must not be null");
        return favoriteIds.contains(listingId);
    }

    public Set<UUID> favorites() {
        return Collections.unmodifiableSet(new LinkedHashSet<>(favoriteIds));
    }
}
