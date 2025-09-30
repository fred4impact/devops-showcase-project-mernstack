'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { SeatMap } from '@/components/seatmap/SeatMap';
import api from '@/lib/api';
import { useCart } from '@/hooks/useCart';
import toast from 'react-hot-toast';

interface TicketType {
  _id: string;
  name: string;
  description: string;
  priceCents: number;
  capacity: number;
  soldCount: number;
  salesStart: string;
  salesEnd: string;
  refundable: boolean;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  venue: {
    name: string;
    address: string;
    capacity: number;
    timezone: string;
  };
  startAt: string;
  endAt: string;
  status: string;
  images: string[];
  seatmap?: {
    type: 'reserved' | 'ga';
    seats: Array<{
      seatId: string;
      section: string;
      row: string;
      number: string;
      priceModifier: number;
      accessible: boolean;
    }>;
  };
  organizerId: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function EventDetails() {
  const params = useParams();
  const router = useRouter();
  const { sessionId } = useCart();
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketType, setSelectedTicketType] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchEventDetails();
    }
  }, [params.id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      
      // Try to fetch by ID first, then by slug if ID fails
      let eventResponse;
      let eventId;
      
      try {
        // First try as ID
        eventResponse = await api.get(`/events/${params.id}`);
        eventId = eventResponse.data._id;
      } catch (idError) {
        // If ID fails, try as slug
        try {
          eventResponse = await api.get(`/events/slug/${params.id}`);
          eventId = eventResponse.data._id;
        } catch (slugError) {
          throw new Error('Event not found');
        }
      }
      
      // Fetch ticket types using the event ID
      const ticketTypesResponse = await api.get(`/ticket-types/event/${eventId}`);
      
      setEvent(eventResponse.data);
      setTicketTypes(ticketTypesResponse.data);
      
      if (ticketTypesResponse.data.length > 0) {
        setSelectedTicketType(ticketTypesResponse.data[0]._id);
      }
    } catch (error: any) {
      console.error('Error fetching event details:', error);
      if (error.response?.status === 404) {
        toast.error('Event not found');
      } else {
        toast.error('Failed to load event details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSeatSelect = (seatId: string, price: number) => {
    setSelectedSeats(prev => [...prev, seatId]);
  };

  const handleSeatDeselect = (seatId: string) => {
    setSelectedSeats(prev => prev.filter(id => id !== seatId));
  };

  const addToCart = async () => {
    if (!selectedTicketType) {
      toast.error('Please select a ticket type');
      return;
    }

    if (event?.seatmap?.type === 'reserved' && selectedSeats.length === 0) {
      toast.error('Please select seats');
      return;
    }

    try {
      setAddingToCart(true);
      
      const ticketType = ticketTypes.find(tt => tt._id === selectedTicketType);
      if (!ticketType) return;

      if (event?.seatmap?.type === 'reserved') {
        // Add each selected seat as a separate cart item
        for (const seatId of selectedSeats) {
          await api.post(`/cart/add?sessionId=${sessionId}`, {
            ticketTypeId: selectedTicketType,
            quantity: 1,
            seatId,
          });
        }
      } else {
        // General admission - add quantity
        await api.post(`/cart/add?sessionId=${sessionId}`, {
          ticketTypeId: selectedTicketType,
          quantity,
        });
      }

      toast.success('Added to cart!');
      router.push('/cart');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
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

  const getAvailableQuantity = (ticketType: TicketType) => {
    return Math.max(0, ticketType.capacity - ticketType.soldCount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h1>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/events')}>
            Browse Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="secondary">{event.category}</Badge>
            <Badge variant={event.status === 'published' ? 'success' : 'warning'}>
              {event.status}
            </Badge>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
          
          <div className="flex items-center space-x-6 text-gray-600">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(event.startAt)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{event.venue.name}</span>
            </div>
          </div>
        </div>

        {/* Event Image */}
        {event.images && event.images.length > 0 && (
          <div className="mb-8">
            <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl overflow-hidden">
              <img
                src={event.images[0]}
                alt={event.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', event.images[0]);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Details */}
          <div className="space-y-6">
            {/* Description */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this event</h2>
              <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
            </Card>

            {/* Venue Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Venue Information</h2>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{event.venue.name}</p>
                <p className="text-gray-600">{event.venue.address}</p>
                <p className="text-sm text-gray-500">Capacity: {event.venue.capacity.toLocaleString()}</p>
              </div>
            </Card>

            {/* Organizer */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Organizer</h2>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-600">
                    {event.organizerId.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{event.organizerId.name}</p>
                  <p className="text-sm text-gray-500">{event.organizerId.email}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Ticket Selection */}
          <div className="space-y-6">
            {/* Ticket Types */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Tickets</h2>
              
              <div className="space-y-4">
                {ticketTypes.map((ticketType) => {
                  const available = getAvailableQuantity(ticketType);
                  const isSelected = selectedTicketType === ticketType._id;
                  
                  return (
                    <div
                      key={ticketType._id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTicketType(ticketType._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{ticketType.name}</h3>
                          <p className="text-sm text-gray-600">{ticketType.description}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {available} of {ticketType.capacity} available
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ${formatPrice(ticketType.priceCents)}
                          </p>
                          {ticketType.refundable && (
                            <p className="text-xs text-green-600">Refundable</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quantity Selection (for General Admission) */}
              {event.seatmap?.type === 'ga' && selectedTicketType && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max={getAvailableQuantity(ticketTypes.find(tt => tt._id === selectedTicketType)!)}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-20 text-center"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Seat Selection (for Reserved Seating) */}
            {event.seatmap?.type === 'reserved' && selectedTicketType && (
              <SeatMap
                eventId={event._id}
                ticketTypeId={selectedTicketType}
                onSeatSelect={handleSeatSelect}
                onSeatDeselect={handleSeatDeselect}
                selectedSeats={selectedSeats}
                sessionId={sessionId}
              />
            )}

            {/* Add to Cart */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${formatPrice(
                      (ticketTypes.find(tt => tt._id === selectedTicketType)?.priceCents || 0) *
                      (event.seatmap?.type === 'reserved' ? selectedSeats.length : quantity)
                    )}
                  </span>
                </div>
                
                <Button
                  onClick={addToCart}
                  disabled={addingToCart || !selectedTicketType || (event.seatmap?.type === 'reserved' && selectedSeats.length === 0)}
                  className="w-full bg-primary-600 hover:bg-primary-700"
                  size="lg"
                >
                  {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
