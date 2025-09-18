import { Document, Types } from 'mongoose';
export type TicketTypeDocument = TicketType & Document;
export declare class TicketType {
    eventId: Types.ObjectId;
    name: string;
    description?: string;
    priceCents: number;
    currency: string;
    capacity: number;
    salesStart: Date;
    salesEnd: Date;
    refundable: boolean;
    soldCount: number;
}
export declare const TicketTypeSchema: import("mongoose").Schema<TicketType, import("mongoose").Model<TicketType, any, any, any, Document<unknown, any, TicketType, any, {}> & TicketType & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TicketType, Document<unknown, {}, import("mongoose").FlatRecord<TicketType>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<TicketType> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
