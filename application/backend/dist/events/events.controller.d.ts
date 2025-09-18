import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto } from './dto/event-query.dto';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    getEvents(query: EventQueryDto): Promise<{
        events: (import("mongoose").Document<unknown, {}, import("../schemas/event.schema").EventDocument, {}, {}> & import("../schemas/event.schema").Event & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
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
    getMyEvents(req: any, query: EventQueryDto): Promise<{
        events: (import("mongoose").Document<unknown, {}, import("../schemas/event.schema").EventDocument, {}, {}> & import("../schemas/event.schema").Event & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
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
    createEvent(createEventDto: CreateEventDto, req: any): Promise<import("../schemas/event.schema").Event>;
    getEvent(id: string): Promise<import("../schemas/event.schema").Event>;
    getEventBySlug(slug: string): Promise<import("../schemas/event.schema").Event>;
    updateEvent(id: string, updateEventDto: UpdateEventDto, req: any): Promise<import("../schemas/event.schema").Event>;
    publishEvent(id: string, req: any): Promise<import("../schemas/event.schema").Event>;
    duplicateEvent(id: string, req: any): Promise<import("../schemas/event.schema").Event>;
    deleteEvent(id: string, req: any): Promise<{
        message: string;
    }>;
}
