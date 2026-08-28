package com.realestatefinder.domain.usecase;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;
import org.junit.jupiter.api.Test;

class ToggleFavoriteUseCaseTest {

    private final ToggleFavoriteUseCase useCase = new ToggleFavoriteUseCase();

    @Test
    void givenUnknownListingWhenTogglingThenAddsItToFavorites() {
        // Given
        UUID listingId = UUID.randomUUID();

        // When
        boolean favorite = useCase.execute(listingId);

        // Then
        assertThat(favorite).isTrue();
        assertThat(useCase.isFavorite(listingId)).isTrue();
        assertThat(useCase.favorites()).containsExactly(listingId);
    }

    @Test
    void givenFavoriteListingWhenTogglingThenRemovesItFromFavorites() {
        // Given
        UUID listingId = UUID.randomUUID();
        useCase.execute(listingId);

        // When
        boolean favorite = useCase.execute(listingId);

        // Then
        assertThat(favorite).isFalse();
        assertThat(useCase.isFavorite(listingId)).isFalse();
        assertThat(useCase.favorites()).isEmpty();
    }
}
