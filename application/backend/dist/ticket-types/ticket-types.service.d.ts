import { Model } from 'mongoose';
import { TicketType, TicketTypeDocument } from '../schemas/ticket-type.schema';
import { EventDocument } from '../schemas/event.schema';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
export declare class TicketTypesService {
    private ticketTypeModel;
    private eventModel;
    constructor(ticketTypeModel: Model<TicketTypeDocument>, eventModel: Model<EventDocument>);
    create(createTicketTypeDto: CreateTicketTypeDto, eventId: string, userId: string): Promise<TicketType>;
    findByEventId(eventId: string): Promise<TicketType[]>;
    findOne(id: string): Promise<TicketType>;
    update(id: string, updateTicketTypeDto: UpdateTicketTypeDto, userId: string): Promise<TicketType>;
    remove(id: string, userId: string): Promise<void>;
    getAvailableCapacity(id: string): Promise<number>;
    incrementSoldCount(id: string, quantity: number): Promise<void>;
    decrementSoldCount(id: string, quantity: number): Promise<void>;
    isOnSale(id: string): Promise<boolean>;
}
