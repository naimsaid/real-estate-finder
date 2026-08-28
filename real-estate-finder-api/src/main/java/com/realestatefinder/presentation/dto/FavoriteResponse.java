package com.realestatefinder.presentation.dto;

import java.util.UUID;

/** Favorite state of a listing. */
public record FavoriteResponse(UUID listingId, boolean favorite) {}
