import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { TicketTypesService } from '../ticket-types/ticket-types.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

export interface CartItem {
  ticketTypeId: string;
  quantity: number;
  priceCents: number;
  seatId?: string;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  totalCents: number;
  processingFeesCents: number;
  itemCount: number;
  sessionId: string;
}

@Injectable()
export class CartService {
  constructor(
    private readonly redisService: RedisService,
    private readonly ticketTypesService: TicketTypesService,
  ) {}

  private getCartKey(sessionId: string): string {
    return `cart:${sessionId}`;
  }

  private getSeatLockKey(eventId: string, seatId: string): string {
    return `seat-lock:${eventId}:${seatId}`;
  }

  async getCart(sessionId: string): Promise<Cart> {
    const cartKey = this.getCartKey(sessionId);
    const cartData = await this.redisService.get(cartKey);
    
    if (!cartData) {
      return {
        items: [],
        totalCents: 0,
        processingFeesCents: 0,
        itemCount: 0,
        sessionId,
      };
    }

    const cart = JSON.parse(cartData);
    
    // Ensure backward compatibility - add processingFeesCents if missing
    if (cart.processingFeesCents === undefined) {
      cart.processingFeesCents = cart.itemCount ? cart.itemCount * 99 : 0;
    }
    
    return cart;
  }

  async addToCart(sessionId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const { ticketTypeId, quantity, seatId } = addToCartDto;

    // Check ticket quantity limit (max 5 tickets per purchase)
    if (quantity > 5) {
      throw new BadRequestException('Cannot purchase more than 5 tickets at a time');
    }

    // Verify ticket type exists and is on sale
    const ticketType = await this.ticketTypesService.findOne(ticketTypeId);
    const isOnSale = await this.ticketTypesService.isOnSale(ticketTypeId);
    
    if (!isOnSale) {
      throw new BadRequestException('Ticket type is not currently on sale');
    }

    // Check availability
    const availableCapacity = await this.ticketTypesService.getAvailableCapacity(ticketTypeId);
    if (quantity > availableCapacity) {
      throw new BadRequestException('Not enough tickets available');
    }

    // Handle seat locking for reserved seating
    if (seatId) {
      const isSeatLocked = await this.redisService.lockSeat(ticketType.eventId.toString(), seatId, sessionId, 600);
      if (!isSeatLocked) {
        throw new BadRequestException('Seat is already locked by another user');
      }
    }

    const cart = await this.getCart(sessionId);
    const existingItemIndex = cart.items.findIndex(
      item => item.ticketTypeId === ticketTypeId && item.seatId === seatId
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > availableCapacity) {
        throw new BadRequestException('Not enough tickets available');
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        ticketTypeId,
        quantity,
        priceCents: ticketType.priceCents,
        seatId,
        addedAt: new Date().toISOString(),
      });
    }

    // Recalculate totals
    cart.totalCents = cart.items.reduce((total, item) => total + (item.priceCents * item.quantity), 0);
    cart.itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.processingFeesCents = cart.itemCount * 99; // $0.99 per ticket

    // Save to Redis with 1 hour expiration
    const cartKey = this.getCartKey(sessionId);
    await this.redisService.set(cartKey, JSON.stringify(cart), 3600);

    return cart;
  }

  async updateCartItem(sessionId: string, ticketTypeId: string, seatId: string | undefined, updateDto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.getCart(sessionId);
    const itemIndex = cart.items.findIndex(
      item => item.ticketTypeId === ticketTypeId && item.seatId === seatId
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Cart item not found');
    }

    // Check ticket quantity limit (max 5 tickets per purchase)
    if (updateDto.quantity > 5) {
      throw new BadRequestException('Cannot purchase more than 5 tickets at a time');
    }

    // Check availability
    const availableCapacity = await this.ticketTypesService.getAvailableCapacity(ticketTypeId);
    if (updateDto.quantity > availableCapacity) {
      throw new BadRequestException('Not enough tickets available');
    }

    cart.items[itemIndex].quantity = updateDto.quantity;

    // Recalculate totals
    cart.totalCents = cart.items.reduce((total, item) => total + (item.priceCents * item.quantity), 0);
    cart.itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.processingFeesCents = cart.itemCount * 99; // $0.99 per ticket

    // Save to Redis
    const cartKey = this.getCartKey(sessionId);
    await this.redisService.set(cartKey, JSON.stringify(cart), 3600);

    return cart;
  }

  async removeFromCart(sessionId: string, ticketTypeId: string, seatId?: string): Promise<Cart> {
    const cart = await this.getCart(sessionId);
    
    // Remove seat lock if applicable
    if (seatId) {
      const ticketType = await this.ticketTypesService.findOne(ticketTypeId);
      await this.redisService.unlockSeat(ticketType.eventId.toString(), seatId);
    }

    cart.items = cart.items.filter(
      item => !(item.ticketTypeId === ticketTypeId && item.seatId === seatId)
    );

    // Recalculate totals
    cart.totalCents = cart.items.reduce((total, item) => total + (item.priceCents * item.quantity), 0);
    cart.itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.processingFeesCents = cart.itemCount * 99; // $0.99 per ticket

    // Save to Redis
    const cartKey = this.getCartKey(sessionId);
    if (cart.items.length === 0) {
      await this.redisService.del(cartKey);
    } else {
      await this.redisService.set(cartKey, JSON.stringify(cart), 3600);
    }

    return cart;
  }

  async clearCart(sessionId: string): Promise<void> {
    try {
      const cart = await this.getCart(sessionId);
      
      // Release all seat locks
      for (const item of cart.items) {
        if (item.seatId) {
          try {
            const ticketType = await this.ticketTypesService.findOne(item.ticketTypeId);
            await this.redisService.unlockSeat(ticketType.eventId.toString(), item.seatId);
          } catch (error) {
            console.warn(`Failed to unlock seat ${item.seatId}:`, error.message);
          }
        }
      }

      const cartKey = this.getCartKey(sessionId);
      await this.redisService.del(cartKey);
    } catch (error) {
      console.error('Error clearing cart:', error.message);
      // Still try to delete the cart key even if there's an error
      const cartKey = this.getCartKey(sessionId);
      await this.redisService.del(cartKey);
    }
  }

  async validateCart(sessionId: string): Promise<{ isValid: boolean; errors: string[] }> {
    const cart = await this.getCart(sessionId);
    const errors: string[] = [];

    for (const item of cart.items) {
      try {
        // Check if ticket type still exists and is on sale
        const isOnSale = await this.ticketTypesService.isOnSale(item.ticketTypeId);
        if (!isOnSale) {
          errors.push(`Ticket type ${item.ticketTypeId} is no longer on sale`);
        }

        // Check availability
        const availableCapacity = await this.ticketTypesService.getAvailableCapacity(item.ticketTypeId);
        if (item.quantity > availableCapacity) {
          errors.push(`Not enough tickets available for ${item.ticketTypeId}`);
        }

        // Check seat lock for reserved seating
        if (item.seatId) {
          const ticketType = await this.ticketTypesService.findOne(item.ticketTypeId);
          const lockExists = await this.redisService.getSeatLock(ticketType.eventId.toString(), item.seatId);
          if (!lockExists || lockExists !== sessionId) {
            errors.push(`Seat ${item.seatId} is no longer available`);
          }
        }
      } catch (error) {
        errors.push(`Error validating item ${item.ticketTypeId}: ${error.message}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
