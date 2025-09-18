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
exports.CreateEventDto = exports.SeatmapDto = exports.SeatDto = exports.VenueDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const event_schema_1 = require("../../schemas/event.schema");
class VenueDto {
}
exports.VenueDto = VenueDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Madison Square Garden' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], VenueDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '4 Pennsylvania Plaza, New York, NY 10001' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], VenueDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 20000 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VenueDto.prototype, "capacity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'America/New_York' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VenueDto.prototype, "timezone", void 0);
class SeatDto {
}
exports.SeatDto = SeatDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'A-1' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SeatDto.prototype, "seatId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'A' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SeatDto.prototype, "section", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'A' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SeatDto.prototype, "row", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SeatDto.prototype, "number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SeatDto.prototype, "priceModifier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Boolean)
], SeatDto.prototype, "accessible", void 0);
class SeatmapDto {
}
exports.SeatmapDto = SeatmapDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: event_schema_1.SeatmapType, example: event_schema_1.SeatmapType.GA }),
    (0, class_validator_1.IsEnum)(event_schema_1.SeatmapType),
    __metadata("design:type", String)
], SeatmapDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SeatmapDto.prototype, "svg", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [SeatDto], required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SeatDto),
    __metadata("design:type", Array)
], SeatmapDto.prototype, "seats", void 0);
class CreateEventDto {
}
exports.CreateEventDto = CreateEventDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Summer Music Festival 2024' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateEventDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'summer-music-festival-2024' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateEventDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Join us for the biggest music festival of the year!' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(20),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateEventDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Music' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateEventDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: VenueDto }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => VenueDto),
    __metadata("design:type", VenueDto)
], CreateEventDto.prototype, "venue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-07-15T18:00:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "startAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-07-15T23:00:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "endAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: event_schema_1.EventStatus, example: event_schema_1.EventStatus.DRAFT, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(event_schema_1.EventStatus),
    __metadata("design:type", String)
], CreateEventDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateEventDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: SeatmapDto, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SeatmapDto),
    __metadata("design:type", SeatmapDto)
], CreateEventDto.prototype, "seatmap", void 0);
//# sourceMappingURL=create-event.dto.js.map