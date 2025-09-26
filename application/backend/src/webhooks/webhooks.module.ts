import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { StripeModule } from '../stripe/stripe.module';
import { OrdersModule } from '../orders/orders.module';
import { TicketsModule } from '../tickets/tickets.module';

@Module({
  imports: [StripeModule, OrdersModule, TicketsModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
