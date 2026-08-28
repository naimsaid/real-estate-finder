package com.realestatefinder.infrastructure.persistence.jpa;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface SpringDataAdviceRepository extends JpaRepository<JpaAdviceEntity, UUID> {}
