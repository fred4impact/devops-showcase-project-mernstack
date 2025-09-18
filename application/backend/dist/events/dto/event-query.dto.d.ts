import { EventStatus } from '../../schemas/event.schema';
export declare class EventQueryDto {
    category?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    status?: EventStatus;
    page?: string;
    limit?: string;
}
