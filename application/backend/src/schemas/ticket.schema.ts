import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TicketDocument = Ticket & Document;

export enum TicketStatus {
  ISSUED = 'issued',
  USED = 'used',
  REFUNDED = 'refunded',
}

@Schema({ timestamps: true })
export class Ticket {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  eventId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TicketType', required: true })
  ticketTypeId: Types.ObjectId;

  @Prop()
  seatId?: string;

  @Prop({ required: true, unique: true })
  ticketUUID: string;

  @Prop({ required: true })
  qrPayload: string;

  @Prop()
  pdfUrl?: string;

  @Prop({
    type: String,
    enum: Object.values(TicketStatus),
    default: TicketStatus.ISSUED,
  })
  status: TicketStatus;

  @Prop({ default: Date.now })
  issuedAt: Date;

  @Prop()
  usedAt?: Date;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
