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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSchema = exports.Event = exports.Seatmap = exports.Seat = exports.Venue = exports.SeatmapType = exports.EventStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var EventStatus;
(function (EventStatus) {
    EventStatus["DRAFT"] = "draft";
    EventStatus["PUBLISHED"] = "published";
    EventStatus["CANCELLED"] = "cancelled";
})(EventStatus || (exports.EventStatus = EventStatus = {}));
var SeatmapType;
(function (SeatmapType) {
    SeatmapType["RESERVED"] = "reserved";
    SeatmapType["GA"] = "ga";
})(SeatmapType || (exports.SeatmapType = SeatmapType = {}));
let Venue = class Venue {
};
exports.Venue = Venue;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Venue.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Venue.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Venue.prototype, "capacity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Venue.prototype, "timezone", void 0);
exports.Venue = Venue = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], Venue);
let Seat = class Seat {
};
exports.Seat = Seat;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Seat.prototype, "seatId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Seat.prototype, "section", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Seat.prototype, "row", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Seat.prototype, "number", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Seat.prototype, "priceModifier", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Seat.prototype, "accessible", void 0);
exports.Seat = Seat = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], Seat);
let Seatmap = class Seatmap {
};
exports.Seatmap = Seatmap;
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: Object.values(SeatmapType),
        default: SeatmapType.GA
    }),
    __metadata("design:type", String)
], Seatmap.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Seatmap.prototype, "svg", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Seat] }),
    __metadata("design:type", Array)
], Seatmap.prototype, "seats", void 0);
exports.Seatmap = Seatmap = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], Seatmap);
let Event = class Event {
};
exports.Event = Event;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Event.prototype, "organizerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Event.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, trim: true }),
    __metadata("design:type", String)
], Event.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Event.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Event.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Venue, required: true }),
    __metadata("design:type", Venue)
], Event.prototype, "venue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Event.prototype, "startAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Event.prototype, "endAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: Object.values(EventStatus),
        default: EventStatus.DRAFT
    }),
    __metadata("design:type", String)
], Event.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], Event.prototype, "images", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Seatmap }),
    __metadata("design:type", Seatmap)
], Event.prototype, "seatmap", void 0);
exports.Event = Event = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Event);
exports.EventSchema = mongoose_1.SchemaFactory.createForClass(Event);
//# sourceMappingURL=event.schema.js.map