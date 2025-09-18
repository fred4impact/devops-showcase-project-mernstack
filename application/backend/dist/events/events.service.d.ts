import { Model } from 'mongoose';
import { Event, EventDocument, EventStatus } from '../schemas/event.schema';
import { TicketType, TicketTypeDocument } from '../schemas/ticket-type.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto } from './dto/event-query.dto';
export declare class EventsService {
    private eventModel;
    private ticketTypeModel;
    constructor(eventModel: Model<EventDocument>, ticketTypeModel: Model<TicketTypeDocument>);
    create(createEventDto: CreateEventDto, organizerId: string): Promise<Event>;
    findAll(query?: EventQueryDto): Promise<{
        events: (import("mongoose").Document<unknown, {}, EventDocument, {}, {}> & Event & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    findOne(id: string): Promise<Event>;
    findBySlug(slug: string): Promise<Event>;
    update(id: string, updateEventDto: UpdateEventDto, userId: string): Promise<Event>;
    remove(id: string, userId: string): Promise<void>;
    publish(id: string, userId: string): Promise<Event>;
    getOrganizerEvents(organizerId: string, query?: EventQueryDto): Promise<{
        events: {
            ticketTypes: (import("mongoose").Document<unknown, {}, TicketTypeDocument, {}, {}> & TicketType & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
                _id: unknown;
            }> & {
                __v: number;
            })[];
            organizerId: import("mongoose").Types.ObjectId;
            title: string;
            slug: string;
            description: string;
            category: string;
            venue: import("../schemas/event.schema").Venue;
            startAt: Date;
            endAt: Date;
            status: EventStatus;
            images: string[];
            seatmap?: import("../schemas/event.schema").Seatmap;
            _id: unknown;
            $locals: Record<string, unknown>;
            $op: "save" | "validate" | "remove" | null;
            $where: Record<string, unknown>;
            baseModelName?: string;
            collection: import("mongoose").Collection;
            db: import("mongoose").Connection;
            errors?: import("mongoose").Error.ValidationError;
            id?: any;
            isNew: boolean;
            schema: import("mongoose").Schema;
            __v: number;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    duplicate(eventId: string, organizerId: string): Promise<Event>;
}
