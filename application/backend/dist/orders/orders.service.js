"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_1 = require("../schemas/order.schema");
const ticket_type_schema_1 = require("../schemas/ticket-type.schema");
const cart_service_1 = require("../cart/cart.service");
const ticket_types_service_1 = require("../ticket-types/ticket-types.service");
let OrdersService = class OrdersService {
    constructor(orderModel, ticketTypeModel, cartService, ticketTypesService) {
        this.orderModel = orderModel;
        this.ticketTypeModel = ticketTypeModel;
        this.cartService = cartService;
        this.ticketTypesService = ticketTypesService;
    }
    async create(createOrderDto, userId, sessionId) {
        if (sessionId) {
            const validation = await this.cartService.validateCart(sessionId);
            if (!validation.isValid) {
                throw new common_1.BadRequestException(`Cart validation failed: ${validation.errors.join(', ')}`);
            }
        }
        for (const item of createOrderDto.items) {
            const ticketType = await this.ticketTypeModel.findById(item.ticketTypeId);
            if (!ticketType) {
                throw new common_1.BadRequestException(`Ticket type ${item.ticketTypeId} not found`);
            }
            const isOnSale = await this.ticketTypesService.isOnSale(item.ticketTypeId);
            if (!isOnSale) {
                throw new common_1.BadRequestException(`Ticket type ${item.ticketTypeId} is not on sale`);
            }
            const availableCapacity = await this.ticketTypesService.getAvailableCapacity(item.ticketTypeId);
            if (item.qty > availableCapacity) {
                throw new common_1.BadRequestException(`Not enough tickets available for ${item.ticketTypeId}`);
            }
        }
        const order = new this.orderModel({
            ...createOrderDto,
            userId,
            status: order_schema_1.OrderStatus.PENDING,
            paymentProvider: 'stripe',
        });
        const savedOrder = await order.save();
        for (const item of createOrderDto.items) {
            await this.ticketTypesService.incrementSoldCount(item.ticketTypeId.toString(), item.qty);
        }
        if (sessionId) {
            await this.cartService.clearCart(sessionId);
        }
        return savedOrder;
    }
    async findById(id) {
        const order = await this.orderModel
            .findById(id)
            .populate('items.ticketTypeId')
            .exec();
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
    async findByUserId(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            this.orderModel
                .find({ userId })
                .populate('items.ticketTypeId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.orderModel.countDocuments({ userId })
        ]);
        return {
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    async findByEmail(email, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            this.orderModel
                .find({ email })
                .populate('items.ticketTypeId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.orderModel.countDocuments({ email })
        ]);
        return {
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    async updateStatus(id, status, paymentIntentId) {
        const order = await this.orderModel.findById(id);
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        order.status = status;
        if (paymentIntentId) {
            order.paymentIntentId = paymentIntentId;
        }
        return order.save();
    }
    async cancelOrder(id, userId) {
        const order = await this.orderModel.findById(id);
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (userId && order.userId && order.userId.toString() !== userId) {
            throw new common_1.BadRequestException('You can only cancel your own orders');
        }
        if (order.status !== order_schema_1.OrderStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending orders can be cancelled');
        }
        for (const item of order.items) {
            await this.ticketTypesService.decrementSoldCount(item.ticketTypeId.toString(), item.qty);
        }
        order.status = order_schema_1.OrderStatus.CANCELLED;
        return order.save();
    }
    async getOrderStats(eventId) {
        const filter = eventId ? { 'items.ticketTypeId': { $in: await this.getTicketTypesByEvent(eventId) } } : {};
        const stats = await this.orderModel.aggregate([
            { $match: { ...filter, status: order_schema_1.OrderStatus.PAID } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$totalCents' },
                    totalTickets: { $sum: { $sum: '$items.qty' } }
                }
            }
        ]);
        return stats[0] || { totalOrders: 0, totalRevenue: 0, totalTickets: 0 };
    }
    async getTicketTypesByEvent(eventId) {
        const ticketTypes = await this.ticketTypeModel.find({ eventId }).select('_id');
        return ticketTypes.map(tt => tt._id.toString());
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(1, (0, mongoose_1.InjectModel)(ticket_type_schema_1.TicketType.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        cart_service_1.CartService,
        ticket_types_service_1.TicketTypesService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map