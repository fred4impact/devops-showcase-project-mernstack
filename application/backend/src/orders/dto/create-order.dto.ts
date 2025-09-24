import { IsString, IsEmail, IsOptional, IsArray, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  ticketTypeId: string;

  @ApiProperty({ example: 'A-1', required: false })
  @IsOptional()
  @IsString()
  seatId?: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  priceCents: number;

  @ApiProperty({ example: 2, description: 'Maximum 5 tickets per item' })
  @IsNumber()
  @Min(1)
  @Max(5)
  qty: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'customer@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: 10000 })
  @IsNumber()
  totalCents: number;

  @ApiProperty({ example: 500, required: false })
  @IsOptional()
  @IsNumber()
  feesCents?: number;

  @ApiProperty({ example: 800, required: false })
  @IsOptional()
  @IsNumber()
  taxCents?: number;
}
