import { DomainEvent } from "./domain-event";
/**
 * Base class for all aggregate roots.
 *
 * An aggregate root is the main entity that encapsulates a cluster of domain objects
 * and enforces invariants across them. It's the entry point for all operations
 * on the aggregate and is responsible for recording domain events.
 */
export declare abstract class AggregateRoot {
    private domainEvents;
    /**
     * Returns and clears all recorded domain events.
     * Called by the infrastructure layer after persisting the aggregate.
     */
    pullDomainEvents(): DomainEvent[];
    /**
     * Records a domain event to be published after the aggregate is persisted.
     */
    protected record(event: DomainEvent): void;
}
