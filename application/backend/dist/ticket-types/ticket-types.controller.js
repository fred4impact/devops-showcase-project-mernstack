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
exports.TicketTypesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ticket_types_service_1 = require("./ticket-types.service");
const create_ticket_type_dto_1 = require("./dto/create-ticket-type.dto");
const update_ticket_type_dto_1 = require("./dto/update-ticket-type.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let TicketTypesController = class TicketTypesController {
    constructor(ticketTypesService) {
        this.ticketTypesService = ticketTypesService;
    }
    async createTicketType(eventId, createTicketTypeDto, req) {
        return this.ticketTypesService.create(createTicketTypeDto, eventId, req.user.id);
    }
    async getTicketTypesByEvent(eventId) {
        return this.ticketTypesService.findByEventId(eventId);
    }
    async getTicketType(id) {
        return this.ticketTypesService.findOne(id);
    }
    async getAvailability(id) {
        const capacity = await this.ticketTypesService.getAvailableCapacity(id);
        return { availableCapacity: capacity };
    }
    async getOnSaleStatus(id) {
        const isOnSale = await this.ticketTypesService.isOnSale(id);
        return { isOnSale };
    }
    async updateTicketType(id, updateTicketTypeDto, req) {
        return this.ticketTypesService.update(id, updateTicketTypeDto, req.user.id);
    }
    async deleteTicketType(id, req) {
        await this.ticketTypesService.remove(id, req.user.id);
        return { message: 'Ticket type deleted successfully' };
    }
};
exports.TicketTypesController = TicketTypesController;
__decorate([
    (0, common_1.Post)('event/:eventId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create ticket type for an event' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Ticket type created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_ticket_type_dto_1.CreateTicketTypeDto, Object]),
    __metadata("design:returntype", Promise)
], TicketTypesController.prototype, "createTicketType", null);
__decorate([
    (0, common_1.Get)('event/:eventId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get ticket types for an event' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket types retrieved successfully' }),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketTypesController.prototype, "getTicketTypesByEvent", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get ticket type by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket type retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ticket type not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketTypesController.prototype, "getTicketType", null);
__decorate([
    (0, common_1.Get)(':id/availability'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available capacity for ticket type' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Availability retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketTypesController.prototype, "getAvailability", null);
__decorate([
    (0, common_1.Get)(':id/on-sale'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if ticket type is on sale' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sale status retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketTypesController.prototype, "getOnSaleStatus", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update ticket type' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket type updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ticket type not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_ticket_type_dto_1.UpdateTicketTypeDto, Object]),
    __metadata("design:returntype", Promise)
], TicketTypesController.prototype, "updateTicketType", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete ticket type' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket type deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ticket type not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TicketTypesController.prototype, "deleteTicketType", null);
exports.TicketTypesController = TicketTypesController = __decorate([
    (0, swagger_1.ApiTags)('Ticket Types'),
    (0, common_1.Controller)('ticket-types'),
    __metadata("design:paramtypes", [ticket_types_service_1.TicketTypesService])
], TicketTypesController);
//# sourceMappingURL=ticket-types.controller.js.map