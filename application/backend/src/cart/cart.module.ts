import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { RedisModule } from '../redis/redis.module';
import { TicketTypesModule } from '../ticket-types/ticket-types.module';

@Module({
  imports: [RedisModule, TicketTypesModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
