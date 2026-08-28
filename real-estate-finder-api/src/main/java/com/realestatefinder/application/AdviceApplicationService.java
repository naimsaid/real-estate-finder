package com.realestatefinder.application;

import com.realestatefinder.domain.Advice;
import com.realestatefinder.domain.ports.AdviceRepository;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/** Provides editorial advice to the presentation layer. */
public final class AdviceApplicationService {

    private final AdviceRepository adviceRepository;

    public AdviceApplicationService(AdviceRepository adviceRepository) {
        this.adviceRepository = Objects.requireNonNull(adviceRepository);
    }

    public List<Advice> findAll() {
        return adviceRepository.findAll();
    }

    public Optional<Advice> findById(UUID id) {
        return adviceRepository.findById(id);
    }
}
