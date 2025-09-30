import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'TicketType', required: true })
  ticketTypeId: Types.ObjectId;

  @Prop()
  seatId?: string;

  @Prop({ required: true })
  priceCents: number;

  @Prop({ required: true })
  qty: number;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  email: string;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  totalCents: number;

  @Prop({ default: 0 })
  feesCents: number;

  @Prop({ default: 0 })
  taxCents: number;

  @Prop({ 
    type: String, 
    enum: Object.values(OrderStatus), 
    default: OrderStatus.PENDING 
  })
  status: OrderStatus;

  @Prop({ default: 'stripe' })
  paymentProvider: string;

  @Prop()
  paymentIntentId?: string;

  @Prop()
  stripeSessionId?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
