import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RefundReason {
  CANCELLED_EVENT = 'cancelled_event',
  PERSONAL_REASONS = 'personal_reasons',
  DUPLICATE_PURCHASE = 'duplicate_purchase',
  TECHNICAL_ISSUE = 'technical_issue',
  OTHER = 'other'
}

export class RefundTicketDto {
  @ApiProperty({ enum: RefundReason, example: RefundReason.PERSONAL_REASONS })
  @IsEnum(RefundReason)
  reason: RefundReason;

  @ApiProperty({ example: 'Unable to attend due to work conflict', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
