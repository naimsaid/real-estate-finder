package com.realestatefinder.infrastructure.persistence.jpa;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

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
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.TestPropertySource;

@DataJpaTest
@Import(JpaListingRepositoryAdapter.class)
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class JpaListingRepositoryAdapterTest {

    @Autowired private JpaListingRepositoryAdapter adapter;

    @Autowired private SpringDataListingRepository springDataRepository;

    @Test
    void givenCompleteListingWhenSavingAndFindingThenAllDomainFieldsAreRestored() {
        // Given
        Listing listing = listing(UUID.randomUUID(), "Appartement avec terrasse");

        // When
        Listing saved = adapter.save(listing);
        Listing found = adapter.findById(listing.id()).orElseThrow();

        // Then
        assertThat(saved).isEqualTo(listing);
        assertThat(found).isEqualTo(listing);
        assertThat(found.property().amenities()).containsExactlyInAnyOrder(Amenity.ELEVATOR, Amenity.TERRACE);
        assertThat(found.imageUrls()).containsExactly("https://images.test/one.jpg", "https://images.test/two.jpg");
    }

    @Test
    void givenSeveralListingsWhenFindingAllThenEveryListingIsMapped() {
        // Given
        Listing first = listing(UUID.randomUUID(), "Premier bien");
        Listing second = listing(UUID.randomUUID(), "Second bien");
        adapter.save(first);
        adapter.save(second);

        // When
        List<Listing> listings = adapter.findAll();

        // Then
        assertThat(listings).containsExactlyInAnyOrder(first, second);
    }

    @Test
    void givenListingWithoutOptionalCollectionsWhenSavingThenEmptyCollectionsAreRestored() {
        // Given
        Listing listing = listing(UUID.randomUUID(), "Bien sans média", Set.of(), List.of());

        // When
        adapter.save(listing);
        Listing found = adapter.findById(listing.id()).orElseThrow();

        // Then
        assertThat(found.property().amenities()).isEmpty();
        assertThat(found.imageUrls()).isEmpty();
    }

    @Test
    void givenExistingListingWhenSavingSameIdentifierThenListingIsUpdatedWithoutDuplicate() {
        // Given
        UUID id = UUID.randomUUID();
        adapter.save(listing(id, "Titre initial"));
        Listing updated = listing(id, "Titre actualisé");

        // When
        adapter.save(updated);
        List<Listing> listings = adapter.findAll();

        // Then
        assertThat(listings).containsExactly(updated);
    }

    @Test
    void givenExistingListingWhenDeletingThenItCanNoLongerBeFound() {
        // Given
        Listing listing = listing(UUID.randomUUID(), "Bien à supprimer");
        adapter.save(listing);

        // When
        adapter.deleteById(listing.id());

        // Then
        assertThat(adapter.findById(listing.id())).isEmpty();
    }

    @Test
    void givenUnknownIdentifierWhenFindingThenEmptyOptionalIsReturned() {
        // Given
        UUID unknownId = UUID.randomUUID();

        // When
        var result = adapter.findById(unknownId);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void givenTitleExceedingDatabaseLimitWhenFlushingThenPersistenceErrorIsRaised() {
        // Given
        Listing listing = listing(UUID.randomUUID(), "x".repeat(201));
        adapter.save(listing);

        // When / Then
        assertThatThrownBy(springDataRepository::flush)
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void givenPersistedListingWithInvalidScoreWhenFindingThenDomainErrorIsRaised() {
        // Given
        Listing validListing = listing(UUID.randomUUID(), "Bien au score invalide");
        Property property = validListing.property();
        springDataRepository.saveAndFlush(new JpaListingEntity(
                validListing.id(),
                validListing.title(),
                validListing.description(),
                validListing.mode(),
                validListing.price().amount(),
                validListing.price().currency().getCurrencyCode(),
                property.type(),
                property.surface().squareMeters(),
                property.city().name(),
                property.city().postalCode(),
                property.district().name(),
                property.rooms(),
                property.bedrooms(),
                property.bathrooms(),
                101,
                property.amenities(),
                validListing.imageUrls(),
                validListing.publishedAt(),
                validListing.updatedAt()));

        // When / Then
        assertThatThrownBy(() -> adapter.findById(validListing.id()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("value must be between 0 and 100");
    }

    private static Listing listing(UUID id, String title) {
        return listing(
                id,
                title,
                Set.of(Amenity.ELEVATOR, Amenity.TERRACE),
                List.of("https://images.test/one.jpg", "https://images.test/two.jpg"));
    }

    private static Listing listing(UUID id, String title, Set<Amenity> amenities, List<String> imageUrls) {
        Instant publishedAt = Instant.parse("2026-02-01T10:15:30Z");
        Property property = new Property(
                PropertyType.APARTMENT,
                new Surface(new BigDecimal("72.50")),
                new City("Lyon", "69002"),
                new District("Presqu'île"),
                4,
                2,
                1,
                amenities);
        return new Listing(
                id,
                title,
                "Description détaillée du bien",
                ListingMode.SALE,
                Price.euros(new BigDecimal("425000.00")),
                property,
                new Score(87),
                imageUrls,
                publishedAt,
                publishedAt.plusSeconds(3600));
    }
}
