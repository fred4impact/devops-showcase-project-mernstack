import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { S3Service } from './s3.service';
import { Image, ImageSchema } from '../schemas/image.schema';
// import { CeleryModule } from '../celery/celery.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Image.name, schema: ImageSchema }
    ]),
    // CeleryModule,
  ],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
