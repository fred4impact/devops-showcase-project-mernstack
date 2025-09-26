'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { getStripe } from '@/lib/stripe';
import toast from 'react-hot-toast';

interface CartItem {
  ticketTypeId: string;
  quantity: number;
  priceCents: number;
  seatId?: string;
  ticketType?: {
    _id: string;
    name: string;
    event: {
      _id: string;
      title: string;
      date: string;
      location: string;
    };
  };
}

interface Cart {
  items: CartItem[];
  totalCents: number;
  itemCount: number;
}

interface PaymentForm {
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function Checkout() {
  const router = useRouter();
  const { user } = useAuth();
  const { sessionId } = useCart();
  const [cart, setCart] = useState<Cart>({ items: [], totalCents: 0, itemCount: 0 });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    email: user?.email || '',
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });

  useEffect(() => {
    if (!sessionId) {
      router.push('/cart');
      return;
    }
    fetchCart();
  }, [sessionId, router]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/cart?sessionId=${sessionId}`);
      setCart(response.data);
      
      if (response.data.items.length === 0) {
        router.push('/cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
      router.push('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const createOrder = async () => {
    if (!user) {
      toast.error('Please log in to continue');
      router.push('/auth/login');
      return;
    }

    try {
      setProcessing(true);
      
      const orderData = {
        items: cart.items.map(item => ({
          ticketTypeId: item.ticketTypeId,
          qty: item.quantity,
          seatId: item.seatId,
        })),
        email: paymentForm.email,
        totalCents: cart.totalCents,
        sessionId,
      };

      // Create payment intent
      const response = await api.post('/orders/payment-intent', orderData);
      
      if (response.data.paymentIntent) {
        const stripe = await getStripe();
        if (!stripe) {
          toast.error('Payment system not available');
          return;
        }

        // Use Stripe Elements for payment
        const { error } = await stripe.confirmPayment({
          clientSecret: response.data.paymentIntent.clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/orders/${response.data.orderId}/success`,
          },
        });

        if (error) {
          toast.error(error.message || 'Payment failed. Please try again.');
        }
      } else {
        // Free tickets - redirect to success
        router.push(`/orders/${response.data.orderId}/success`);
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-4">Add some events to get started!</p>
          <Button onClick={() => router.push('/events')}>
            Browse Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={paymentForm.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={paymentForm.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={paymentForm.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </Card>

            {/* Billing Address */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing Address</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    value={paymentForm.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      value={paymentForm.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <Input
                      id="state"
                      name="state"
                      type="text"
                      value={paymentForm.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      type="text"
                      value={paymentForm.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={paymentForm.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="ES">Spain</option>
                    <option value="IT">Italy</option>
                    <option value="NL">Netherlands</option>
                    <option value="SE">Sweden</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
              
              {/* Payment Placeholder for Testing */}
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium text-yellow-800">Payment System - Development Mode</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Payment processing is disabled for testing. In production, this will integrate with Stripe.
                </p>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-sm font-bold">S</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Stripe (Coming Soon)</p>
                  <p className="text-sm text-gray-600">Secure payment processing</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                {cart.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.ticketType?.event?.title || 'Loading...'}
                      </p>
                      <p className="text-sm text-gray-600">{item.ticketType?.name}</p>
                      {item.seatId && (
                        <Badge variant="secondary" className="mt-1">
                          Seat: {item.seatId}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${formatPrice(item.priceCents * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 space-y-2">
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
            </Card>

            {/* Terms and Conditions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• All sales are final. No refunds unless event is cancelled.</p>
                <p>• Tickets are non-transferable.</p>
                <p>• Valid photo ID required for entry.</p>
                <p>• Event organizers reserve the right to refuse entry.</p>
              </div>
            </Card>

            {/* Complete Purchase */}
            <Button
              onClick={createOrder}
              disabled={processing || !paymentForm.name || !paymentForm.email || !paymentForm.address}
              className="w-full bg-primary-600 hover:bg-primary-700"
              size="lg"
            >
              {processing ? 'Processing...' : `Complete Purchase - $${formatPrice(cart.totalCents)}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
