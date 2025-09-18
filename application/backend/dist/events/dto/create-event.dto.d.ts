import { EventStatus, SeatmapType } from '../../schemas/event.schema';
export declare class VenueDto {
    name: string;
    address: string;
    capacity: number;
    timezone: string;
}
export declare class SeatDto {
    seatId: string;
    section: string;
    row: string;
    number: string;
    priceModifier?: number;
    accessible?: boolean;
}
export declare class SeatmapDto {
    type: SeatmapType;
    svg?: string;
    seats?: SeatDto[];
}
export declare class CreateEventDto {
    title: string;
    slug: string;
    description: string;
    category: string;
    venue: VenueDto;
    startAt: string;
    endAt: string;
    status?: EventStatus;
    images?: string[];
    seatmap?: SeatmapDto;
}
