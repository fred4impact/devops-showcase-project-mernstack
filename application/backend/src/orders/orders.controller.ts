import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Query('sessionId') sessionId?: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id;
    return this.ordersService.create(createOrderDto, userId, sessionId);
  }

  @Post('payment-intent')
  @ApiOperation({ summary: 'Create payment intent for order' })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createPaymentIntent(
    @Body() createOrderDto: CreateOrderDto,
    @Query('sessionId') sessionId?: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id;
    return this.ordersService.createPaymentIntent(
      createOrderDto,
      userId,
      sessionId,
    );
  }

  @Post('confirm-payment')
  @ApiOperation({ summary: 'Confirm payment and complete order' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async confirmPayment(@Body() body: { paymentIntentId: string }) {
    return this.ordersService.confirmPayment(body.paymentIntentId);
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user orders' })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '10' })
  @ApiResponse({
    status: 200,
    description: 'User orders retrieved successfully',
  })
  async getMyOrders(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.findByUserId(
      req.user.id,
      parseInt(page) || 1,
      parseInt(limit) || 10,
    );
  }

  @Get('by-email')
  @ApiOperation({ summary: 'Get orders by email' })
  @ApiQuery({ name: 'email', required: true, example: 'customer@example.com' })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '10' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async getOrdersByEmail(
    @Query('email') email: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.findByEmail(
      email,
      parseInt(page) || 1,
      parseInt(limit) || 10,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrder(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async cancelOrder(@Param('id') id: string, @Request() req) {
    return this.ordersService.cancelOrder(id, req.user.id);
  }

  @Get('stats/event/:eventId')
  @ApiOperation({ summary: 'Get order statistics for an event' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getEventStats(@Param('eventId') eventId: string) {
    return this.ordersService.getOrderStats(eventId);
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get overall order statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getOverallStats() {
    return this.ordersService.getOrderStats();
  }
}
