import { Model } from 'mongoose';
import { UserDocument, UserRole } from '../schemas/user.schema';
import { Order, OrderDocument } from '../schemas/order.schema';
export declare class UsersService {
    private userModel;
    private orderModel;
    constructor(userModel: Model<UserDocument>, orderModel: Model<OrderDocument>);
    getUserOrders(userId: string): Promise<(import("mongoose").Document<unknown, {}, OrderDocument, {}, {}> & Order & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    upgradeToOrganizer(userId: string): Promise<{
        message: string;
        user: {
            id: unknown;
            name: string;
            email: string;
            role: UserRole.ORGANIZER;
        };
    }>;
}
