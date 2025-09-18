import { TicketsService } from './tickets.service';
import { TransferTicketDto } from './dto/transfer-ticket.dto';
import { RefundTicketDto } from './dto/refund-ticket.dto';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    getMyTickets(req: any, page?: string, limit?: string, status?: string): Promise<{
        tickets: (import("mongoose").Document<unknown, {}, import("../schemas/ticket.schema").TicketDocument, {}, {}> & import("../schemas/ticket.schema").Ticket & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
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
    getTicket(id: string, req: any): Promise<import("mongoose").Document<unknown, {}, import("../schemas/ticket.schema").TicketDocument, {}, {}> & import("../schemas/ticket.schema").Ticket & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    transferTicket(id: string, transferTicketDto: TransferTicketDto, req: any): Promise<{
        message: string;
    }>;
    updateTicketStatus(id: string, body: {
        status: string;
    }, req: any): Promise<{
        message: string;
    }>;
    requestRefund(id: string, refundTicketDto: RefundTicketDto, req: any): Promise<{
        message: string;
    }>;
    getTicketQRCode(id: string, req: any): Promise<{
        qrCode: string;
        ticketUUID: string;
    }>;
    getTicketPDF(id: string, req: any): Promise<{
        pdfUrl: string;
    }>;
    getEventAttendees(eventId: string, req: any): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/ticket.schema").TicketDocument, {}, {}> & import("../schemas/ticket.schema").Ticket & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
}
