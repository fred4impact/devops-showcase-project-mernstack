import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SeatLockDocument = SeatLock & Document;

@Schema({ timestamps: true })
export class SeatLock {
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  eventId: Types.ObjectId;

  @Prop({ required: true })
  seatId: string;

  @Prop({ required: true })
  sessionId: string;

  @Prop({ required: true })
  userId?: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  isPermanent: boolean;
}

export const SeatLockSchema = SchemaFactory.createForClass(SeatLock);

// Create TTL index for automatic cleanup
SeatLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
