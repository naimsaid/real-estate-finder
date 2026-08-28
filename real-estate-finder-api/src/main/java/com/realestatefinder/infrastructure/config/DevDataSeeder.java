package com.realestatefinder.infrastructure.config;

import com.realestatefinder.domain.Advice;
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
import com.realestatefinder.domain.ports.AdviceRepository;
import com.realestatefinder.domain.ports.ListingRepository;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("dev")
public class DevDataSeeder {

    @Bean
    CommandLineRunner seedDevData(
            ListingRepository listingRepository, AdviceRepository adviceRepository) {
        return args -> {
            if (listingRepository.findAll().isEmpty()) {
                listings().forEach(listingRepository::save);
            }
            if (adviceRepository.findAll().isEmpty()) {
                advice().forEach(adviceRepository::save);
            }
        };
    }

    private static List<Listing> listings() {
        return List.of(
                listing(
                        "10000000-0000-0000-0000-000000000001",
                        "Appartement lumineux avec balcon",
                        "Appartement traversant rénové, à proximité du métro et des commerces.",
                        ListingMode.SALE,
                        "485000",
                        PropertyType.APARTMENT,
                        "68",
                        "Paris",
                        "75011",
                        "Roquette",
                        3,
                        2,
                        1,
                        92,
                        Set.of(Amenity.BALCONY, Amenity.ELEVATOR, Amenity.CELLAR),
                        "2026-08-18T09:30:00Z"),
                listing(
                        "10000000-0000-0000-0000-000000000002",
                        "Maison familiale avec jardin",
                        "Maison calme avec jardin arboré, garage et quatre chambres.",
                        ListingMode.SALE,
                        "635000",
                        PropertyType.HOUSE,
                        "142",
                        "Nantes",
                        "44000",
                        "Procé",
                        6,
                        4,
                        2,
                        88,
                        Set.of(Amenity.GARDEN, Amenity.GARAGE, Amenity.TERRACE),
                        "2026-08-15T14:00:00Z"),
                listing(
                        "10000000-0000-0000-0000-000000000003",
                        "Studio meublé proche universités",
                        "Studio fonctionnel entièrement meublé, disponible immédiatement.",
                        ListingMode.RENT,
                        "720",
                        PropertyType.STUDIO,
                        "24",
                        "Lyon",
                        "69007",
                        "Jean Macé",
                        1,
                        0,
                        1,
                        81,
                        Set.of(Amenity.ELEVATOR),
                        "2026-08-23T08:15:00Z"),
                listing(
                        "10000000-0000-0000-0000-000000000004",
                        "Loft avec terrasse sur les quais",
                        "Ancien atelier réhabilité avec grande pièce de vie et terrasse privative.",
                        ListingMode.RENT,
                        "1850",
                        PropertyType.LOFT,
                        "96",
                        "Bordeaux",
                        "33000",
                        "Chartrons",
                        3,
                        2,
                        2,
                        95,
                        Set.of(Amenity.TERRACE, Amenity.PARKING, Amenity.AIR_CONDITIONING),
                        "2026-08-25T16:45:00Z"),
                listing(
                        "10000000-0000-0000-0000-000000000005",
                        "Villa contemporaine avec piscine",
                        "Villa récente aux prestations soignées, située dans un quartier résidentiel.",
                        ListingMode.SALE,
                        "895000",
                        PropertyType.VILLA,
                        "178",
                        "Aix-en-Provence",
                        "13100",
                        "Les Granettes",
                        7,
                        5,
                        3,
                        97,
                        Set.of(
                                Amenity.GARDEN,
                                Amenity.GARAGE,
                                Amenity.SWIMMING_POOL,
                                Amenity.AIR_CONDITIONING),
                        "2026-08-20T11:20:00Z"));
    }

    private static Listing listing(
            String id,
            String title,
            String description,
            ListingMode mode,
            String price,
            PropertyType type,
            String surface,
            String city,
            String postalCode,
            String district,
            int rooms,
            int bedrooms,
            int bathrooms,
            int score,
            Set<Amenity> amenities,
            String publishedAt) {
        Instant publicationDate = Instant.parse(publishedAt);
        Property property = new Property(
                type,
                new Surface(new BigDecimal(surface)),
                new City(city, postalCode),
                new District(district),
                rooms,
                bedrooms,
                bathrooms,
                amenities);
        return new Listing(
                UUID.fromString(id),
                title,
                description,
                mode,
                Price.euros(new BigDecimal(price)),
                property,
                new Score(score),
                List.of("/assets/fallback-property.jpg"),
                publicationDate,
                publicationDate);
    }

    private static List<Advice> advice() {
        return List.of(
                new Advice(
                        UUID.fromString("20000000-0000-0000-0000-000000000001"),
                        "ACHAT",
                        "Préparer son dossier de financement",
                        "Les étapes essentielles pour définir son budget avant les visites.",
                        Duration.ofMinutes(4),
                        "/assets/fallback-property.jpg",
                        LocalDate.of(2026, 8, 12)),
                new Advice(
                        UUID.fromString("20000000-0000-0000-0000-000000000002"),
                        "LOCATION",
                        "Constituer un dossier locatif complet",
                        "Les justificatifs à réunir pour présenter rapidement sa candidature.",
                        Duration.ofMinutes(3),
                        "/assets/fallback-property.jpg",
                        LocalDate.of(2026, 8, 8)),
                new Advice(
                        UUID.fromString("20000000-0000-0000-0000-000000000003"),
                        "VISITE",
                        "Les points à vérifier pendant une visite",
                        "Une liste pratique pour évaluer le logement et son environnement.",
                        Duration.ofMinutes(5),
                        "/assets/fallback-property.jpg",
                        LocalDate.of(2026, 8, 2)));
    }
}
