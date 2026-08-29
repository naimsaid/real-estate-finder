package com.realestatefinder.presentation.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.realestatefinder.application.AdviceApplicationService;
import com.realestatefinder.domain.Advice;
import com.realestatefinder.presentation.GlobalExceptionHandler;
import com.realestatefinder.presentation.dto.AdviceResponse;
import com.realestatefinder.presentation.mapper.AdviceResponseMapper;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AdviceController.class)
@Import(GlobalExceptionHandler.class)
class AdviceControllerIntegrationTest {

    private static final UUID ADVICE_ID =
            UUID.fromString("20000000-0000-0000-0000-000000000002");

    @Autowired private MockMvc mockMvc;

    @MockBean private AdviceApplicationService adviceApplicationService;

    @MockBean private AdviceResponseMapper adviceResponseMapper;

    @Test
    void returnsAllAdvice() throws Exception {
        Advice advice = org.mockito.Mockito.mock(Advice.class);
        when(adviceApplicationService.findAll()).thenReturn(List.of(advice));
        when(adviceResponseMapper.toResponse(advice)).thenReturn(adviceResponse());

        mockMvc.perform(get("/api/advice"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(ADVICE_ID.toString()))
                .andExpect(jsonPath("$[0].category").value("Financement"))
                .andExpect(jsonPath("$[0].readingTimeMinutes").value(5));
    }

    @Test
    void returnsAdviceById() throws Exception {
        Advice advice = org.mockito.Mockito.mock(Advice.class);
        when(adviceApplicationService.findById(ADVICE_ID)).thenReturn(Optional.of(advice));
        when(adviceResponseMapper.toResponse(advice)).thenReturn(adviceResponse());

        mockMvc.perform(get("/api/advice/{id}", ADVICE_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(ADVICE_ID.toString()))
                .andExpect(jsonPath("$.title").value("Préparer son financement"));
    }

    @Test
    void returnsNotFoundWhenAdviceDoesNotExist() throws Exception {
        when(adviceApplicationService.findById(ADVICE_ID)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/advice/{id}", ADVICE_ID))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("The requested resource was not found."));
    }

    @Test
    void returnsBadRequestWhenAdviceIdIsMalformed() throws Exception {
        mockMvc.perform(get("/api/advice/not-a-uuid"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("The request is invalid."));
    }

    private static AdviceResponse adviceResponse() {
        return new AdviceResponse(
                ADVICE_ID,
                "Financement",
                "Préparer son financement",
                "Les étapes essentielles",
                5,
                "https://example.test/advice.jpg",
                LocalDate.of(2026, 1, 10));
    }
}
