'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  venue: {
    name: string;
    address: string;
    capacity: number;
  };
  startAt: string;
  endAt: string;
  status: string;
  images: string[];
  ticketTypes: Array<{
    _id: string;
    name: string;
    priceCents: number;
    capacity: number;
    soldCount: number;
  }>;
}

interface EventStats {
  totalEvents: number;
  totalRevenue: number;
  totalTicketsSold: number;
  averageTicketPrice: number;
  upcomingEvents: number;
  recentOrders: Array<{
    _id: string;
    customerName: string;
    eventTitle: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
}

export default function OrganizerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && user.role !== 'organizer') {
      router.push('/dashboard');
      return;
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user, loading, router]);

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true);

      const [eventsResponse, statsResponse] = await Promise.all([
        api.get('/events/my-events'),
        api.get('/orders/stats/overview').catch(() => ({
          data: { totalOrders: 0, totalRevenue: 0, totalTickets: 0 },
        })),
      ]);

      setEvents(eventsResponse.data.events || eventsResponse.data);

      // Handle the stats response structure
      const statsData = statsResponse.data;
      setStats({
        totalEvents:
          eventsResponse.data.events?.length ||
          eventsResponse.data?.length ||
          0,
        totalRevenue: statsData.totalRevenue || 0,
        totalTicketsSold: statsData.totalTickets || 0,
        averageTicketPrice:
          statsData.totalTickets > 0
            ? statsData.totalRevenue / statsData.totalTickets
            : 0,
        upcomingEvents:
          eventsResponse.data.events?.filter(
            (event: Event) => new Date(event.startAt) > new Date(),
          ).length || 0,
        recentOrders: [],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');

      // Set default values on error
      setStats({
        totalEvents: 0,
        totalRevenue: 0,
        totalTicketsSold: 0,
        averageTicketPrice: 0,
        upcomingEvents: 0,
        recentOrders: [],
      });
    } finally {
      setLoadingData(false);
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
      case 'active':
        return 'success';
      case 'draft':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const getTotalRevenue = (event: Event) => {
    return event.ticketTypes.reduce((total, ticketType) => {
      return total + ticketType.priceCents * ticketType.soldCount;
    }, 0);
  };

  const getTotalTicketsSold = (event: Event) => {
    return event.ticketTypes.reduce((total, ticketType) => {
      return total + ticketType.soldCount;
    }, 0);
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'organizer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Organizer Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your events and track your performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push('/organizer/analytics')}
                variant="outline"
              >
                View Analytics
              </Button>
              <Button
                onClick={() => router.push('/events/create')}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Create Event
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push('/events/create')}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Create Event</h3>
                <p className="text-sm text-gray-600">Start a new event</p>
              </div>
            </div>
          </Card>

          <Card
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push('/organizer/events')}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-green-600"
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
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">My Events</h3>
                <p className="text-sm text-gray-600">Manage your events</p>
              </div>
            </div>
          </Card>

          <Card
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push('/organizer/analytics')}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Analytics</h3>
                <p className="text-sm text-gray-600">
                  View performance insights
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-primary-600"
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
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total Events
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalEvents}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${formatPrice(stats.totalRevenue)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
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
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Tickets Sold
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalTicketsSold}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-yellow-600"
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
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Upcoming Events
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.upcomingEvents}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Events */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">My Events</h2>
              <Button
                onClick={() => router.push('/events/create')}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Create Event
              </Button>
            </div>

            {events.length === 0 ? (
              <Card className="p-6 text-center">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No events yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Create your first event to get started
                </p>
                <Button
                  onClick={() => router.push('/events/create')}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  Create Event
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event._id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {event.title}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {event.description}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <svg
                            className="w-4 h-4 mr-1"
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
                          {formatDate(event.startAt)}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <svg
                            className="w-4 h-4 mr-1"
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
                          {event.venue.name}
                        </div>
                        <div className="mt-3 flex items-center space-x-4 text-sm">
                          <span className="text-gray-600">
                            Revenue:{' '}
                            <span className="font-medium text-green-600">
                              ${formatPrice(getTotalRevenue(event))}
                            </span>
                          </span>
                          <span className="text-gray-600">
                            Sold:{' '}
                            <span className="font-medium">
                              {getTotalTicketsSold(event)}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col items-end space-y-2">
                        <Badge variant={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                        <Button
                          onClick={() =>
                            router.push(`/events/${event._id}/manage`)
                          }
                          variant="outline"
                          size="sm"
                        >
                          Manage
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Orders
              </h2>
              <Button
                onClick={() => router.push('/organizer/orders')}
                variant="outline"
              >
                View All
              </Button>
            </div>

            {stats?.recentOrders && stats.recentOrders.length === 0 ? (
              <Card className="p-6 text-center">
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
                  No orders yet
                </h3>
                <p className="text-gray-500">
                  Orders will appear here once customers start purchasing
                  tickets
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {stats?.recentOrders?.map((order) => (
                  <Card key={order._id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {order.customerName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {order.eventTitle}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${formatPrice(order.totalAmount)}
                        </p>
                        <Badge variant={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
