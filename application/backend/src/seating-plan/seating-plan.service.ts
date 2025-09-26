import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from '../schemas/event.schema';
import { SeatLock, SeatLockDocument } from '../schemas/seat-lock.schema';
import { Ticket, TicketDocument } from '../schemas/ticket.schema';
import { Order, OrderDocument } from '../schemas/order.schema';

@Injectable()
export class SeatingPlanService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(SeatLock.name) private seatLockModel: Model<SeatLockDocument>,
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async getSeatmap(eventId: string) {
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!event.seatmap) {
      throw new BadRequestException('Event does not have a seatmap');
    }

    // Get all locked seats
    const lockedSeats = await this.getLockedSeats(eventId);
    
    // Get all sold seats
    const soldSeats = await this.getSoldSeats(eventId);

    // Enhance seats with status information
    const enhancedSeats = event.seatmap.seats.map(seat => ({
      ...seat,
      status: this.getSeatStatus(seat.seatId, lockedSeats, soldSeats),
    }));

    return {
      ...event.seatmap,
      seats: enhancedSeats,
    };
  }

  async lockSeat(eventId: string, seatId: string, sessionId: string, userId?: string, duration: number = 300) {
    // Check if seat is already locked or sold
    const isAvailable = await this.isSeatAvailable(eventId, seatId);
    if (!isAvailable) {
      throw new BadRequestException('Seat is not available');
    }

    // Remove any existing locks for this seat
    await this.seatLockModel.deleteMany({ eventId, seatId });

    // Create new lock
    const lock = new this.seatLockModel({
      eventId,
      seatId,
      sessionId,
      userId,
      expiresAt: new Date(Date.now() + duration * 1000),
    });

    return lock.save();
  }

  async unlockSeat(eventId: string, seatId: string, sessionId: string) {
    return this.seatLockModel.deleteOne({ eventId, seatId, sessionId });
  }

  async unlockSeatsBySession(eventId: string, sessionId: string) {
    return this.seatLockModel.deleteMany({ eventId, sessionId });
  }

  async isSeatAvailable(eventId: string, seatId: string): Promise<boolean> {
    const [lockedSeats, soldSeats] = await Promise.all([
      this.getLockedSeats(eventId),
      this.getSoldSeats(eventId),
    ]);

    return !lockedSeats.includes(seatId) && !soldSeats.includes(seatId);
  }

  async getSeatAvailability(eventId: string) {
    const [lockedSeats, soldSeats] = await Promise.all([
      this.getLockedSeats(eventId),
      this.getSoldSeats(eventId),
    ]);

    return {
      locked: lockedSeats,
      sold: soldSeats,
    };
  }

  async createSeatingPlan(eventId: string, seatingPlanData: any) {
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    event.seatmap = seatingPlanData;
    return event.save();
  }

  async updateSeatingPlan(eventId: string, updates: any) {
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!event.seatmap) {
      throw new BadRequestException('Event does not have a seatmap');
    }

    Object.assign(event.seatmap, updates);
    return event.save();
  }

  async deleteSeatingPlan(eventId: string) {
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    event.seatmap = undefined;
    return event.save();
  }

  private async getLockedSeats(eventId: string): Promise<string[]> {
    const locks = await this.seatLockModel.find({ eventId });
    return locks.map(lock => lock.seatId);
  }

  private async getSoldSeats(eventId: string): Promise<string[]> {
    const tickets = await this.ticketModel.find({ 
      eventId, 
      status: { $in: ['issued', 'used'] },
      seatId: { $exists: true, $ne: null }
    });
    return tickets.map(ticket => ticket.seatId).filter(Boolean);
  }

  private getSeatStatus(seatId: string, lockedSeats: string[], soldSeats: string[]): string {
    if (soldSeats.includes(seatId)) return 'sold';
    if (lockedSeats.includes(seatId)) return 'locked';
    return 'available';
  }

  async cleanupExpiredLocks() {
    return this.seatLockModel.deleteMany({ 
      expiresAt: { $lt: new Date() } 
    });
  }
}
