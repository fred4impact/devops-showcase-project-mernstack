import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../schemas/order.schema';
import { TicketType, TicketTypeDocument } from '../schemas/ticket-type.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { CartService } from '../cart/cart.service';
import { TicketTypesService } from '../ticket-types/ticket-types.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(TicketType.name) private ticketTypeModel: Model<TicketTypeDocument>,
    private readonly cartService: CartService,
    private readonly ticketTypesService: TicketTypesService,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId?: string, sessionId?: string): Promise<Order> {
    // Validate cart if sessionId provided
    if (sessionId) {
      const validation = await this.cartService.validateCart(sessionId);
      if (!validation.isValid) {
        throw new BadRequestException(`Cart validation failed: ${validation.errors.join(', ')}`);
      }
    }

    // Validate ticket types and availability
    let totalTickets = 0;
    for (const item of createOrderDto.items) {
      // Check ticket quantity limit (max 5 tickets per purchase)
      if (item.qty > 5) {
        throw new BadRequestException('Cannot purchase more than 5 tickets at a time');
      }
      
      totalTickets += item.qty;
      
      const ticketType = await this.ticketTypeModel.findById(item.ticketTypeId);
      if (!ticketType) {
        throw new BadRequestException(`Ticket type ${item.ticketTypeId} not found`);
      }

      const isOnSale = await this.ticketTypesService.isOnSale(item.ticketTypeId);
      if (!isOnSale) {
        throw new BadRequestException(`Ticket type ${item.ticketTypeId} is not on sale`);
      }

      const availableCapacity = await this.ticketTypesService.getAvailableCapacity(item.ticketTypeId);
      if (item.qty > availableCapacity) {
        throw new BadRequestException(`Not enough tickets available for ${item.ticketTypeId}`);
      }
    }

    // Check total ticket limit (max 5 tickets per purchase)
    if (totalTickets > 5) {
      throw new BadRequestException('Cannot purchase more than 5 tickets total per order');
    }

    // Calculate processing fees ($0.99 per ticket)
    const processingFeesCents = totalTickets * 99;

    // Create order
    const order = new this.orderModel({
      ...createOrderDto,
      userId,
      status: OrderStatus.PENDING,
      paymentProvider: 'stripe',
      feesCents: processingFeesCents,
    });

    const savedOrder = await order.save();

    // Reserve tickets (increment sold count)
    for (const item of createOrderDto.items) {
      await this.ticketTypesService.incrementSoldCount(item.ticketTypeId.toString(), item.qty);
    }

    // Clear cart if sessionId provided
    if (sessionId) {
      await this.cartService.clearCart(sessionId);
    }

    return savedOrder;
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate('items.ticketTypeId')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async findByUserId(userId: string, page: number = 1, limit: number = 10) {
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

  async findByEmail(email: string, page: number = 1, limit: number = 10) {
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

  async updateStatus(id: string, status: OrderStatus, paymentIntentId?: string): Promise<Order> {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = status;
    if (paymentIntentId) {
      order.paymentIntentId = paymentIntentId;
    }

    return order.save();
  }

  async cancelOrder(id: string, userId?: string): Promise<Order> {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if user can cancel this order
    if (userId && order.userId && order.userId.toString() !== userId) {
      throw new BadRequestException('You can only cancel your own orders');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    // Release reserved tickets
    for (const item of order.items) {
      await this.ticketTypesService.decrementSoldCount(item.ticketTypeId.toString(), item.qty);
    }

    order.status = OrderStatus.CANCELLED;
    return order.save();
  }

  async getOrderStats(eventId?: string) {
    const filter = eventId ? { 'items.ticketTypeId': { $in: await this.getTicketTypesByEvent(eventId) } } : {};
    
    const stats = await this.orderModel.aggregate([
      { $match: { ...filter, status: OrderStatus.PAID } },
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

  private async getTicketTypesByEvent(eventId: string): Promise<string[]> {
    const ticketTypes = await this.ticketTypeModel.find({ eventId }).select('_id');
    return ticketTypes.map(tt => tt._id.toString());
  }
}
