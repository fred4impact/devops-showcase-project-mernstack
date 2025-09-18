import { Document, Types } from 'mongoose';
export type OrderDocument = Order & Document;
export declare enum OrderStatus {
    PENDING = "pending",
    PAID = "paid",
    CANCELLED = "cancelled",
    REFUNDED = "refunded"
}
export declare class OrderItem {
    ticketTypeId: Types.ObjectId;
    seatId?: string;
    priceCents: number;
    qty: number;
}
export declare class Order {
    userId?: Types.ObjectId;
    email: string;
    items: OrderItem[];
    totalCents: number;
    feesCents: number;
    taxCents: number;
    status: OrderStatus;
    paymentProvider: string;
    paymentIntentId?: string;
    stripeSessionId?: string;
}
export declare const OrderSchema: import("mongoose").Schema<Order, import("mongoose").Model<Order, any, any, any, Document<unknown, any, Order, any, {}> & Order & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Order, Document<unknown, {}, import("mongoose").FlatRecord<Order>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Order> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
