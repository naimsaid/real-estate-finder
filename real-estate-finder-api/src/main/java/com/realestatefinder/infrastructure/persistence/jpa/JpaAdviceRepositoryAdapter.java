package com.realestatefinder.infrastructure.persistence.jpa;

import com.realestatefinder.domain.Advice;
import com.realestatefinder.domain.ports.AdviceRepository;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class JpaAdviceRepositoryAdapter implements AdviceRepository {

    private final SpringDataAdviceRepository repository;

    public JpaAdviceRepositoryAdapter(SpringDataAdviceRepository repository) {
        this.repository = repository;
    }

    @Override
    public Advice save(Advice advice) {
        return toDomain(repository.save(toEntity(advice)));
    }

    @Override
    public Optional<Advice> findById(UUID id) {
        return repository.findById(id).map(JpaAdviceRepositoryAdapter::toDomain);
    }

    @Override
    public List<Advice> findAll() {
        return repository.findAll().stream().map(JpaAdviceRepositoryAdapter::toDomain).toList();
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    private static JpaAdviceEntity toEntity(Advice advice) {
        return new JpaAdviceEntity(
                advice.id(), advice.category(), advice.title(), advice.description(),
                advice.readingTime().toSeconds(), advice.imageUrl(), advice.publishedOn());
    }

    private static Advice toDomain(JpaAdviceEntity entity) {
        return new Advice(
                entity.getId(), entity.getCategory(), entity.getTitle(), entity.getDescription(),
                Duration.ofSeconds(entity.getReadingTimeSeconds()), entity.getImageUrl(),
                entity.getPublishedOn());
    }
}
