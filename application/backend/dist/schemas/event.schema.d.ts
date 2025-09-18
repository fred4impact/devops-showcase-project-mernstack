import { Document, Types } from 'mongoose';
export type EventDocument = Event & Document;
export declare enum EventStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    CANCELLED = "cancelled"
}
export declare enum SeatmapType {
    RESERVED = "reserved",
    GA = "ga"
}
export declare class Venue {
    name: string;
    address: string;
    capacity: number;
    timezone: string;
}
export declare class Seat {
    seatId: string;
    section: string;
    row: string;
    number: string;
    priceModifier: number;
    accessible: boolean;
}
export declare class Seatmap {
    type: SeatmapType;
    svg?: string;
    seats: Seat[];
}
export declare class Event {
    organizerId: Types.ObjectId;
    title: string;
    slug: string;
    description: string;
    category: string;
    venue: Venue;
    startAt: Date;
    endAt: Date;
    status: EventStatus;
    images: string[];
    seatmap?: Seatmap;
}
export declare const EventSchema: import("mongoose").Schema<Event, import("mongoose").Model<Event, any, any, any, Document<unknown, any, Event, any, {}> & Event & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Event, Document<unknown, {}, import("mongoose").FlatRecord<Event>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Event> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
