import {
  IsString,
  IsDateString,
  IsEnum,
  IsOptional,
  IsArray,
  IsObject,
  ValidateNested,
  IsNumber,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EventStatus, SeatmapType } from '../../schemas/event.schema';

export class VenueDto {
  @ApiProperty({ example: 'Madison Square Garden' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '4 Pennsylvania Plaza, New York, NY 10001' })
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  address: string;

  @ApiProperty({ example: 20000 })
  @IsNumber()
  capacity: number;

  @ApiProperty({ example: 'America/New_York' })
  @IsString()
  timezone: string;
}

export class SeatDto {
  @ApiProperty({ example: 'A-1' })
  @IsString()
  seatId: string;

  @ApiProperty({ example: 'A' })
  @IsString()
  section: string;

  @ApiProperty({ example: 'A' })
  @IsString()
  row: string;

  @ApiProperty({ example: '1' })
  @IsString()
  number: string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  priceModifier?: number;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsNumber()
  accessible?: boolean;
}

export class SeatmapDto {
  @ApiProperty({ enum: SeatmapType, example: SeatmapType.GA })
  @IsEnum(SeatmapType)
  type: SeatmapType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  svg?: string;

  @ApiProperty({ type: [SeatDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeatDto)
  seats?: SeatDto[];
}

export class CreateEventDto {
  @ApiProperty({ example: 'Summer Music Festival 2024' })
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title: string;

  @ApiProperty({ example: 'summer-music-festival-2024' })
  @IsString()
  @MinLength(5)
  @MaxLength(50)
  slug: string;

  @ApiProperty({
    example: 'Join us for the biggest music festival of the year!',
  })
  @IsString()
  @MinLength(20)
  @MaxLength(1000)
  description: string;

  @ApiProperty({ example: 'Music' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  category: string;

  @ApiProperty({ type: VenueDto })
  @IsObject()
  @ValidateNested()
  @Type(() => VenueDto)
  venue: VenueDto;

  @ApiProperty({ example: '2024-07-15T18:00:00.000Z' })
  @IsDateString()
  startAt: string;

  @ApiProperty({ example: '2024-07-15T23:00:00.000Z' })
  @IsDateString()
  endAt: string;

  @ApiProperty({
    enum: EventStatus,
    example: EventStatus.DRAFT,
    required: false,
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ type: SeatmapDto, required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SeatmapDto)
  seatmap?: SeatmapDto;
}
