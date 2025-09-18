import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3Service {
  private s3: AWS.S3;

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('S3_ACCESS_KEY'),
      secretAccessKey: this.configService.get('S3_SECRET_KEY'),
      region: this.configService.get('S3_REGION', 'us-east-1'),
    });
  }

  async uploadFile(
    file: Buffer,
    key: string,
    contentType: string,
    bucket?: string,
  ): Promise<string> {
    const bucketName = bucket || this.configService.get('S3_BUCKET');
    
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read',
    };

    const result = await this.s3.upload(params).promise();
    return result.Location;
  }

  async uploadTicketPDF(
    pdfBuffer: Buffer,
    ticketId: string,
  ): Promise<string> {
    const key = `tickets/${ticketId}.pdf`;
    return this.uploadFile(pdfBuffer, key, 'application/pdf');
  }

  async uploadEventImage(
    imageBuffer: Buffer,
    eventId: string,
    filename: string,
  ): Promise<string> {
    const key = `events/${eventId}/images/${filename}`;
    return this.uploadFile(imageBuffer, key, 'image/jpeg');
  }

  async deleteFile(key: string, bucket?: string): Promise<void> {
    const bucketName = bucket || this.configService.get('S3_BUCKET');
    
    await this.s3.deleteObject({
      Bucket: bucketName,
      Key: key,
    }).promise();
  }
}
