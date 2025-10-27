import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TicketTypesService } from './ticket-types.service';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Ticket Types')
@Controller('ticket-types')
export class TicketTypesController {
  constructor(private readonly ticketTypesService: TicketTypesService) {}

  @Post('event/:eventId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create ticket type for an event' })
  @ApiResponse({ status: 201, description: 'Ticket type created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createTicketType(
    @Param('eventId') eventId: string,
    @Body() createTicketTypeDto: CreateTicketTypeDto,
    @Request() req,
  ) {
    return this.ticketTypesService.create(
      createTicketTypeDto,
      eventId,
      req.user.id,
    );
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get ticket types for an event' })
  @ApiResponse({
    status: 200,
    description: 'Ticket types retrieved successfully',
  })
  async getTicketTypesByEvent(@Param('eventId') eventId: string) {
    return this.ticketTypesService.findByEventId(eventId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket type by ID' })
  @ApiResponse({
    status: 200,
    description: 'Ticket type retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Ticket type not found' })
  async getTicketType(@Param('id') id: string) {
    return this.ticketTypesService.findOne(id);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Get available capacity for ticket type' })
  @ApiResponse({
    status: 200,
    description: 'Availability retrieved successfully',
  })
  async getAvailability(@Param('id') id: string) {
    const capacity = await this.ticketTypesService.getAvailableCapacity(id);
    return { availableCapacity: capacity };
  }

  @Get(':id/on-sale')
  @ApiOperation({ summary: 'Check if ticket type is on sale' })
  @ApiResponse({
    status: 200,
    description: 'Sale status retrieved successfully',
  })
  async getOnSaleStatus(@Param('id') id: string) {
    const isOnSale = await this.ticketTypesService.isOnSale(id);
    return { isOnSale };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update ticket type' })
  @ApiResponse({ status: 200, description: 'Ticket type updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Ticket type not found' })
  async updateTicketType(
    @Param('id') id: string,
    @Body() updateTicketTypeDto: UpdateTicketTypeDto,
    @Request() req,
  ) {
    return this.ticketTypesService.update(id, updateTicketTypeDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete ticket type' })
  @ApiResponse({ status: 200, description: 'Ticket type deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Ticket type not found' })
  async deleteTicketType(@Param('id') id: string, @Request() req) {
    await this.ticketTypesService.remove(id, req.user.id);
    return { message: 'Ticket type deleted successfully' };
  }
}
