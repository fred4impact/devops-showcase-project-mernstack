'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Ticket {
  _id: string;
  ticketType: {
    _id: string;
    name: string;
    price: number;
  };
  seatNumber?: string;
  status: string;
  qrCode?: string;
  pdfUrl?: string;
  order: {
    _id: string;
    event: {
      _id: string;
      title: string;
      description: string;
      date: string;
      location: string;
      image?: string;
    };
    totalAmount: number;
    status: string;
  };
}

export default function Tickets() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      // Redirect to the new ticket management page
      router.push('/tickets/manage');
    }
  }, [user, loading, router]);

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const response = await api.get('/tickets/my-tickets');
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoadingTickets(false);
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'valid':
        return 'success';
      case 'used':
        return 'secondary';
      case 'cancelled':
        return 'error';
      default:
        return 'warning';
    }
  };

  const downloadTicket = (ticket: Ticket) => {
    if (ticket.pdfUrl) {
      window.open(ticket.pdfUrl, '_blank');
    } else {
      toast.error('PDF not available for this ticket');
    }
  };

  if (loading || loadingTickets) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-gray-600 mt-2">
            View and manage your event tickets
          </p>
        </div>

        {tickets.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-gray-500 mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tickets yet
            </h3>
            <p className="text-gray-500 mb-6">
              You haven't purchased any tickets yet. Start exploring events!
            </p>
            <Button
              onClick={() => router.push('/events')}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Browse Events
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <Card key={ticket._id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {ticket.order.event.title}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {ticket.order.event.description}
                        </p>

                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {formatDate(ticket.order.event.date)}
                        </div>

                        <div className="flex items-center text-sm text-gray-500">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {ticket.order.event.location}
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                        <Badge variant={getStatusColor(ticket.order.status)}>
                          {ticket.order.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Ticket Type
                        </label>
                        <p className="text-gray-900">
                          {ticket.ticketType.name}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Price
                        </label>
                        <p className="text-gray-900">
                          ${ticket.ticketType.price.toFixed(2)}
                        </p>
                      </div>
                      {ticket.seatNumber && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Seat
                          </label>
                          <p className="text-gray-900">{ticket.seatNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
                    {ticket.pdfUrl && (
                      <Button
                        onClick={() => downloadTicket(ticket)}
                        variant="outline"
                        className="w-full lg:w-auto"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Download PDF
                      </Button>
                    )}

                    {ticket.qrCode && (
                      <Button
                        onClick={() => {
                          // Show QR code in modal or new window
                          window.open(
                            `data:image/png;base64,${ticket.qrCode}`,
                            '_blank',
                          );
                        }}
                        variant="outline"
                        className="w-full lg:w-auto"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                          />
                        </svg>
                        View QR Code
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
