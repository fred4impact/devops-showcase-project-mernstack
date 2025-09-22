import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Image, ImageDocument } from '../schemas/image.schema';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3Service {
  private s3: AWS.S3;
  private useS3: boolean;

  constructor(
    private configService: ConfigService,
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>
  ) {
    // Check if S3 credentials are configured
    const hasS3Credentials = this.configService.get('S3_ACCESS_KEY') && 
                            this.configService.get('S3_SECRET_KEY') && 
                            this.configService.get('S3_BUCKET');
    
    this.useS3 = hasS3Credentials && this.configService.get('NODE_ENV') !== 'development';
    
    if (this.useS3) {
      this.s3 = new AWS.S3({
        accessKeyId: this.configService.get('S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('S3_SECRET_KEY'),
        region: this.configService.get('S3_REGION', 'us-east-1'),
      });
    }
  }

  async uploadFile(
    file: Buffer,
    key: string,
    contentType: string,
    bucket?: string,
  ): Promise<string> {
    if (this.useS3) {
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
    } else {
      // For local development, store in MongoDB
      const image = new this.imageModel({
        filename: key,
        originalName: key.split('/').pop() || key,
        mimetype: contentType,
        size: file.length,
        data: file,
        eventId: key.split('/')[1], // Extract eventId from key
      });
      
      await image.save();
      
      // Return a URL that can be used to fetch the image
      return `${this.configService.get('BACKEND_BASE_URL', 'http://localhost:3001')}/events/images/${image._id}`;
    }
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
    if (this.useS3) {
      const bucketName = bucket || this.configService.get('S3_BUCKET');
      
      await this.s3.deleteObject({
        Bucket: bucketName,
        Key: key,
      }).promise();
    } else {
      // For local development, mark as deleted in MongoDB
      await this.imageModel.findOneAndUpdate(
        { filename: key },
        { isDeleted: true }
      );
    }
  }

  // Method to get image from MongoDB
  async getImage(imageId: string): Promise<ImageDocument | null> {
    if (!this.useS3) {
      return await this.imageModel.findById(imageId);
    }
    return null;
  }
}
