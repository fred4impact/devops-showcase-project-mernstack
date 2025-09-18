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
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const ticket_schema_1 = require("../schemas/ticket.schema");
const order_schema_1 = require("../schemas/order.schema");
const event_schema_1 = require("../schemas/event.schema");
const user_schema_1 = require("../schemas/user.schema");
const email_service_1 = require("../email/email.service");
let TicketsService = class TicketsService {
    constructor(ticketModel, orderModel, eventModel, userModel, emailService) {
        this.ticketModel = ticketModel;
        this.orderModel = orderModel;
        this.eventModel = eventModel;
        this.userModel = userModel;
        this.emailService = emailService;
    }
    async findByUserId(userId, page = 1, limit = 10, status) {
        const skip = (page - 1) * limit;
        const query = { orderId: { $in: await this.getUserOrderIds(userId) } };
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
    async findOne(ticketId, userId) {
        const ticket = await this.ticketModel
            .findById(ticketId)
            .populate('orderId', 'totalAmount status createdAt userId')
            .populate('eventId', 'title startAt venue description')
            .populate('ticketTypeId', 'name priceCents description')
            .exec();
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        const order = await this.orderModel.findById(ticket.orderId);
        if (order.userId.toString() !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return ticket;
    }
    async transferTicket(ticketId, transferDto, userId) {
        const ticket = await this.findOne(ticketId, userId);
        if (ticket.status !== ticket_schema_1.TicketStatus.ISSUED) {
            throw new common_1.BadRequestException('Only active tickets can be transferred');
        }
        const recipient = await this.userModel.findOne({ email: transferDto.recipientEmail });
        if (!recipient) {
            throw new common_1.BadRequestException('Recipient not found');
        }
        const order = await this.orderModel.findById(ticket.orderId);
        order.userId = recipient._id;
        await order.save();
        await this.emailService.sendTicketTransferNotification(transferDto.recipientEmail, ticket, transferDto.message);
        return { message: 'Ticket transferred successfully' };
    }
    async updateStatus(ticketId, status, userId) {
        const ticket = await this.findOne(ticketId, userId);
        if (!Object.values(ticket_schema_1.TicketStatus).includes(status)) {
            throw new common_1.BadRequestException('Invalid ticket status');
        }
        ticket.status = status;
        if (status === ticket_schema_1.TicketStatus.USED) {
            ticket.usedAt = new Date();
        }
        await ticket.save();
        return { message: 'Ticket status updated successfully' };
    }
    async requestRefund(ticketId, refundDto, userId) {
        const ticket = await this.findOne(ticketId, userId);
        if (ticket.status === ticket_schema_1.TicketStatus.USED) {
            throw new common_1.BadRequestException('Used tickets cannot be refunded');
        }
        if (ticket.status === ticket_schema_1.TicketStatus.REFUNDED) {
            throw new common_1.BadRequestException('Ticket already refunded');
        }
        const ticketType = await this.ticketModel.findById(ticket.ticketTypeId);
        if (!ticketType) {
            throw new common_1.NotFoundException('Ticket type not found');
        }
        const refundRequest = {
            ticketId: ticket._id,
            userId,
            reason: refundDto.reason,
            description: refundDto.description,
            status: 'pending',
            requestedAt: new Date()
        };
        const event = await this.eventModel.findById(ticket.eventId);
        if (event) {
            await this.emailService.sendRefundRequestNotification(event.organizerId.toString(), ticket, refundRequest);
        }
        return { message: 'Refund request submitted successfully' };
    }
    async getQRCode(ticketId, userId) {
        const ticket = await this.findOne(ticketId, userId);
        return { qrCode: ticket.qrPayload, ticketUUID: ticket.ticketUUID };
    }
    async getPDF(ticketId, userId) {
        const ticket = await this.findOne(ticketId, userId);
        if (!ticket.pdfUrl) {
            throw new common_1.NotFoundException('PDF not available for this ticket');
        }
        return { pdfUrl: ticket.pdfUrl };
    }
    async getEventAttendees(eventId, userId) {
        const event = await this.eventModel.findById(eventId);
        if (!event || event.organizerId.toString() !== userId.toString()) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const tickets = await this.ticketModel
            .find({ eventId })
            .populate('orderId', 'userId totalAmount status')
            .populate('ticketTypeId', 'name priceCents')
            .exec();
        return tickets;
    }
    async getUserOrderIds(userId) {
        const orders = await this.orderModel.find({ userId }).select('_id');
        return orders.map(order => order._id);
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(ticket_schema_1.Ticket.name)),
    __param(1, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(2, (0, mongoose_1.InjectModel)(event_schema_1.Event.name)),
    __param(3, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        email_service_1.EmailService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map