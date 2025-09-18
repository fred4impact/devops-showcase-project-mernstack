import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(createOrderDto: CreateOrderDto, sessionId?: string, req?: any): Promise<import("../schemas/order.schema").Order>;
    getMyOrders(req: any, page?: string, limit?: string): Promise<{
        orders: (import("mongoose").Document<unknown, {}, import("../schemas/order.schema").OrderDocument, {}, {}> & import("../schemas/order.schema").Order & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getOrdersByEmail(email: string, page?: string, limit?: string): Promise<{
        orders: (import("mongoose").Document<unknown, {}, import("../schemas/order.schema").OrderDocument, {}, {}> & import("../schemas/order.schema").Order & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getOrder(id: string): Promise<import("../schemas/order.schema").Order>;
    cancelOrder(id: string, req: any): Promise<import("../schemas/order.schema").Order>;
    getEventStats(eventId: string): Promise<any>;
    getOverallStats(): Promise<any>;
}
