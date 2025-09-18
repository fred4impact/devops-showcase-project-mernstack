import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto } from './dto/event-query.dto';
import { S3Service } from '../s3/s3.service';
export declare class EventsController {
    private readonly eventsService;
    private readonly s3Service;
    constructor(eventsService: EventsService, s3Service: S3Service);
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
        events: {
            ticketTypes: (import("mongoose").Document<unknown, {}, import("../schemas/ticket-type.schema").TicketTypeDocument, {}, {}> & import("../schemas/ticket-type.schema").TicketType & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
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
            status: import("../schemas/event.schema").EventStatus;
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
    createEvent(createEventDto: CreateEventDto, req: any): Promise<import("../schemas/event.schema").Event>;
    getEvent(id: string): Promise<import("../schemas/event.schema").Event>;
    getEventBySlug(slug: string): Promise<import("../schemas/event.schema").Event>;
    updateEvent(id: string, updateEventDto: UpdateEventDto, req: any): Promise<import("../schemas/event.schema").Event>;
    publishEvent(id: string, req: any): Promise<import("../schemas/event.schema").Event>;
    duplicateEvent(id: string, req: any): Promise<import("../schemas/event.schema").Event>;
    deleteEvent(id: string, req: any): Promise<{
        message: string;
    }>;
    uploadEventImage(eventId: string, file: Express.Multer.File, req: any): Promise<{
        imageUrl: string;
    }>;
}
