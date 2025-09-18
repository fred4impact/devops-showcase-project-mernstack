import { ConfigService } from '@nestjs/config';
export declare class S3Service {
    private configService;
    private s3;
    constructor(configService: ConfigService);
    uploadFile(file: Buffer, key: string, contentType: string, bucket?: string): Promise<string>;
    uploadTicketPDF(pdfBuffer: Buffer, ticketId: string): Promise<string>;
    uploadEventImage(imageBuffer: Buffer, eventId: string, filename: string): Promise<string>;
    deleteFile(key: string, bucket?: string): Promise<void>;
}
