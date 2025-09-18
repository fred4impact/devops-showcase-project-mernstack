import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getUserOrders(req: any): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/order.schema").OrderDocument, {}, {}> & import("../schemas/order.schema").Order & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    upgradeToOrganizer(req: any): Promise<{
        message: string;
        user: {
            id: unknown;
            name: string;
            email: string;
            role: import("../schemas/user.schema").UserRole.ORGANIZER;
        };
    }>;
}
