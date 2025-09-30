import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CeleryService } from './celery.service';

@Module({
  imports: [ConfigModule],
  providers: [CeleryService],
  exports: [CeleryService],
})
export class CeleryModule {}
