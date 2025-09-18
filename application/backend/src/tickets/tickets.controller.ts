import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  Query, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { TransferTicketDto } from './dto/transfer-ticket.dto';
import { RefundTicketDto } from './dto/refund-ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('my-tickets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user tickets' })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '10' })
  @ApiQuery({ name: 'status', required: false, example: 'active' })
  @ApiResponse({ status: 200, description: 'User tickets retrieved successfully' })
  async getMyTickets(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string
  ) {
    return this.ticketsService.findByUserId(
      req.user.id, 
      parseInt(page) || 1, 
      parseInt(limit) || 10,
      status
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ticket details' })
  @ApiResponse({ status: 200, description: 'Ticket retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getTicket(@Param('id') id: string, @Request() req) {
    return this.ticketsService.findOne(id, req.user.id);
  }

  @Put(':id/transfer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transfer ticket to another user' })
  @ApiResponse({ status: 200, description: 'Ticket transferred successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async transferTicket(
    @Param('id') id: string,
    @Body() transferTicketDto: TransferTicketDto,
    @Request() req
  ) {
    return this.ticketsService.transferTicket(id, transferTicketDto, req.user.id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update ticket status' })
  @ApiResponse({ status: 200, description: 'Ticket status updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async updateTicketStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Request() req
  ) {
    return this.ticketsService.updateStatus(id, body.status, req.user.id);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request ticket refund' })
  @ApiResponse({ status: 201, description: 'Refund requested successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async requestRefund(
    @Param('id') id: string,
    @Body() refundTicketDto: RefundTicketDto,
    @Request() req
  ) {
    return this.ticketsService.requestRefund(id, refundTicketDto, req.user.id);
  }

  @Get(':id/qr-code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ticket QR code' })
  @ApiResponse({ status: 200, description: 'QR code retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getTicketQRCode(@Param('id') id: string, @Request() req) {
    return this.ticketsService.getQRCode(id, req.user.id);
  }

  @Get(':id/pdf')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ticket PDF' })
  @ApiResponse({ status: 200, description: 'PDF retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getTicketPDF(@Param('id') id: string, @Request() req) {
    return this.ticketsService.getPDF(id, req.user.id);
  }

  @Get('event/:eventId/attendees')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get event attendees (organizer only)' })
  @ApiResponse({ status: 200, description: 'Attendees retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getEventAttendees(@Param('eventId') eventId: string, @Request() req) {
    return this.ticketsService.getEventAttendees(eventId, req.user.id);
  }
}
