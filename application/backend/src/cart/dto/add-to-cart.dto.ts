import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  ticketTypeId: string;

  @ApiProperty({ example: 2, description: 'Maximum 5 tickets per purchase' })
  @IsNumber()
  @Min(1)
  @Max(5)
  quantity: number;

  @ApiProperty({ example: 'A-1', required: false })
  @IsOptional()
  @IsString()
  seatId?: string;
}
