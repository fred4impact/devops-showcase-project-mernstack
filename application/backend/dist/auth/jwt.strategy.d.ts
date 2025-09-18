import { Strategy } from 'passport-jwt';
import { Model } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    validate(payload: any): Promise<{
        id: unknown;
        email: string;
        role: import("../schemas/user.schema").UserRole;
    }>;
}
export {};
