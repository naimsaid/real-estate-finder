package com.realestatefinder.infrastructure.persistence.jpa;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

interface SpringDataListingRepository extends JpaRepository<JpaListingEntity, UUID> {

    @Override
    @EntityGraph(attributePaths = {"amenities", "imageUrls"})
    Optional<JpaListingEntity> findById(UUID id);

    @Override
    @EntityGraph(attributePaths = {"amenities", "imageUrls"})
    List<JpaListingEntity> findAll();
}
