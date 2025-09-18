import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EventStatus } from '../../schemas/event.schema';

export class EventQueryDto {
  @ApiProperty({ required: false, example: 'Music' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false, example: '2024-07-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, example: 'New York' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ enum: EventStatus, required: false })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @IsString()
  limit?: string;
}
