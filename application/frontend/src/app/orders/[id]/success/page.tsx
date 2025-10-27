'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import {
  CheckCircle,
  Download,
  Mail,
  Calendar,
  MapPin,
  Ticket,
  ArrowRight,
  QrCode,
} from 'lucide-react';

interface Order {
  _id: string;
  status: string;
  totalCents: number;
  feesCents: number;
  createdAt: string;
  items: Array<{
    ticketTypeId: {
      _id: string;
      name: string;
      event: {
        _id: string;
        title: string;
        startAt: string;
        venue: {
          name: string;
          address: string;
        };
      };
    };
    qty: number;
    priceCents: number;
  }>;
}

interface Ticket {
  _id: string;
  ticketUUID: string;
  status: string;
  pdfUrl?: string;
  qrPayload: string;
}

export default function OrderSuccess() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrderDetails();
    }
  }, [params.id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);

      // Fetch order details
      const orderResponse = await api.get(`/orders/${params.id}`);
      setOrder(orderResponse.data);

      // Fetch tickets for this order
      const ticketsResponse = await api.get(`/tickets/order/${params.id}`);
      setTickets(ticketsResponse.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = async (ticketId: string) => {
    try {
      const response = await api.get(`/tickets/${ticketId}/pdf`);
      if (response.data.pdfUrl) {
        window.open(response.data.pdfUrl, '_blank');
      } else {
        toast.error('PDF not available for this ticket');
      }
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toast.error('Failed to download ticket');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Order Not Found
          </h1>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Your tickets have been confirmed and sent to your email.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Ticket className="h-5 w-5 mr-2" />
                  Order Summary
                </CardTitle>
                <CardDescription>
                  Order #{order._id.slice(-8).toUpperCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {item.ticketTypeId.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.ticketTypeId.event.title}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(item.ticketTypeId.event.startAt)}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {item.ticketTypeId.event.venue.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${formatPrice(item.priceCents)}
                        </p>
                        <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Processing Fee</span>
                      <span>${formatPrice(order.feesCents)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>
                        ${formatPrice(order.totalCents + order.feesCents)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tickets */}
            {tickets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <QrCode className="h-5 w-5 mr-2" />
                    Your Tickets
                  </CardTitle>
                  <CardDescription>
                    Download your tickets or show the QR codes at the event
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket._id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <Ticket className="h-5 w-5 text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">
                              Ticket #
                              {ticket.ticketUUID.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Status:{' '}
                              <Badge
                                variant={
                                  ticket.status === 'issued'
                                    ? 'success'
                                    : 'secondary'
                                }
                              >
                                {ticket.status}
                              </Badge>
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {ticket.pdfUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadTicket(ticket._id)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Show QR code in modal or new window
                              const qrData = `data:image/png;base64,${ticket.qrPayload}`;
                              window.open(qrData, '_blank');
                            }}
                          >
                            <QrCode className="h-4 w-4 mr-1" />
                            QR Code
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        1
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Check your email
                    </p>
                    <p className="text-sm text-gray-500">
                      We've sent your tickets to your email address
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        2
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Download tickets
                    </p>
                    <p className="text-sm text-gray-500">
                      Save your tickets to your phone or print them
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        3
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Arrive at the event
                    </p>
                    <p className="text-sm text-gray-500">
                      Show your QR code or printed ticket at the entrance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={() => router.push('/tickets/manage')}
                className="w-full"
              >
                <Ticket className="h-4 w-4 mr-2" />
                Manage My Tickets
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push('/events')}
                className="w-full"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Browse More Events
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
