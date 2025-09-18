import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(sessionId: string): Promise<import("./cart.service").Cart>;
    addToCart(addToCartDto: AddToCartDto, sessionId: string): Promise<import("./cart.service").Cart>;
    updateCartItem(ticketTypeId: string, updateDto: UpdateCartItemDto, sessionId: string, seatId?: string): Promise<import("./cart.service").Cart>;
    removeFromCart(ticketTypeId: string, sessionId: string, seatId?: string): Promise<import("./cart.service").Cart>;
    clearCart(sessionId: string): Promise<{
        message: string;
    }>;
    validateCart(sessionId: string): Promise<{
        isValid: boolean;
        errors: string[];
    }>;
}
