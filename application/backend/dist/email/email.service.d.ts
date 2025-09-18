import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    constructor(configService: ConfigService);
    sendTicketConfirmation(email: string, orderId: string, ticketUrls: string[]): Promise<void>;
    sendTicketRefund(email: string, orderId: string, refundAmount: number): Promise<void>;
    sendTicketTransferNotification(recipientEmail: string, ticket: any, message?: string): Promise<void>;
    sendRefundRequestNotification(organizerEmail: string, ticket: any, refundRequest: any): Promise<void>;
}
