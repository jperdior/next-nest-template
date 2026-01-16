/**
 * Base class for all domain events.
 * Domain events represent something significant that happened in the domain.
 */
export declare abstract class DomainEvent {
    readonly eventId: string;
    readonly occurredOn: Date;
    readonly aggregateId: string;
    constructor(aggregateId: string);
    /**
     * Returns the name of the event (e.g., "user.registered", "order.created")
     */
    abstract eventName(): string;
    /**
     * Serializes the event data for publishing
     */
    abstract toPrimitives(): Record<string, unknown>;
}
