import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare enum UserRole {
    ATTENDEE = "attendee",
    ORGANIZER = "organizer",
    ADMIN = "admin"
}
export declare class User {
    name: string;
    email: string;
    phone?: string;
    passwordHash: string;
    role: UserRole;
    marketingConsent: boolean;
    isActive: boolean;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
