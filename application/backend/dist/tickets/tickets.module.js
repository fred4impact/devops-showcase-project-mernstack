"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const tickets_controller_1 = require("./tickets.controller");
const tickets_service_1 = require("./tickets.service");
const ticket_schema_1 = require("../schemas/ticket.schema");
const order_schema_1 = require("../schemas/order.schema");
const event_schema_1 = require("../schemas/event.schema");
const user_schema_1 = require("../schemas/user.schema");
const email_module_1 = require("../email/email.module");
let TicketsModule = class TicketsModule {
};
exports.TicketsModule = TicketsModule;
exports.TicketsModule = TicketsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: ticket_schema_1.Ticket.name, schema: ticket_schema_1.TicketSchema },
                { name: order_schema_1.Order.name, schema: order_schema_1.OrderSchema },
                { name: event_schema_1.Event.name, schema: event_schema_1.EventSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
            email_module_1.EmailModule,
        ],
        controllers: [tickets_controller_1.TicketsController],
        providers: [tickets_service_1.TicketsService],
        exports: [tickets_service_1.TicketsService],
    })
], TicketsModule);
//# sourceMappingURL=tickets.module.js.map