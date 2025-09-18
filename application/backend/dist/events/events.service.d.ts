import { Model } from 'mongoose';
import { Event, EventDocument } from '../schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto } from './dto/event-query.dto';
export declare class EventsService {
    private eventModel;
    constructor(eventModel: Model<EventDocument>);
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
    duplicate(eventId: string, organizerId: string): Promise<Event>;
}
