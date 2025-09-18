import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event, EventSchema } from '../schemas/event.schema';
import { TicketType, TicketTypeSchema } from '../schemas/ticket-type.schema';
import { S3Service } from '../s3/s3.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: TicketType.name, schema: TicketTypeSchema }
    ])
  ],
  controllers: [EventsController],
  providers: [EventsService, S3Service],
  exports: [EventsService],
})
export class EventsModule {}
