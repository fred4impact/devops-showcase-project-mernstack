export declare enum RefundReason {
    CANCELLED_EVENT = "cancelled_event",
    PERSONAL_REASONS = "personal_reasons",
    DUPLICATE_PURCHASE = "duplicate_purchase",
    TECHNICAL_ISSUE = "technical_issue",
    OTHER = "other"
}
export declare class RefundTicketDto {
    reason: RefundReason;
    description?: string;
}
