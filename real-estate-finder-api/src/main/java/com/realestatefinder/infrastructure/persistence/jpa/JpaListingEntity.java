package com.realestatefinder.infrastructure.persistence.jpa;

import com.realestatefinder.domain.Amenity;
import com.realestatefinder.domain.ListingMode;
import com.realestatefinder.domain.PropertyType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(
        name = "listings",
        indexes = {
            @Index(name = "idx_listing_mode_published", columnList = "mode,published_at"),
            @Index(name = "idx_listing_city_published", columnList = "city,published_at")
        })
public class JpaListingEntity {

    @Id private UUID id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 4000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ListingMode mode;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal priceAmount;

    @Column(nullable = false, length = 3)
    private String priceCurrency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private PropertyType propertyType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal surfaceSquareMeters;

    @Column(nullable = false, length = 120)
    private String city;

    @Column(nullable = false, length = 20)
    private String postalCode;

    @Column(nullable = false, length = 120)
    private String district;

    @Column(nullable = false)
    private int rooms;

    @Column(nullable = false)
    private int bedrooms;

    @Column(nullable = false)
    private int bathrooms;

    @Column(nullable = false)
    private int score;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "listing_amenities",
            joinColumns = @jakarta.persistence.JoinColumn(name = "listing_id"))
    @Column(name = "amenity", nullable = false, length = 32)
    @Enumerated(EnumType.STRING)
    private Set<Amenity> amenities = new HashSet<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "listing_image_urls",
            joinColumns = @jakarta.persistence.JoinColumn(name = "listing_id"))
    @OrderColumn(name = "display_order")
    @Column(name = "image_url", nullable = false, length = 2048)
    private List<String> imageUrls = new ArrayList<>();

    @Column(nullable = false)
    private Instant publishedAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected JpaListingEntity() {}

    public JpaListingEntity(
            UUID id,
            String title,
            String description,
            ListingMode mode,
            BigDecimal priceAmount,
            String priceCurrency,
            PropertyType propertyType,
            BigDecimal surfaceSquareMeters,
            String city,
            String postalCode,
            String district,
            int rooms,
            int bedrooms,
            int bathrooms,
            int score,
            Set<Amenity> amenities,
            List<String> imageUrls,
            Instant publishedAt,
            Instant updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.mode = mode;
        this.priceAmount = priceAmount;
        this.priceCurrency = priceCurrency;
        this.propertyType = propertyType;
        this.surfaceSquareMeters = surfaceSquareMeters;
        this.city = city;
        this.postalCode = postalCode;
        this.district = district;
        this.rooms = rooms;
        this.bedrooms = bedrooms;
        this.bathrooms = bathrooms;
        this.score = score;
        this.amenities = new HashSet<>(amenities);
        this.imageUrls = new ArrayList<>(imageUrls);
        this.publishedAt = publishedAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public ListingMode getMode() {
        return mode;
    }

    public BigDecimal getPriceAmount() {
        return priceAmount;
    }

    public String getPriceCurrency() {
        return priceCurrency;
    }

    public PropertyType getPropertyType() {
        return propertyType;
    }

    public BigDecimal getSurfaceSquareMeters() {
        return surfaceSquareMeters;
    }

    public String getCity() {
        return city;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public String getDistrict() {
        return district;
    }

    public int getRooms() {
        return rooms;
    }

    public int getBedrooms() {
        return bedrooms;
    }

    public int getBathrooms() {
        return bathrooms;
    }

    public int getScore() {
        return score;
    }

    public Set<Amenity> getAmenities() {
        return Set.copyOf(amenities);
    }

    public List<String> getImageUrls() {
        return List.copyOf(imageUrls);
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
