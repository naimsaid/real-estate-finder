package com.realestatefinder.domain.ports;

import com.realestatefinder.domain.Advice;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** Port for advice persistence. */
public interface AdviceRepository {

    Advice save(Advice advice);

    Optional<Advice> findById(UUID id);

    List<Advice> findAll();

    void deleteById(UUID id);
}
