'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { useCart } from '@/hooks/useCart';
import toast from 'react-hot-toast';

interface CartItem {
  ticketTypeId: string;
  quantity: number;
  priceCents: number;
  seatId?: string;
  addedAt: string;
  ticketType?: {
    _id: string;
    name: string;
    description: string;
    event: {
      _id: string;
      title: string;
      date: string;
      location: string;
      image?: string;
    };
  };
}

interface Cart {
  items: CartItem[];
  totalCents: number;
  itemCount: number;
}

export default function Cart() {
  const router = useRouter();
  const { sessionId } = useCart();
  const [cart, setCart] = useState<Cart>({ items: [], totalCents: 0, itemCount: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetchCart();
    }
  }, [sessionId]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/cart?sessionId=${sessionId}`);
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (ticketTypeId: string, seatId: string | undefined, quantity: number) => {
    if (quantity < 1) {
      await removeItem(ticketTypeId, seatId);
      return;
    }

    try {
      setUpdating(`${ticketTypeId}-${seatId || 'general'}`);
      await api.put(`/cart/item/${ticketTypeId}?sessionId=${sessionId}&seatId=${seatId || ''}`, {
        quantity,
      });
      await fetchCart();
      toast.success('Cart updated');
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (ticketTypeId: string, seatId: string | undefined) => {
    try {
      setUpdating(`${ticketTypeId}-${seatId || 'general'}`);
      await api.delete(`/cart/item/${ticketTypeId}?sessionId=${sessionId}&seatId=${seatId || ''}`);
      await fetchCart();
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete(`/cart?sessionId=${sessionId}`);
      setCart({ items: [], totalCents: 0, itemCount: 0 });
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Add some events to get started!</p>
            <Button
              onClick={() => router.push('/events')}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Browse Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-2">{cart.itemCount} item{cart.itemCount !== 1 ? 's' : ''} in your cart</p>
          </div>
          <Button
            onClick={clearCart}
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item, index) => (
              <Card key={`${item.ticketTypeId}-${item.seatId || 'general'}`} className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Event Image */}
                  <div className="flex-shrink-0">
                    {item.ticketType?.event?.image ? (
                      <img
                        src={item.ticketType.event.image}
                        alt={item.ticketType.event.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.ticketType?.event?.title || 'Loading...'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.ticketType?.name || 'Ticket'}
                    </p>
                    {item.ticketType?.event?.date && (
                      <p className="text-sm text-gray-500 mb-2">
                        {formatDate(item.ticketType.event.date)}
                      </p>
                    )}
                    {item.ticketType?.event?.location && (
                      <p className="text-sm text-gray-500">
                        📍 {item.ticketType.event.location}
                      </p>
                    )}
                    {item.seatId && (
                      <Badge variant="secondary" className="mt-2">
                        Seat: {item.seatId}
                      </Badge>
                    )}
                  </div>

                  {/* Price and Controls */}
                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ${formatPrice(item.priceCents * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${formatPrice(item.priceCents)} each
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.ticketTypeId, item.seatId, item.quantity - 1)}
                        disabled={updating === `${item.ticketTypeId}-${item.seatId || 'general'}`}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.ticketTypeId, item.seatId, item.quantity + 1)}
                        disabled={updating === `${item.ticketTypeId}-${item.seatId || 'general'}`}
                      >
                        +
                      </Button>
                    </div>

                    {/* Remove Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeItem(item.ticketTypeId, item.seatId)}
                      disabled={updating === `${item.ticketTypeId}-${item.seatId || 'general'}`}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${formatPrice(cart.totalCents)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="text-gray-900">$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">$0.00</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">${formatPrice(cart.totalCents)}</span>
                </div>
              </div>

              <Button
                onClick={() => router.push('/checkout')}
                className="w-full bg-primary-600 hover:bg-primary-700 mb-4"
                size="lg"
              >
                Proceed to Checkout
              </Button>

              <Button
                onClick={() => router.push('/events')}
                variant="outline"
                className="w-full"
              >
                Continue Shopping
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
