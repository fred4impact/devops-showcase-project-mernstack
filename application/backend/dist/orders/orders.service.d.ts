import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../schemas/order.schema';
import { TicketTypeDocument } from '../schemas/ticket-type.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { CartService } from '../cart/cart.service';
import { TicketTypesService } from '../ticket-types/ticket-types.service';
export declare class OrdersService {
    private orderModel;
    private ticketTypeModel;
    private readonly cartService;
    private readonly ticketTypesService;
    constructor(orderModel: Model<OrderDocument>, ticketTypeModel: Model<TicketTypeDocument>, cartService: CartService, ticketTypesService: TicketTypesService);
    create(createOrderDto: CreateOrderDto, userId?: string, sessionId?: string): Promise<Order>;
    findById(id: string): Promise<Order>;
    findByUserId(userId: string, page?: number, limit?: number): Promise<{
        orders: (import("mongoose").Document<unknown, {}, OrderDocument, {}, {}> & Order & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
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
    findByEmail(email: string, page?: number, limit?: number): Promise<{
        orders: (import("mongoose").Document<unknown, {}, OrderDocument, {}, {}> & Order & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
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
    updateStatus(id: string, status: OrderStatus, paymentIntentId?: string): Promise<Order>;
    cancelOrder(id: string, userId?: string): Promise<Order>;
    getOrderStats(eventId?: string): Promise<any>;
    private getTicketTypesByEvent;
}
