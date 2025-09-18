'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
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

export default function OrganizerEvents() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
      fetchEvents();
    }
  }, [user, loading, router]);

  const fetchEvents = async () => {
    try {
      setLoadingData(true);
      const response = await api.get('/events/my-events');
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoadingData(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/events/${eventId}`);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast.error(error.response?.data?.message || 'Failed to delete event');
    }
  };

  const duplicateEvent = async (eventId: string) => {
    try {
      const response = await api.post(`/events/${eventId}/duplicate`);
      toast.success('Event duplicated successfully');
      fetchEvents();
      router.push(`/events/${response.data._id}/manage`);
    } catch (error: any) {
      console.error('Error duplicating event:', error);
      toast.error(error.response?.data?.message || 'Failed to duplicate event');
    }
  };

  const updateEventStatus = async (eventId: string, status: string) => {
    try {
      await api.put(`/events/${eventId}`, { status });
      toast.success('Event status updated');
      fetchEvents();
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast.error(error.response?.data?.message || 'Failed to update event');
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
    if (!event.ticketTypes || !Array.isArray(event.ticketTypes)) {
      return 0;
    }
    return event.ticketTypes.reduce((total, ticketType) => {
      return total + (ticketType.priceCents * ticketType.soldCount);
    }, 0);
  };

  const getTotalTicketsSold = (event: Event) => {
    if (!event.ticketTypes || !Array.isArray(event.ticketTypes)) {
      return 0;
    }
    return event.ticketTypes.reduce((total, ticketType) => {
      return total + ticketType.soldCount;
    }, 0);
  };

  const filteredEvents = (events || []).filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
              <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
              <p className="text-gray-600 mt-2">Manage your events and track performance</p>
            </div>
            <Button
              onClick={() => router.push('/events/create')}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Create New Event
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Create your first event to get started'
              }
            </p>
            <Button
              onClick={() => router.push('/events/create')}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Create Event
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event._id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{event.description}</p>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(event.startAt)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.venue.name}
                    </div>
                  </div>
                  <Badge variant={getStatusColor(event.status)}>
                    {event.status}
                  </Badge>
                </div>

                {/* Event Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">${formatPrice(getTotalRevenue(event))}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{getTotalTicketsSold(event)}</p>
                    <p className="text-xs text-gray-500">Tickets Sold</p>
                  </div>
                </div>

                {/* Ticket Types */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Ticket Types</h4>
                  <div className="space-y-1">
                    {event.ticketTypes.map((ticketType) => (
                      <div key={ticketType._id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{ticketType.name}</span>
                        <span className="text-gray-900">
                          {ticketType.soldCount}/{ticketType.capacity} - ${formatPrice(ticketType.priceCents)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {/* Primary Actions Row */}
                  <div className="flex items-center space-x-2">
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
                    <Button
                      onClick={() => duplicateEvent(event._id)}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      Duplicate
                    </Button>
                  </div>
                  
                  {/* Secondary Actions Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <label className="text-xs text-gray-500">Status:</label>
                      <select
                        value={event.status}
                        onChange={(e) => updateEventStatus(event._id, e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <Button
                      onClick={() => deleteEvent(event._id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                    >
                      Delete
                    </Button>
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
