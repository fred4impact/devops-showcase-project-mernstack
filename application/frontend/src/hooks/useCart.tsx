'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Cart, CartItem } from '@/types';
import { cartApi } from '@/lib/api';
import { generateSessionId } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  sessionId: string;
  addToCart: (
    ticketTypeId: string,
    quantity: number,
    seatId?: string,
  ) => Promise<void>;
  updateCartItem: (
    ticketTypeId: string,
    quantity: number,
    seatId?: string,
  ) => Promise<void>;
  removeFromCart: (ticketTypeId: string, seatId?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  validateCart: () => Promise<boolean>;
  getSessionId: () => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Get or create session ID
    const storedSessionId = localStorage.getItem('cartSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      loadCart(storedSessionId);
    } else {
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      localStorage.setItem('cartSessionId', newSessionId);
    }
  }, []);

  const loadCart = async (sessionId: string) => {
    try {
      setLoading(true);
      const response = await cartApi.getCart(sessionId);
      setCart(response.data);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (
    ticketTypeId: string,
    quantity: number,
    seatId?: string,
  ) => {
    try {
      setLoading(true);
      const response = await cartApi.addToCart(sessionId, {
        ticketTypeId,
        quantity,
        seatId,
      });
      setCart(response.data);
      toast.success('Added to cart!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (
    ticketTypeId: string,
    quantity: number,
    seatId?: string,
  ) => {
    try {
      setLoading(true);
      const response = await cartApi.updateCartItem(
        sessionId,
        ticketTypeId,
        { quantity },
        seatId,
      );
      setCart(response.data);
      toast.success('Cart updated!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update cart');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (ticketTypeId: string, seatId?: string) => {
    try {
      setLoading(true);
      const response = await cartApi.removeFromCart(
        sessionId,
        ticketTypeId,
        seatId,
      );
      setCart(response.data);
      toast.success('Removed from cart!');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to remove from cart',
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartApi.clearCart(sessionId);
      setCart(null);
      toast.success('Cart cleared!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to clear cart');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const validateCart = async (): Promise<boolean> => {
    try {
      const response = await cartApi.validateCart(sessionId);
      const { isValid, errors } = response.data;

      if (!isValid && errors.length > 0) {
        toast.error(errors.join(', '));
        return false;
      }

      return isValid;
    } catch (error) {
      toast.error('Failed to validate cart');
      return false;
    }
  };

  const getSessionId = () => sessionId;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        sessionId,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        validateCart,
        getSessionId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
