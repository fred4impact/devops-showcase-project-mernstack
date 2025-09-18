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
    itemCount: number;
    sessionId: string;
}
export declare class CartService {
    private readonly redisService;
    private readonly ticketTypesService;
    constructor(redisService: RedisService, ticketTypesService: TicketTypesService);
    private getCartKey;
    private getSeatLockKey;
    getCart(sessionId: string): Promise<Cart>;
    addToCart(sessionId: string, addToCartDto: AddToCartDto): Promise<Cart>;
    updateCartItem(sessionId: string, ticketTypeId: string, seatId: string | undefined, updateDto: UpdateCartItemDto): Promise<Cart>;
    removeFromCart(sessionId: string, ticketTypeId: string, seatId?: string): Promise<Cart>;
    clearCart(sessionId: string): Promise<void>;
    validateCart(sessionId: string): Promise<{
        isValid: boolean;
        errors: string[];
    }>;
}
