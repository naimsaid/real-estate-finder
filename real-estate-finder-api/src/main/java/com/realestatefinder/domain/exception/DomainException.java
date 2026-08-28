package com.realestatefinder.domain.exception;

/** Base type for domain-level failures. */
public abstract class DomainException extends RuntimeException {

    protected DomainException(String message) {
        super(message);
    }
}
