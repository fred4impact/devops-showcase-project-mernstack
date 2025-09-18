import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderSchema } from '../schemas/order.schema';
import { TicketType, TicketTypeSchema } from '../schemas/ticket-type.schema';
import { CartModule } from '../cart/cart.module';
import { TicketTypesModule } from '../ticket-types/ticket-types.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: TicketType.name, schema: TicketTypeSchema }
    ]),
    CartModule,
    TicketTypesModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
