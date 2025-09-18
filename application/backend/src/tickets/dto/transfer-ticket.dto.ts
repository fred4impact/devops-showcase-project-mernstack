import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferTicketDto {
  @ApiProperty({ example: 'recipient@example.com' })
  @IsEmail()
  recipientEmail: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiProperty({ example: 'Transferring ticket to friend', required: false })
  @IsOptional()
  @IsString()
  message?: string;
}
