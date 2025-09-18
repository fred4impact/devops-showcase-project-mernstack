import { Controller, Get, Put, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/orders')
  @ApiOperation({ summary: 'Get current user orders' })
  async getUserOrders(@Request() req) {
    return this.usersService.getUserOrders(req.user.id);
  }

  @Put('me/upgrade-to-organizer')
  @ApiOperation({ summary: 'Upgrade user role to organizer' })
  @ApiResponse({ status: 200, description: 'Role upgraded successfully' })
  @ApiResponse({ status: 400, description: 'User is already an organizer' })
  async upgradeToOrganizer(@Request() req) {
    return this.usersService.upgradeToOrganizer(req.user.id);
  }
}
