package com.realestatefinder.domain;

import java.math.BigDecimal;
import java.util.Currency;
import java.util.Objects;

/** A non-negative monetary amount. */
public record Price(BigDecimal amount, Currency currency) {

    public Price {
        Objects.requireNonNull(amount, "amount must not be null");
        Objects.requireNonNull(currency, "currency must not be null");
        if (amount.signum() < 0) {
            throw new IllegalArgumentException("amount must not be negative");
        }
    }

    public static Price euros(BigDecimal amount) {
        return new Price(amount, Currency.getInstance("EUR"));
    }
}
