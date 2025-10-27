import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SeatingPlanService } from './seating-plan.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Seating Plan')
@Controller('seating-plan')
export class SeatingPlanController {
  constructor(private readonly seatingPlanService: SeatingPlanService) {}

  @Get('events/:eventId/seatmap')
  @ApiOperation({ summary: 'Get event seatmap with availability' })
  @ApiResponse({ status: 200, description: 'Seatmap retrieved successfully' })
  async getSeatmap(@Param('eventId') eventId: string) {
    return this.seatingPlanService.getSeatmap(eventId);
  }

  @Post('events/:eventId/seats/:seatId/lock')
  @ApiOperation({ summary: 'Lock a seat for booking' })
  @ApiResponse({ status: 201, description: 'Seat locked successfully' })
  async lockSeat(
    @Param('eventId') eventId: string,
    @Param('seatId') seatId: string,
    @Body() body: { sessionId: string; userId?: string; duration?: number },
  ) {
    return this.seatingPlanService.lockSeat(
      eventId,
      seatId,
      body.sessionId,
      body.userId,
      body.duration,
    );
  }

  @Delete('events/:eventId/seats/:seatId/unlock')
  @ApiOperation({ summary: 'Unlock a seat' })
  @ApiResponse({ status: 200, description: 'Seat unlocked successfully' })
  async unlockSeat(
    @Param('eventId') eventId: string,
    @Param('seatId') seatId: string,
    @Body() body: { sessionId: string },
  ) {
    return this.seatingPlanService.unlockSeat(eventId, seatId, body.sessionId);
  }

  @Delete('events/:eventId/session/:sessionId/unlock-all')
  @ApiOperation({ summary: 'Unlock all seats for a session' })
  @ApiResponse({ status: 200, description: 'All seats unlocked successfully' })
  async unlockAllSeats(
    @Param('eventId') eventId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.seatingPlanService.unlockSeatsBySession(eventId, sessionId);
  }

  @Get('events/:eventId/availability')
  @ApiOperation({ summary: 'Get seat availability for an event' })
  @ApiResponse({
    status: 200,
    description: 'Availability retrieved successfully',
  })
  async getAvailability(@Param('eventId') eventId: string) {
    return this.seatingPlanService.getSeatAvailability(eventId);
  }

  @Post('events/:eventId/seatmap')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create seating plan for an event' })
  @ApiResponse({
    status: 201,
    description: 'Seating plan created successfully',
  })
  async createSeatingPlan(
    @Param('eventId') eventId: string,
    @Body() seatingPlanData: any,
  ) {
    return this.seatingPlanService.createSeatingPlan(eventId, seatingPlanData);
  }

  @Put('events/:eventId/seatmap')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update seating plan for an event' })
  @ApiResponse({
    status: 200,
    description: 'Seating plan updated successfully',
  })
  async updateSeatingPlan(
    @Param('eventId') eventId: string,
    @Body() updates: any,
  ) {
    return this.seatingPlanService.updateSeatingPlan(eventId, updates);
  }

  @Delete('events/:eventId/seatmap')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete seating plan for an event' })
  @ApiResponse({
    status: 200,
    description: 'Seating plan deleted successfully',
  })
  async deleteSeatingPlan(@Param('eventId') eventId: string) {
    return this.seatingPlanService.deleteSeatingPlan(eventId);
  }

  @Post('cleanup-locks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cleanup expired seat locks' })
  @ApiResponse({
    status: 200,
    description: 'Expired locks cleaned up successfully',
  })
  async cleanupExpiredLocks() {
    return this.seatingPlanService.cleanupExpiredLocks();
  }
}
