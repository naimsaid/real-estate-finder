package com.realestatefinder.infrastructure.config;

import com.realestatefinder.application.AdviceApplicationService;
import com.realestatefinder.application.ListingApplicationService;
import com.realestatefinder.application.ListingCatalogService;
import com.realestatefinder.domain.ports.AdviceRepository;
import com.realestatefinder.domain.ports.ListingRepository;
import com.realestatefinder.domain.usecase.FilterListingsUseCase;
import com.realestatefinder.domain.usecase.SearchListingsUseCase;
import com.realestatefinder.domain.usecase.SortListingsUseCase;
import com.realestatefinder.domain.usecase.ToggleFavoriteUseCase;
import com.realestatefinder.presentation.mapper.AdviceResponseMapper;
import com.realestatefinder.presentation.mapper.ListingResponseMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Wires application services and presentation mappers. */
@Configuration
public class ApplicationConfiguration {

    @Bean
    ListingCatalogService listingCatalogService(ListingRepository listingRepository) {
        return new ListingCatalogService(listingRepository);
    }

    @Bean
    AdviceApplicationService adviceApplicationService(AdviceRepository adviceRepository) {
        return new AdviceApplicationService(adviceRepository);
    }

    @Bean
    ListingApplicationService listingApplicationService() {
        return new ListingApplicationService(
                new SearchListingsUseCase(),
                new FilterListingsUseCase(),
                new SortListingsUseCase(),
                new ToggleFavoriteUseCase());
    }

    @Bean
    ListingResponseMapper listingResponseMapper() {
        return new ListingResponseMapper();
    }

    @Bean
    AdviceResponseMapper adviceResponseMapper() {
        return new AdviceResponseMapper();
    }
}
