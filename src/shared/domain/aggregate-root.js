"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateRoot = void 0;
/**
 * Base class for all aggregate roots.
 *
 * An aggregate root is the main entity that encapsulates a cluster of domain objects
 * and enforces invariants across them. It's the entry point for all operations
 * on the aggregate and is responsible for recording domain events.
 */
class AggregateRoot {
    domainEvents = [];
    /**
     * Returns and clears all recorded domain events.
     * Called by the infrastructure layer after persisting the aggregate.
     */
    pullDomainEvents() {
        const events = this.domainEvents;
        this.domainEvents = [];
        return events;
    }
    /**
     * Records a domain event to be published after the aggregate is persisted.
     */
    record(event) {
        this.domainEvents.push(event);
    }
}
exports.AggregateRoot = AggregateRoot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdncmVnYXRlLXJvb3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhZ2dyZWdhdGUtcm9vdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQTs7Ozs7O0dBTUc7QUFDSCxNQUFzQixhQUFhO0lBQ3pCLFlBQVksR0FBa0IsRUFBRSxDQUFDO0lBRXpDOzs7T0FHRztJQUNILGdCQUFnQjtRQUNkLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDakMsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7UUFDdkIsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVEOztPQUVHO0lBQ08sTUFBTSxDQUFDLEtBQWtCO1FBQ2pDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLENBQUM7Q0FDRjtBQW5CRCxzQ0FtQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEb21haW5FdmVudCB9IGZyb20gXCIuL2RvbWFpbi1ldmVudFwiO1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGFsbCBhZ2dyZWdhdGUgcm9vdHMuXG4gKiBcbiAqIEFuIGFnZ3JlZ2F0ZSByb290IGlzIHRoZSBtYWluIGVudGl0eSB0aGF0IGVuY2Fwc3VsYXRlcyBhIGNsdXN0ZXIgb2YgZG9tYWluIG9iamVjdHNcbiAqIGFuZCBlbmZvcmNlcyBpbnZhcmlhbnRzIGFjcm9zcyB0aGVtLiBJdCdzIHRoZSBlbnRyeSBwb2ludCBmb3IgYWxsIG9wZXJhdGlvbnNcbiAqIG9uIHRoZSBhZ2dyZWdhdGUgYW5kIGlzIHJlc3BvbnNpYmxlIGZvciByZWNvcmRpbmcgZG9tYWluIGV2ZW50cy5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFnZ3JlZ2F0ZVJvb3Qge1xuICBwcml2YXRlIGRvbWFpbkV2ZW50czogRG9tYWluRXZlbnRbXSA9IFtdO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuZCBjbGVhcnMgYWxsIHJlY29yZGVkIGRvbWFpbiBldmVudHMuXG4gICAqIENhbGxlZCBieSB0aGUgaW5mcmFzdHJ1Y3R1cmUgbGF5ZXIgYWZ0ZXIgcGVyc2lzdGluZyB0aGUgYWdncmVnYXRlLlxuICAgKi9cbiAgcHVsbERvbWFpbkV2ZW50cygpOiBEb21haW5FdmVudFtdIHtcbiAgICBjb25zdCBldmVudHMgPSB0aGlzLmRvbWFpbkV2ZW50cztcbiAgICB0aGlzLmRvbWFpbkV2ZW50cyA9IFtdO1xuICAgIHJldHVybiBldmVudHM7XG4gIH1cblxuICAvKipcbiAgICogUmVjb3JkcyBhIGRvbWFpbiBldmVudCB0byBiZSBwdWJsaXNoZWQgYWZ0ZXIgdGhlIGFnZ3JlZ2F0ZSBpcyBwZXJzaXN0ZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgcmVjb3JkKGV2ZW50OiBEb21haW5FdmVudCk6IHZvaWQge1xuICAgIHRoaXMuZG9tYWluRXZlbnRzLnB1c2goZXZlbnQpO1xuICB9XG59XG4iXX0=