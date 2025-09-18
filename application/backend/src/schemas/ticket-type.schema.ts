import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TicketTypeDocument = TicketType & Document;

@Schema({ timestamps: true })
export class TicketType {
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  eventId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: false, trim: true })
  description?: string;

  @Prop({ required: true })
  priceCents: number;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ required: true })
  capacity: number;

  @Prop({ required: true })
  salesStart: Date;

  @Prop({ required: true })
  salesEnd: Date;

  @Prop({ default: true })
  refundable: boolean;

  @Prop({ default: 0 })
  soldCount: number;
}

export const TicketTypeSchema = SchemaFactory.createForClass(TicketType);
