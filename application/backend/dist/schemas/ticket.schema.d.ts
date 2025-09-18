import { Document, Types } from 'mongoose';
export type TicketDocument = Ticket & Document;
export declare enum TicketStatus {
    ISSUED = "issued",
    USED = "used",
    REFUNDED = "refunded"
}
export declare class Ticket {
    orderId: Types.ObjectId;
    eventId: Types.ObjectId;
    ticketTypeId: Types.ObjectId;
    seatId?: string;
    ticketUUID: string;
    qrPayload: string;
    pdfUrl?: string;
    status: TicketStatus;
    issuedAt: Date;
    usedAt?: Date;
}
export declare const TicketSchema: import("mongoose").Schema<Ticket, import("mongoose").Model<Ticket, any, any, any, Document<unknown, any, Ticket, any, {}> & Ticket & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Ticket, Document<unknown, {}, import("mongoose").FlatRecord<Ticket>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Ticket> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
