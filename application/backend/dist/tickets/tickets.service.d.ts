import { Model } from 'mongoose';
import { Ticket, TicketDocument } from '../schemas/ticket.schema';
import { OrderDocument } from '../schemas/order.schema';
import { EventDocument } from '../schemas/event.schema';
import { UserDocument } from '../schemas/user.schema';
import { TransferTicketDto } from './dto/transfer-ticket.dto';
import { RefundTicketDto } from './dto/refund-ticket.dto';
import { EmailService } from '../email/email.service';
export declare class TicketsService {
    private ticketModel;
    private orderModel;
    private eventModel;
    private userModel;
    private emailService;
    constructor(ticketModel: Model<TicketDocument>, orderModel: Model<OrderDocument>, eventModel: Model<EventDocument>, userModel: Model<UserDocument>, emailService: EmailService);
    findByUserId(userId: string, page?: number, limit?: number, status?: string): Promise<{
        tickets: (import("mongoose").Document<unknown, {}, TicketDocument, {}, {}> & Ticket & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
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
    findOne(ticketId: string, userId: string): Promise<import("mongoose").Document<unknown, {}, TicketDocument, {}, {}> & Ticket & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    transferTicket(ticketId: string, transferDto: TransferTicketDto, userId: string): Promise<{
        message: string;
    }>;
    updateStatus(ticketId: string, status: string, userId: string): Promise<{
        message: string;
    }>;
    requestRefund(ticketId: string, refundDto: RefundTicketDto, userId: string): Promise<{
        message: string;
    }>;
    getQRCode(ticketId: string, userId: string): Promise<{
        qrCode: string;
        ticketUUID: string;
    }>;
    getPDF(ticketId: string, userId: string): Promise<{
        pdfUrl: string;
    }>;
    getEventAttendees(eventId: string, userId: string): Promise<(import("mongoose").Document<unknown, {}, TicketDocument, {}, {}> & Ticket & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    private getUserOrderIds;
}
