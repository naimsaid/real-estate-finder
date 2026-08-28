package com.realestatefinder.infrastructure.persistence.jpa;

import com.realestatefinder.domain.City;
import com.realestatefinder.domain.District;
import com.realestatefinder.domain.Listing;
import com.realestatefinder.domain.Price;
import com.realestatefinder.domain.Property;
import com.realestatefinder.domain.Score;
import com.realestatefinder.domain.Surface;
import com.realestatefinder.domain.ports.ListingRepository;
import java.util.Currency;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class JpaListingRepositoryAdapter implements ListingRepository {

    private final SpringDataListingRepository repository;

    public JpaListingRepositoryAdapter(SpringDataListingRepository repository) {
        this.repository = repository;
    }

    @Override
    public Listing save(Listing listing) {
        return toDomain(repository.save(toEntity(listing)));
    }

    @Override
    public Optional<Listing> findById(UUID id) {
        return repository.findById(id).map(JpaListingRepositoryAdapter::toDomain);
    }

    @Override
    public List<Listing> findAll() {
        return repository.findAll().stream().map(JpaListingRepositoryAdapter::toDomain).toList();
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    private static JpaListingEntity toEntity(Listing listing) {
        Property property = listing.property();
        return new JpaListingEntity(
                listing.id(), listing.title(), listing.description(), listing.mode(),
                listing.price().amount(), listing.price().currency().getCurrencyCode(),
                property.type(), property.surface().squareMeters(), property.city().name(),
                property.city().postalCode(), property.district().name(), property.rooms(),
                property.bedrooms(), property.bathrooms(), listing.score().value(),
                property.amenities(),
                listing.imageUrls(),
                listing.publishedAt(),
                listing.updatedAt());
    }

    private static Listing toDomain(JpaListingEntity entity) {
        Property property = new Property(
                entity.getPropertyType(), new Surface(entity.getSurfaceSquareMeters()),
                new City(entity.getCity(), entity.getPostalCode()),
                new District(entity.getDistrict()),
                entity.getRooms(),
                entity.getBedrooms(),
                entity.getBathrooms(),
                entity.getAmenities());
        return new Listing(
                entity.getId(), entity.getTitle(), entity.getDescription(), entity.getMode(),
                new Price(entity.getPriceAmount(), Currency.getInstance(entity.getPriceCurrency())),
                property,
                new Score(entity.getScore()),
                entity.getImageUrls(),
                entity.getPublishedAt(),
                entity.getUpdatedAt());
    }
}
