import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.client = new Redis(this.configService.get('REDIS_URL'));

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async lockSeat(eventId: string, seatId: string, sessionId: string, ttl: number = 600): Promise<boolean> {
    const key = `seat-lock:${eventId}:${seatId}`;
    const result = await this.client.set(key, sessionId, 'EX', ttl, 'NX');
    return result === 'OK';
  }

  async unlockSeat(eventId: string, seatId: string): Promise<void> {
    const key = `seat-lock:${eventId}:${seatId}`;
    await this.client.del(key);
  }

  async getSeatLock(eventId: string, seatId: string): Promise<string | null> {
    const key = `seat-lock:${eventId}:${seatId}`;
    return this.client.get(key);
  }
}
