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

interface AnalyticsData {
  totalEvents: number;
  totalRevenue: number;
  totalTicketsSold: number;
  averageTicketPrice: number;
  topPerformingEvents: Event[];
  recentEvents: Event[];
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
  ticketSalesByCategory: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
}

export default function OrganizerAnalytics() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');

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
      fetchAnalyticsData();
    }
  }, [user, loading, router, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoadingData(true);
      
      // For now, we'll create mock data since the analytics endpoint doesn't exist yet
      // In a real app, you'd call: const response = await api.get(`/analytics/organizer?timeRange=${timeRange}`);
      
      const mockAnalyticsData: AnalyticsData = {
        totalEvents: 0,
        totalRevenue: 0,
        totalTicketsSold: 0,
        averageTicketPrice: 0,
        topPerformingEvents: [],
        recentEvents: [],
        revenueByMonth: [],
        ticketSalesByCategory: []
      };
      
      setAnalyticsData(mockAnalyticsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoadingData(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'secondary';
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Event Analytics</h1>
              <p className="text-gray-600 mt-2">Track your event performance and insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
                <option value="all">All Time</option>
              </select>
              <Button
                onClick={() => router.push('/events/create')}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Create New Event
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        {analyticsData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Events</p>
                  <p className="text-2xl font-semibold text-gray-900">{analyticsData.totalEvents}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">${formatPrice(analyticsData.totalRevenue)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 6v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-6V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tickets Sold</p>
                  <p className="text-2xl font-semibold text-gray-900">{analyticsData.totalTicketsSold}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg. Ticket Price</p>
                  <p className="text-2xl font-semibold text-gray-900">${formatPrice(analyticsData.averageTicketPrice)}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performing Events */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Performing Events</h2>
            <div className="space-y-4">
              {analyticsData?.topPerformingEvents.map((event, index) => {
                const totalRevenue = event.ticketTypes.reduce((sum, type) => sum + (type.priceCents * type.soldCount), 0);
                const totalTickets = event.ticketTypes.reduce((sum, type) => sum + type.soldCount, 0);
                
                return (
                  <div key={event._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <Badge variant={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{formatDate(event.startAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">${formatPrice(totalRevenue)}</p>
                      <p className="text-sm text-gray-500">{totalTickets} tickets</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Revenue by Category */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Revenue by Category</h2>
            <div className="space-y-4">
              {analyticsData?.ticketSalesByCategory.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                    <span className="text-sm font-medium text-gray-900">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">${formatPrice(category.revenue)}</p>
                    <p className="text-xs text-gray-500">{category.count} events</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Events */}
        <Card className="p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Events</h2>
            <Button
              onClick={() => router.push('/organizer/events')}
              variant="outline"
            >
              View All Events
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyticsData?.recentEvents.map((event) => {
              const totalRevenue = event.ticketTypes.reduce((sum, type) => sum + (type.priceCents * type.soldCount), 0);
              const totalTickets = event.ticketTypes.reduce((sum, type) => sum + type.soldCount, 0);
              
              return (
                <div key={event._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-gray-900 line-clamp-2">{event.title}</h3>
                    <Badge variant={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{formatDate(event.startAt)}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{totalTickets} tickets</span>
                    <span className="font-semibold text-gray-900">${formatPrice(totalRevenue)}</span>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <Button
                      onClick={() => router.push(`/events/${event._id}/manage`)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Manage
                    </Button>
                    <Button
                      onClick={() => router.push(`/events/${event._id}`)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      View
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
