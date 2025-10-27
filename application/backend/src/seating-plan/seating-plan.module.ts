import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeatingPlanController } from './seating-plan.controller';
import { SeatingPlanService } from './seating-plan.service';
import { Event, EventSchema } from '../schemas/event.schema';
import { SeatLock, SeatLockSchema } from '../schemas/seat-lock.schema';
import { Ticket, TicketSchema } from '../schemas/ticket.schema';
import { Order, OrderSchema } from '../schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: SeatLock.name, schema: SeatLockSchema },
      { name: Ticket.name, schema: TicketSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [SeatingPlanController],
  providers: [SeatingPlanService],
  exports: [SeatingPlanService],
})
export class SeatingPlanModule {}
