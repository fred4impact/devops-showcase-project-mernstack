import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { TicketTypesModule } from './ticket-types/ticket-types.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { TicketsModule } from './tickets/tickets.module';
import { RedisModule } from './redis/redis.module';
import { StripeModule } from './stripe/stripe.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { SeatingPlanModule } from './seating-plan/seating-plan.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/ticketnow'),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    PassportModule,
    RedisModule,
    StripeModule,
    AuthModule,
    UsersModule,
    EventsModule,
    TicketTypesModule,
    CartModule,
    OrdersModule,
    TicketsModule,
    WebhooksModule,
    SeatingPlanModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}