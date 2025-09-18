export declare class OrderItemDto {
    ticketTypeId: string;
    seatId?: string;
    priceCents: number;
    qty: number;
}
export declare class CreateOrderDto {
    email: string;
    items: OrderItemDto[];
    totalCents: number;
    feesCents?: number;
    taxCents?: number;
}
