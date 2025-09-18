import { TicketTypesService } from './ticket-types.service';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
export declare class TicketTypesController {
    private readonly ticketTypesService;
    constructor(ticketTypesService: TicketTypesService);
    createTicketType(eventId: string, createTicketTypeDto: CreateTicketTypeDto, req: any): Promise<import("../schemas/ticket-type.schema").TicketType>;
    getTicketTypesByEvent(eventId: string): Promise<import("../schemas/ticket-type.schema").TicketType[]>;
    getTicketType(id: string): Promise<import("../schemas/ticket-type.schema").TicketType>;
    getAvailability(id: string): Promise<{
        availableCapacity: number;
    }>;
    getOnSaleStatus(id: string): Promise<{
        isOnSale: boolean;
    }>;
    updateTicketType(id: string, updateTicketTypeDto: UpdateTicketTypeDto, req: any): Promise<import("../schemas/ticket-type.schema").TicketType>;
    deleteTicketType(id: string, req: any): Promise<{
        message: string;
    }>;
}
