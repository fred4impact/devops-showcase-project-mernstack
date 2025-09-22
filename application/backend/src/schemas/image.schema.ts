import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ImageDocument = Image & Document;

@Schema({ timestamps: true })
export class Image {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimetype: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  data: Buffer;

  @Prop({ required: true })
  eventId: string;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
