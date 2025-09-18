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
exports.TicketTypesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const ticket_type_schema_1 = require("../schemas/ticket-type.schema");
const event_schema_1 = require("../schemas/event.schema");
let TicketTypesService = class TicketTypesService {
    constructor(ticketTypeModel, eventModel) {
        this.ticketTypeModel = ticketTypeModel;
        this.eventModel = eventModel;
    }
    async create(createTicketTypeDto, eventId, userId) {
        const event = await this.eventModel.findById(eventId);
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.organizerId.toString() !== userId) {
            throw new common_1.ForbiddenException('You can only create ticket types for your own events');
        }
        const salesStart = new Date(createTicketTypeDto.salesStart);
        const salesEnd = new Date(createTicketTypeDto.salesEnd);
        const eventStart = new Date(event.startAt);
        if (salesStart >= salesEnd) {
            throw new common_1.BadRequestException('Sales end date must be after sales start date');
        }
        if (salesEnd > eventStart) {
            throw new common_1.BadRequestException('Sales end date cannot be after event start date');
        }
        if (salesStart < new Date()) {
            throw new common_1.BadRequestException('Sales start date cannot be in the past');
        }
        const ticketType = new this.ticketTypeModel({
            ...createTicketTypeDto,
            eventId,
            salesStart,
            salesEnd,
        });
        return ticketType.save();
    }
    async findByEventId(eventId) {
        return this.ticketTypeModel
            .find({ eventId })
            .sort({ priceCents: 1 })
            .exec();
    }
    async findOne(id) {
        const ticketType = await this.ticketTypeModel.findById(id);
        if (!ticketType) {
            throw new common_1.NotFoundException('Ticket type not found');
        }
        return ticketType;
    }
    async update(id, updateTicketTypeDto, userId) {
        const ticketType = await this.ticketTypeModel.findById(id);
        if (!ticketType) {
            throw new common_1.NotFoundException('Ticket type not found');
        }
        const event = await this.eventModel.findById(ticketType.eventId);
        if (!event || event.organizerId.toString() !== userId) {
            throw new common_1.ForbiddenException('You can only update ticket types for your own events');
        }
        if (updateTicketTypeDto.salesStart || updateTicketTypeDto.salesEnd) {
            const salesStart = updateTicketTypeDto.salesStart ? new Date(updateTicketTypeDto.salesStart) : ticketType.salesStart;
            const salesEnd = updateTicketTypeDto.salesEnd ? new Date(updateTicketTypeDto.salesEnd) : ticketType.salesEnd;
            const eventStart = new Date(event.startAt);
            if (salesStart >= salesEnd) {
                throw new common_1.BadRequestException('Sales end date must be after sales start date');
            }
            if (salesEnd > eventStart) {
                throw new common_1.BadRequestException('Sales end date cannot be after event start date');
            }
        }
        Object.assign(ticketType, updateTicketTypeDto);
        return ticketType.save();
    }
    async remove(id, userId) {
        const ticketType = await this.ticketTypeModel.findById(id);
        if (!ticketType) {
            throw new common_1.NotFoundException('Ticket type not found');
        }
        const event = await this.eventModel.findById(ticketType.eventId);
        if (!event || event.organizerId.toString() !== userId) {
            throw new common_1.ForbiddenException('You can only delete ticket types for your own events');
        }
        if (ticketType.soldCount > 0) {
            throw new common_1.BadRequestException('Cannot delete ticket type with sold tickets');
        }
        await this.ticketTypeModel.findByIdAndDelete(id);
    }
    async getAvailableCapacity(id) {
        const ticketType = await this.findOne(id);
        return ticketType.capacity - ticketType.soldCount;
    }
    async incrementSoldCount(id, quantity) {
        const ticketType = await this.ticketTypeModel.findById(id);
        if (!ticketType) {
            throw new common_1.NotFoundException('Ticket type not found');
        }
        if (ticketType.soldCount + quantity > ticketType.capacity) {
            throw new common_1.BadRequestException('Not enough tickets available');
        }
        ticketType.soldCount += quantity;
        await ticketType.save();
    }
    async decrementSoldCount(id, quantity) {
        const ticketType = await this.ticketTypeModel.findById(id);
        if (!ticketType) {
            throw new common_1.NotFoundException('Ticket type not found');
        }
        ticketType.soldCount = Math.max(0, ticketType.soldCount - quantity);
        await ticketType.save();
    }
    async isOnSale(id) {
        const ticketType = await this.findOne(id);
        const now = new Date();
        return now >= ticketType.salesStart && now <= ticketType.salesEnd;
    }
};
exports.TicketTypesService = TicketTypesService;
exports.TicketTypesService = TicketTypesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(ticket_type_schema_1.TicketType.name)),
    __param(1, (0, mongoose_1.InjectModel)(event_schema_1.Event.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], TicketTypesService);
//# sourceMappingURL=ticket-types.service.js.map