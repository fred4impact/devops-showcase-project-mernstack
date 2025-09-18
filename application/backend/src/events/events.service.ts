import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument, EventStatus } from '../schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto } from './dto/event-query.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async create(createEventDto: CreateEventDto, organizerId: string): Promise<Event> {
    // Check if slug already exists
    const existingEvent = await this.eventModel.findOne({ slug: createEventDto.slug });
    if (existingEvent) {
      throw new BadRequestException('Event with this slug already exists');
    }

    // Validate dates
    const startAt = new Date(createEventDto.startAt);
    const endAt = new Date(createEventDto.endAt);
    
    if (startAt >= endAt) {
      throw new BadRequestException('End date must be after start date');
    }

    if (startAt < new Date()) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    const event = new this.eventModel({
      ...createEventDto,
      organizerId,
      startAt,
      endAt,
      status: createEventDto.status || EventStatus.DRAFT,
    });

    return event.save();
  }

  async findAll(query: EventQueryDto = {}) {
    const {
      category,
      startDate,
      endDate,
      location,
      status = EventStatus.PUBLISHED,
      page = '1',
      limit = '10'
    } = query;

    const filter: any = { status };

    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    if (startDate || endDate) {
      filter.startAt = {};
      if (startDate) filter.startAt.$gte = new Date(startDate);
      if (endDate) filter.startAt.$lte = new Date(endDate);
    }

    if (location) {
      filter['venue.address'] = { $regex: location, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [events, total] = await Promise.all([
      this.eventModel
        .find(filter)
        .populate('organizerId', 'name email')
        .sort({ startAt: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .exec(),
      this.eventModel.countDocuments(filter)
    ]);

    return {
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventModel
      .findById(id)
      .populate('organizerId', 'name email')
      .exec();

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async findBySlug(slug: string): Promise<Event> {
    const event = await this.eventModel
      .findOne({ slug, status: EventStatus.PUBLISHED })
      .populate('organizerId', 'name email')
      .exec();

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto, userId: string): Promise<Event> {
    const event = await this.eventModel.findById(id);
    
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if user is the organizer
    if (event.organizerId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own events');
    }

    // Validate dates if provided
    if (updateEventDto.startAt || updateEventDto.endAt) {
      const startAt = updateEventDto.startAt ? new Date(updateEventDto.startAt) : event.startAt;
      const endAt = updateEventDto.endAt ? new Date(updateEventDto.endAt) : event.endAt;
      
      if (startAt >= endAt) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // Check slug uniqueness if changing slug
    if (updateEventDto.slug && updateEventDto.slug !== event.slug) {
      const existingEvent = await this.eventModel.findOne({ 
        slug: updateEventDto.slug,
        _id: { $ne: id }
      });
      if (existingEvent) {
        throw new BadRequestException('Event with this slug already exists');
      }
    }

    Object.assign(event, updateEventDto);
    return event.save();
  }

  async remove(id: string, userId: string): Promise<void> {
    const event = await this.eventModel.findById(id);
    
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if user is the organizer
    if (event.organizerId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own events');
    }

    await this.eventModel.findByIdAndDelete(id);
  }

  async publish(id: string, userId: string): Promise<Event> {
    const event = await this.eventModel.findById(id);
    
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId.toString() !== userId) {
      throw new ForbiddenException('You can only publish your own events');
    }

    event.status = EventStatus.PUBLISHED;
    return event.save();
  }

  async getOrganizerEvents(organizerId: string, query: EventQueryDto = {}) {
    const { page = '1', limit = '10' } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { organizerId };

    const [events, total] = await Promise.all([
      this.eventModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .exec(),
      this.eventModel.countDocuments(filter)
    ]);

    return {
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async duplicate(eventId: string, organizerId: string): Promise<Event> {
    const originalEvent = await this.eventModel.findById(eventId);
    if (!originalEvent) {
      throw new NotFoundException('Event not found');
    }

    if (originalEvent.organizerId.toString() !== organizerId) {
      throw new ForbiddenException('Access denied');
    }

    // Create a copy of the event with modified fields
    const duplicatedEvent = new this.eventModel({
      ...originalEvent.toObject(),
      _id: undefined,
      title: `${originalEvent.title} (Copy)`,
      slug: `${originalEvent.slug}-copy-${Date.now()}`,
      status: EventStatus.DRAFT,
      startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return duplicatedEvent.save();
  }
}
