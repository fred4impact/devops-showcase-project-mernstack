import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import * as celery from 'celery';

@Injectable()
export class CeleryService {
  private readonly logger = new Logger(CeleryService.name);
  private celeryClient: any;

  constructor(private configService: ConfigService) {
    // this.initializeCelery();
  }

  // private initializeCelery() {
  //   try {
  //     const redisUrl = this.configService.get('REDIS_URL', 'redis://:redis123@localhost:6379/0');

  //     this.celeryClient = celery.createClient({
  //       CELERY_BROKER_URL: redisUrl,
  //       CELERY_RESULT_BACKEND: redisUrl,
  //     });

  //     this.logger.log('Celery client initialized successfully');
  //   } catch (error) {
  //     this.logger.error('Failed to initialize Celery client:', error);
  //   }
  // }

  // All Celery methods disabled - Celery removed from project
  async processImage(
    _imageUrl: string,
    _imageType: string = 'event',
    _userId?: string,
  ) {
    this.logger.warn('Celery service disabled - image processing skipped');
    return { id: 'disabled', status: 'skipped' };
  }

  async generateImageVariants(_imageUrl: string, _variants: any[]) {
    this.logger.warn(
      'Celery service disabled - image variants generation skipped',
    );
    return { id: 'disabled', status: 'skipped' };
  }

  async optimizeImage(_imageUrl: string, _maxSize: number = 1024 * 1024) {
    this.logger.warn('Celery service disabled - image optimization skipped');
    return { id: 'disabled', status: 'skipped' };
  }

  async cleanupOldImages(_daysOld: number = 30) {
    this.logger.warn('Celery service disabled - image cleanup skipped');
    return { id: 'disabled', status: 'skipped' };
  }

  async getTaskResult(_taskId: string) {
    this.logger.warn('Celery service disabled - task result unavailable');
    return null;
  }

  async getTaskStatus(_taskId: string) {
    this.logger.warn('Celery service disabled - task status unavailable');
    return 'disabled';
  }
}
