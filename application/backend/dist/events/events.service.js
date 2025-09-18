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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const event_schema_1 = require("../schemas/event.schema");
let EventsService = class EventsService {
    constructor(eventModel) {
        this.eventModel = eventModel;
    }
    async create(createEventDto, organizerId) {
        const existingEvent = await this.eventModel.findOne({ slug: createEventDto.slug });
        if (existingEvent) {
            throw new common_1.BadRequestException('Event with this slug already exists');
        }
        const startAt = new Date(createEventDto.startAt);
        const endAt = new Date(createEventDto.endAt);
        if (startAt >= endAt) {
            throw new common_1.BadRequestException('End date must be after start date');
        }
        if (startAt < new Date()) {
            throw new common_1.BadRequestException('Start date cannot be in the past');
        }
        const event = new this.eventModel({
            ...createEventDto,
            organizerId,
            startAt,
            endAt,
            status: createEventDto.status || event_schema_1.EventStatus.DRAFT,
        });
        return event.save();
    }
    async findAll(query = {}) {
        const { category, startDate, endDate, location, status = event_schema_1.EventStatus.PUBLISHED, page = '1', limit = '10' } = query;
        const filter = { status };
        if (category) {
            filter.category = { $regex: category, $options: 'i' };
        }
        if (startDate || endDate) {
            filter.startAt = {};
            if (startDate)
                filter.startAt.$gte = new Date(startDate);
            if (endDate)
                filter.startAt.$lte = new Date(endDate);
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
    async findOne(id) {
        const event = await this.eventModel
            .findById(id)
            .populate('organizerId', 'name email')
            .exec();
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        return event;
    }
    async findBySlug(slug) {
        const event = await this.eventModel
            .findOne({ slug, status: event_schema_1.EventStatus.PUBLISHED })
            .populate('organizerId', 'name email')
            .exec();
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        return event;
    }
    async update(id, updateEventDto, userId) {
        const event = await this.eventModel.findById(id);
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.organizerId.toString() !== userId) {
            throw new common_1.ForbiddenException('You can only update your own events');
        }
        if (updateEventDto.startAt || updateEventDto.endAt) {
            const startAt = updateEventDto.startAt ? new Date(updateEventDto.startAt) : event.startAt;
            const endAt = updateEventDto.endAt ? new Date(updateEventDto.endAt) : event.endAt;
            if (startAt >= endAt) {
                throw new common_1.BadRequestException('End date must be after start date');
            }
        }
        if (updateEventDto.slug && updateEventDto.slug !== event.slug) {
            const existingEvent = await this.eventModel.findOne({
                slug: updateEventDto.slug,
                _id: { $ne: id }
            });
            if (existingEvent) {
                throw new common_1.BadRequestException('Event with this slug already exists');
            }
        }
        Object.assign(event, updateEventDto);
        return event.save();
    }
    async remove(id, userId) {
        const event = await this.eventModel.findById(id);
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.organizerId.toString() !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own events');
        }
        await this.eventModel.findByIdAndDelete(id);
    }
    async publish(id, userId) {
        const event = await this.eventModel.findById(id);
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.organizerId.toString() !== userId) {
            throw new common_1.ForbiddenException('You can only publish your own events');
        }
        event.status = event_schema_1.EventStatus.PUBLISHED;
        return event.save();
    }
    async getOrganizerEvents(organizerId, query = {}) {
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
    async duplicate(eventId, organizerId) {
        const originalEvent = await this.eventModel.findById(eventId);
        if (!originalEvent) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (originalEvent.organizerId.toString() !== organizerId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const duplicatedEvent = new this.eventModel({
            ...originalEvent.toObject(),
            _id: undefined,
            title: `${originalEvent.title} (Copy)`,
            slug: `${originalEvent.slug}-copy-${Date.now()}`,
            status: event_schema_1.EventStatus.DRAFT,
            startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return duplicatedEvent.save();
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(event_schema_1.Event.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], EventsService);
//# sourceMappingURL=events.service.js.map