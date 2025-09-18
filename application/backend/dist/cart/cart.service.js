"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
const ticket_types_service_1 = require("../ticket-types/ticket-types.service");
let CartService = class CartService {
    constructor(redisService, ticketTypesService) {
        this.redisService = redisService;
        this.ticketTypesService = ticketTypesService;
    }
    getCartKey(sessionId) {
        return `cart:${sessionId}`;
    }
    getSeatLockKey(eventId, seatId) {
        return `seat-lock:${eventId}:${seatId}`;
    }
    async getCart(sessionId) {
        const cartKey = this.getCartKey(sessionId);
        const cartData = await this.redisService.get(cartKey);
        if (!cartData) {
            return {
                items: [],
                totalCents: 0,
                itemCount: 0,
                sessionId,
            };
        }
        return JSON.parse(cartData);
    }
    async addToCart(sessionId, addToCartDto) {
        const { ticketTypeId, quantity, seatId } = addToCartDto;
        const ticketType = await this.ticketTypesService.findOne(ticketTypeId);
        const isOnSale = await this.ticketTypesService.isOnSale(ticketTypeId);
        if (!isOnSale) {
            throw new common_1.BadRequestException('Ticket type is not currently on sale');
        }
        const availableCapacity = await this.ticketTypesService.getAvailableCapacity(ticketTypeId);
        if (quantity > availableCapacity) {
            throw new common_1.BadRequestException('Not enough tickets available');
        }
        if (seatId) {
            const isSeatLocked = await this.redisService.lockSeat(ticketType.eventId.toString(), seatId, sessionId, 600);
            if (!isSeatLocked) {
                throw new common_1.BadRequestException('Seat is already locked by another user');
            }
        }
        const cart = await this.getCart(sessionId);
        const existingItemIndex = cart.items.findIndex(item => item.ticketTypeId === ticketTypeId && item.seatId === seatId);
        if (existingItemIndex >= 0) {
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            if (newQuantity > availableCapacity) {
                throw new common_1.BadRequestException('Not enough tickets available');
            }
            cart.items[existingItemIndex].quantity = newQuantity;
        }
        else {
            cart.items.push({
                ticketTypeId,
                quantity,
                priceCents: ticketType.priceCents,
                seatId,
                addedAt: new Date().toISOString(),
            });
        }
        cart.totalCents = cart.items.reduce((total, item) => total + (item.priceCents * item.quantity), 0);
        cart.itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
        const cartKey = this.getCartKey(sessionId);
        await this.redisService.set(cartKey, JSON.stringify(cart), 3600);
        return cart;
    }
    async updateCartItem(sessionId, ticketTypeId, seatId, updateDto) {
        const cart = await this.getCart(sessionId);
        const itemIndex = cart.items.findIndex(item => item.ticketTypeId === ticketTypeId && item.seatId === seatId);
        if (itemIndex === -1) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        const availableCapacity = await this.ticketTypesService.getAvailableCapacity(ticketTypeId);
        if (updateDto.quantity > availableCapacity) {
            throw new common_1.BadRequestException('Not enough tickets available');
        }
        cart.items[itemIndex].quantity = updateDto.quantity;
        cart.totalCents = cart.items.reduce((total, item) => total + (item.priceCents * item.quantity), 0);
        cart.itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
        const cartKey = this.getCartKey(sessionId);
        await this.redisService.set(cartKey, JSON.stringify(cart), 3600);
        return cart;
    }
    async removeFromCart(sessionId, ticketTypeId, seatId) {
        const cart = await this.getCart(sessionId);
        if (seatId) {
            const ticketType = await this.ticketTypesService.findOne(ticketTypeId);
            await this.redisService.unlockSeat(ticketType.eventId.toString(), seatId);
        }
        cart.items = cart.items.filter(item => !(item.ticketTypeId === ticketTypeId && item.seatId === seatId));
        cart.totalCents = cart.items.reduce((total, item) => total + (item.priceCents * item.quantity), 0);
        cart.itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
        const cartKey = this.getCartKey(sessionId);
        if (cart.items.length === 0) {
            await this.redisService.del(cartKey);
        }
        else {
            await this.redisService.set(cartKey, JSON.stringify(cart), 3600);
        }
        return cart;
    }
    async clearCart(sessionId) {
        const cart = await this.getCart(sessionId);
        for (const item of cart.items) {
            if (item.seatId) {
                const ticketType = await this.ticketTypesService.findOne(item.ticketTypeId);
                await this.redisService.unlockSeat(ticketType.eventId.toString(), item.seatId);
            }
        }
        const cartKey = this.getCartKey(sessionId);
        await this.redisService.del(cartKey);
    }
    async validateCart(sessionId) {
        const cart = await this.getCart(sessionId);
        const errors = [];
        for (const item of cart.items) {
            try {
                const isOnSale = await this.ticketTypesService.isOnSale(item.ticketTypeId);
                if (!isOnSale) {
                    errors.push(`Ticket type ${item.ticketTypeId} is no longer on sale`);
                }
                const availableCapacity = await this.ticketTypesService.getAvailableCapacity(item.ticketTypeId);
                if (item.quantity > availableCapacity) {
                    errors.push(`Not enough tickets available for ${item.ticketTypeId}`);
                }
                if (item.seatId) {
                    const ticketType = await this.ticketTypesService.findOne(item.ticketTypeId);
                    const lockExists = await this.redisService.getSeatLock(ticketType.eventId.toString(), item.seatId);
                    if (!lockExists || lockExists !== sessionId) {
                        errors.push(`Seat ${item.seatId} is no longer available`);
                    }
                }
            }
            catch (error) {
                errors.push(`Error validating item ${item.ticketTypeId}: ${error.message}`);
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        ticket_types_service_1.TicketTypesService])
], CartService);
//# sourceMappingURL=cart.service.js.map