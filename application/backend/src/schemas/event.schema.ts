import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventDocument = Event & Document;

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
}

export enum SeatmapType {
  RESERVED = 'reserved',
  GA = 'ga',
}

@Schema({ _id: false })
export class Venue {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  capacity: number;

  @Prop({ required: true })
  timezone: string;
}

@Schema({ _id: false })
export class Seat {
  @Prop({ required: true })
  seatId: string;

  @Prop({ required: true })
  section: string;

  @Prop({ required: true })
  row: string;

  @Prop({ required: true })
  number: string;

  @Prop({ default: 0 })
  priceModifier: number;

  @Prop({ default: false })
  accessible: boolean;
}

@Schema({ _id: false })
export class Seatmap {
  @Prop({ 
    type: String, 
    enum: Object.values(SeatmapType), 
    default: SeatmapType.GA 
  })
  type: SeatmapType;

  @Prop()
  svg?: string;

  @Prop({ type: [Seat] })
  seats: Seat[];
}

@Schema({ timestamps: true })
export class Event {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  organizerId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ type: Venue, required: true })
  venue: Venue;

  @Prop({ required: true })
  startAt: Date;

  @Prop({ required: true })
  endAt: Date;

  @Prop({ 
    type: String, 
    enum: Object.values(EventStatus), 
    default: EventStatus.DRAFT 
  })
  status: EventStatus;

  @Prop({ type: [String] })
  images: string[];

  @Prop({ type: Seatmap })
  seatmap?: Seatmap;
}

export const EventSchema = SchemaFactory.createForClass(Event);
