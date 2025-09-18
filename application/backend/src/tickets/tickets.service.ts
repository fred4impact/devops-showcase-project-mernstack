import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ticket, TicketDocument, TicketStatus } from '../schemas/ticket.schema';
import { Order, OrderDocument } from '../schemas/order.schema';
import { Event, EventDocument } from '../schemas/event.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { TransferTicketDto } from './dto/transfer-ticket.dto';
import { RefundTicketDto, RefundReason } from './dto/refund-ticket.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private emailService: EmailService,
  ) {}

  async findByUserId(userId: string, page: number = 1, limit: number = 10, status?: string) {
    const skip = (page - 1) * limit;
    const query: any = { orderId: { $in: await this.getUserOrderIds(userId) } };
    
    if (status) {
      query.status = status;
    }

    const [tickets, total] = await Promise.all([
      this.ticketModel
        .find(query)
        .populate('orderId', 'totalAmount status createdAt')
        .populate('eventId', 'title startAt venue')
        .populate('ticketTypeId', 'name priceCents')
        .sort({ issuedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.ticketModel.countDocuments(query)
    ]);

    return {
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(ticketId: string, userId: string) {
    const ticket = await this.ticketModel
      .findById(ticketId)
      .populate('orderId', 'totalAmount status createdAt userId')
      .populate('eventId', 'title startAt venue description')
      .populate('ticketTypeId', 'name priceCents description')
      .exec();

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Check if user owns this ticket
    const order = await this.orderModel.findById(ticket.orderId);
    if (order.userId.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return ticket;
  }

  async transferTicket(ticketId: string, transferDto: TransferTicketDto, userId: string) {
    const ticket = await this.findOne(ticketId, userId);

    if (ticket.status !== TicketStatus.ISSUED) {
      throw new BadRequestException('Only active tickets can be transferred');
    }

    // Check if recipient exists
    const recipient = await this.userModel.findOne({ email: transferDto.recipientEmail });
    if (!recipient) {
      throw new BadRequestException('Recipient not found');
    }

    // Update ticket ownership
    const order = await this.orderModel.findById(ticket.orderId);
    order.userId = recipient._id as Types.ObjectId;
    await order.save();

    // Send transfer notification
    await this.emailService.sendTicketTransferNotification(
      transferDto.recipientEmail,
      ticket,
      transferDto.message
    );

    return { message: 'Ticket transferred successfully' };
  }

  async updateStatus(ticketId: string, status: string, userId: string) {
    const ticket = await this.findOne(ticketId, userId);

    if (!Object.values(TicketStatus).includes(status as TicketStatus)) {
      throw new BadRequestException('Invalid ticket status');
    }

    ticket.status = status as TicketStatus;
    if (status === TicketStatus.USED) {
      ticket.usedAt = new Date();
    }

    await ticket.save();
    return { message: 'Ticket status updated successfully' };
  }

  async requestRefund(ticketId: string, refundDto: RefundTicketDto, userId: string) {
    const ticket = await this.findOne(ticketId, userId);

    if (ticket.status === TicketStatus.USED) {
      throw new BadRequestException('Used tickets cannot be refunded');
    }

    if (ticket.status === TicketStatus.REFUNDED) {
      throw new BadRequestException('Ticket already refunded');
    }

    // Check if ticket type is refundable
    const ticketType = await this.ticketModel.findById(ticket.ticketTypeId);
    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    // Create refund request (you might want to create a separate RefundRequest model)
    const refundRequest = {
      ticketId: ticket._id,
      userId,
      reason: refundDto.reason,
      description: refundDto.description,
      status: 'pending',
      requestedAt: new Date()
    };

    // Send refund request notification to organizers
    const event = await this.eventModel.findById(ticket.eventId);
    if (event) {
      await this.emailService.sendRefundRequestNotification(
        event.organizerId.toString(),
        ticket,
        refundRequest
      );
    }

    return { message: 'Refund request submitted successfully' };
  }

  async getQRCode(ticketId: string, userId: string) {
    const ticket = await this.findOne(ticketId, userId);
    return { qrCode: ticket.qrPayload, ticketUUID: ticket.ticketUUID };
  }

  async getPDF(ticketId: string, userId: string) {
    const ticket = await this.findOne(ticketId, userId);
    
    if (!ticket.pdfUrl) {
      throw new NotFoundException('PDF not available for this ticket');
    }

    return { pdfUrl: ticket.pdfUrl };
  }

  async getEventAttendees(eventId: string, userId: string) {
    // Check if user is organizer of this event
    const event = await this.eventModel.findById(eventId);
    if (!event || event.organizerId.toString() !== userId.toString()) {
      throw new ForbiddenException('Access denied');
    }

    const tickets = await this.ticketModel
      .find({ eventId })
      .populate('orderId', 'userId totalAmount status')
      .populate('ticketTypeId', 'name priceCents')
      .exec();

    return tickets;
  }

  private async getUserOrderIds(userId: string) {
    const orders = await this.orderModel.find({ userId }).select('_id');
    return orders.map(order => order._id);
  }
}
