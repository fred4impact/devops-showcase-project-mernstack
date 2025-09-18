"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const events_controller_1 = require("./events.controller");
const events_service_1 = require("./events.service");
const event_schema_1 = require("../schemas/event.schema");
const ticket_type_schema_1 = require("../schemas/ticket-type.schema");
const s3_service_1 = require("../s3/s3.service");
let EventsModule = class EventsModule {
};
exports.EventsModule = EventsModule;
exports.EventsModule = EventsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: event_schema_1.Event.name, schema: event_schema_1.EventSchema },
                { name: ticket_type_schema_1.TicketType.name, schema: ticket_type_schema_1.TicketTypeSchema }
            ])
        ],
        controllers: [events_controller_1.EventsController],
        providers: [events_service_1.EventsService, s3_service_1.S3Service],
        exports: [events_service_1.EventsService],
    })
], EventsModule);
//# sourceMappingURL=events.module.js.map