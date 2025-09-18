import { IsString, IsNumber, IsDateString, IsBoolean, IsOptional, MinLength, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketTypeDto {
  @ApiProperty({ example: 'General Admission' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'General admission ticket for the event', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 5000, description: 'Price in cents' })
  @IsNumber()
  @Min(0)
  priceCents: number;

  @ApiProperty({ example: 'USD', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1)
  @Max(100000)
  capacity: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @IsDateString()
  salesStart: string;

  @ApiProperty({ example: '2024-07-14T23:59:59.000Z' })
  @IsDateString()
  salesEnd: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  refundable?: boolean;
}
