import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  Query 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get cart contents' })
  @ApiQuery({ name: 'sessionId', required: true, example: 'session_123' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  async getCart(@Query('sessionId') sessionId: string) {
    return this.cartService.getCart(sessionId);
  }

  @Post('add')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async addToCart(
    @Body() addToCartDto: AddToCartDto,
    @Query('sessionId') sessionId: string
  ) {
    return this.cartService.addToCart(sessionId, addToCartDto);
  }

  @Put('item/:ticketTypeId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, description: 'Cart item updated successfully' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async updateCartItem(
    @Param('ticketTypeId') ticketTypeId: string,
    @Body() updateDto: UpdateCartItemDto,
    @Query('sessionId') sessionId: string,
    @Query('seatId') seatId?: string
  ) {
    return this.cartService.updateCartItem(sessionId, ticketTypeId, seatId, updateDto);
  }

  @Delete('item/:ticketTypeId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart successfully' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async removeFromCart(
    @Param('ticketTypeId') ticketTypeId: string,
    @Query('sessionId') sessionId: string,
    @Query('seatId') seatId?: string
  ) {
    return this.cartService.removeFromCart(sessionId, ticketTypeId, seatId);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear entire cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  async clearCart(@Query('sessionId') sessionId: string) {
    await this.cartService.clearCart(sessionId);
    return { message: 'Cart cleared successfully' };
  }

  @Get('validate')
  @ApiOperation({ summary: 'Validate cart contents' })
  @ApiQuery({ name: 'sessionId', required: true, example: 'session_123' })
  @ApiResponse({ status: 200, description: 'Cart validation completed' })
  async validateCart(@Query('sessionId') sessionId: string) {
    return this.cartService.validateCart(sessionId);
  }
}
