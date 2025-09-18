import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TicketType, TicketTypeDocument } from '../schemas/ticket-type.schema';
import { Event, EventDocument } from '../schemas/event.schema';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';

@Injectable()
export class TicketTypesService {
  constructor(
    @InjectModel(TicketType.name) private ticketTypeModel: Model<TicketTypeDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async create(createTicketTypeDto: CreateTicketTypeDto, eventId: string, userId: string): Promise<TicketType> {
    // Verify event exists and user is the organizer
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId.toString() !== userId) {
      throw new ForbiddenException('You can only create ticket types for your own events');
    }

    // Validate sales dates
    const salesStart = new Date(createTicketTypeDto.salesStart);
    const salesEnd = new Date(createTicketTypeDto.salesEnd);
    const eventStart = new Date(event.startAt);

    if (salesStart >= salesEnd) {
      throw new BadRequestException('Sales end date must be after sales start date');
    }

    if (salesEnd > eventStart) {
      throw new BadRequestException('Sales end date cannot be after event start date');
    }

    if (salesStart < new Date()) {
      throw new BadRequestException('Sales start date cannot be in the past');
    }

    const ticketType = new this.ticketTypeModel({
      ...createTicketTypeDto,
      eventId,
      salesStart,
      salesEnd,
    });

    return ticketType.save();
  }

  async findByEventId(eventId: string): Promise<TicketType[]> {
    return this.ticketTypeModel
      .find({ eventId })
      .sort({ priceCents: 1 })
      .exec();
  }

  async findOne(id: string): Promise<TicketType> {
    const ticketType = await this.ticketTypeModel.findById(id);
    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }
    return ticketType;
  }

  async update(id: string, updateTicketTypeDto: UpdateTicketTypeDto, userId: string): Promise<TicketType> {
    const ticketType = await this.ticketTypeModel.findById(id);
    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    // Verify user is the event organizer
    const event = await this.eventModel.findById(ticketType.eventId);
    if (!event || event.organizerId.toString() !== userId) {
      throw new ForbiddenException('You can only update ticket types for your own events');
    }

    // Validate sales dates if provided
    if (updateTicketTypeDto.salesStart || updateTicketTypeDto.salesEnd) {
      const salesStart = updateTicketTypeDto.salesStart ? new Date(updateTicketTypeDto.salesStart) : ticketType.salesStart;
      const salesEnd = updateTicketTypeDto.salesEnd ? new Date(updateTicketTypeDto.salesEnd) : ticketType.salesEnd;
      const eventStart = new Date(event.startAt);

      if (salesStart >= salesEnd) {
        throw new BadRequestException('Sales end date must be after sales start date');
      }

      if (salesEnd > eventStart) {
        throw new BadRequestException('Sales end date cannot be after event start date');
      }
    }

    Object.assign(ticketType, updateTicketTypeDto);
    return ticketType.save();
  }

  async remove(id: string, userId: string): Promise<void> {
    const ticketType = await this.ticketTypeModel.findById(id);
    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    // Verify user is the event organizer
    const event = await this.eventModel.findById(ticketType.eventId);
    if (!event || event.organizerId.toString() !== userId) {
      throw new ForbiddenException('You can only delete ticket types for your own events');
    }

    // Check if tickets have been sold
    if (ticketType.soldCount > 0) {
      throw new BadRequestException('Cannot delete ticket type with sold tickets');
    }

    await this.ticketTypeModel.findByIdAndDelete(id);
  }

  async getAvailableCapacity(id: string): Promise<number> {
    const ticketType = await this.findOne(id);
    return ticketType.capacity - ticketType.soldCount;
  }

  async incrementSoldCount(id: string, quantity: number): Promise<void> {
    const ticketType = await this.ticketTypeModel.findById(id);
    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    if (ticketType.soldCount + quantity > ticketType.capacity) {
      throw new BadRequestException('Not enough tickets available');
    }

    ticketType.soldCount += quantity;
    await ticketType.save();
  }

  async decrementSoldCount(id: string, quantity: number): Promise<void> {
    const ticketType = await this.ticketTypeModel.findById(id);
    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    ticketType.soldCount = Math.max(0, ticketType.soldCount - quantity);
    await ticketType.save();
  }

  async isOnSale(id: string): Promise<boolean> {
    const ticketType = await this.findOne(id);
    const now = new Date();
    return now >= ticketType.salesStart && now <= ticketType.salesEnd;
  }
}
