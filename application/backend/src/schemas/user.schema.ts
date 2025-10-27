import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ATTENDEE = 'attendee',
  ORGANIZER = 'organizer',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.ATTENDEE,
  })
  role: UserRole;

  @Prop({ default: false })
  marketingConsent: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  profilePicture?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
