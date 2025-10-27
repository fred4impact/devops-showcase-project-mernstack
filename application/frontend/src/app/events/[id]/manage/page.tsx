'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
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
    sections?: Array<{
      name: string;
      color: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }>;
    width?: number;
    height?: number;
    stageLabel?: string;
  };
}

export default function EventManagement() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showSeatForm, setShowSeatForm] = useState(false);
  const [editingTicketType, setEditingTicketType] = useState<string | null>(
    null,
  );

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    category: '',
    startAt: '',
    endAt: '',
    status: '',
    venue: {
      name: '',
      address: '',
      capacity: 0,
      timezone: 'UTC',
    },
  });

  const [ticketForm, setTicketForm] = useState({
    name: '',
    description: '',
    priceCents: 0,
    capacity: 0,
    salesStart: '',
    salesEnd: '',
    refundable: true,
  });

  const [seatForm, setSeatForm] = useState({
    type: 'ga' as 'reserved' | 'ga',
    sections: [] as Array<{
      name: string;
      rows: number;
      seatsPerRow: number;
      priceModifier: number;
    }>,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && user.role !== 'organizer') {
      router.push('/dashboard');
      return;
    }

    if (params.id) {
      fetchEventData();
    }
  }, [params.id, user, loading, router]);

  const fetchEventData = async () => {
    try {
      setLoadingData(true);
      const [eventResponse, ticketTypesResponse] = await Promise.all([
        api.get(`/events/${params.id}`),
        api.get(`/ticket-types/event/${params.id}`),
      ]);

      setEvent(eventResponse.data);
      setTicketTypes(ticketTypesResponse.data);

      // Populate form with event data
      setEventForm({
        title: eventResponse.data.title,
        description: eventResponse.data.description,
        category: eventResponse.data.category,
        startAt: new Date(eventResponse.data.startAt)
          .toISOString()
          .slice(0, 16),
        endAt: new Date(eventResponse.data.endAt).toISOString().slice(0, 16),
        status: eventResponse.data.status,
        venue: eventResponse.data.venue,
      });
    } catch (error) {
      console.error('Error fetching event data:', error);
      toast.error('Failed to load event data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleEventUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/events/${params.id}`, eventForm);
      toast.success('Event updated successfully');
      setIsEditing(false);
      fetchEventData();
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast.error(error.response?.data?.message || 'Failed to update event');
    }
  };

  const handleTicketCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!ticketForm.name || !ticketForm.priceCents || !ticketForm.capacity) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!ticketForm.salesStart || !ticketForm.salesEnd) {
      toast.error('Please select both sales start and end dates');
      return;
    }

    try {
      // Convert datetime-local format to ISO 8601
      const formData = {
        ...ticketForm,
        salesStart: ticketForm.salesStart
          ? new Date(ticketForm.salesStart).toISOString()
          : '',
        salesEnd: ticketForm.salesEnd
          ? new Date(ticketForm.salesEnd).toISOString()
          : '',
      };

      if (editingTicketType) {
        await api.put(`/ticket-types/${editingTicketType}`, formData);
        toast.success('Ticket type updated successfully');
        setEditingTicketType(null);
      } else {
        await api.post(`/ticket-types/event/${params.id}`, formData);
        toast.success('Ticket type created successfully');
      }
      setShowTicketForm(false);
      setTicketForm({
        name: '',
        description: '',
        priceCents: 0,
        capacity: 0,
        salesStart: '',
        salesEnd: '',
        refundable: true,
      });
      fetchEventData();
    } catch (error: any) {
      console.error('Error creating/updating ticket type:', error);
      toast.error(
        error.response?.data?.message || 'Failed to create/update ticket type',
      );
    }
  };

  const handleTicketEdit = (ticketType: TicketType) => {
    setEditingTicketType(ticketType._id);
    setTicketForm({
      name: ticketType.name,
      description: ticketType.description,
      priceCents: ticketType.priceCents,
      capacity: ticketType.capacity,
      salesStart: ticketType.salesStart
        ? new Date(ticketType.salesStart).toISOString().slice(0, 16)
        : '',
      salesEnd: ticketType.salesEnd
        ? new Date(ticketType.salesEnd).toISOString().slice(0, 16)
        : '',
      refundable: ticketType.refundable,
    });
    setShowTicketForm(true);
  };

  const handleTicketDelete = async (ticketTypeId: string) => {
    if (!confirm('Are you sure you want to delete this ticket type?')) {
      return;
    }

    try {
      await api.delete(`/ticket-types/${ticketTypeId}`);
      toast.success('Ticket type deleted successfully');
      fetchEventData();
    } catch (error: any) {
      console.error('Error deleting ticket type:', error);
      toast.error(
        error.response?.data?.message || 'Failed to delete ticket type',
      );
    }
  };

  const handleSeatmapSave = async () => {
    try {
      if (seatForm.type === 'ga') {
        // For general admission, just save the type
        await api.put(`/events/${params.id}`, {
          seatmap: { type: 'ga' },
        });
      } else {
        // For reserved seating, generate seats from sections
        const seats: any[] = [];
        seatForm.sections.forEach((section) => {
          for (let row = 1; row <= section.rows; row++) {
            for (let seat = 1; seat <= section.seatsPerRow; seat++) {
              seats.push({
                seatId: `${section.name}-${row}-${seat}`,
                section: section.name,
                row: row.toString(),
                number: seat.toString(),
                priceModifier: section.priceModifier,
                accessible: false,
              });
            }
          }
        });

        await api.put(`/events/${params.id}`, {
          seatmap: {
            type: 'reserved',
            seats: seats,
          },
        });
      }

      toast.success('Seating configuration saved successfully');
      setShowSeatForm(false);
      fetchEventData();
    } catch (error: any) {
      console.error('Error saving seatmap:', error);
      toast.error(
        error.response?.data?.message || 'Failed to save seating configuration',
      );
    }
  };

  const handleSeatmapDelete = async () => {
    if (
      !confirm('Are you sure you want to remove the seating configuration?')
    ) {
      return;
    }

    try {
      await api.put(`/events/${params.id}`, {
        seatmap: null,
      });
      toast.success('Seating configuration removed');
      fetchEventData();
    } catch (error: any) {
      console.error('Error removing seatmap:', error);
      toast.error(
        error.response?.data?.message ||
          'Failed to remove seating configuration',
      );
    }
  };

  const handleEventStatusUpdate = async (status: string) => {
    try {
      await api.put(`/events/${params.id}`, { status });
      toast.success(`Event ${status} successfully`);
      fetchEventData();
    } catch (error: any) {
      console.error('Error updating event status:', error);
      toast.error(
        error.response?.data?.message || 'Failed to update event status',
      );
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

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'organizer' || !event) {
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
                {event.title}
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your event details, tickets, and seating
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={getStatusColor(event.status)}>
                {event.status}
              </Badge>
              <Button
                onClick={() => router.push(`/events/${params.id}`)}
                variant="outline"
              >
                View Public Page
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'tickets', name: 'Ticket Types' },
              { id: 'seating', name: 'Seating' },
              { id: 'analytics', name: 'Analytics' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Event Details */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Event Details
                </h2>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>

              {isEditing ? (
                <form onSubmit={handleEventUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Title *
                      </label>
                      <Input
                        value={eventForm.title}
                        onChange={(e) =>
                          setEventForm((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={eventForm.category}
                        onChange={(e) =>
                          setEventForm((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      >
                        <option value="">Select category</option>
                        <option value="conference">Conference</option>
                        <option value="workshop">Workshop</option>
                        <option value="concert">Concert</option>
                        <option value="festival">Festival</option>
                        <option value="sports">Sports</option>
                        <option value="networking">Networking</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date & Time *
                      </label>
                      <Input
                        type="datetime-local"
                        value={eventForm.startAt}
                        onChange={(e) =>
                          setEventForm((prev) => ({
                            ...prev,
                            startAt: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date & Time *
                      </label>
                      <Input
                        type="datetime-local"
                        value={eventForm.endAt}
                        onChange={(e) =>
                          setEventForm((prev) => ({
                            ...prev,
                            endAt: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={eventForm.status}
                        onChange={(e) =>
                          setEventForm((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Venue Name
                      </label>
                      <Input
                        value={eventForm.venue.name}
                        onChange={(e) =>
                          setEventForm((prev) => ({
                            ...prev,
                            venue: { ...prev.venue, name: e.target.value },
                          }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Venue Address
                      </label>
                      <Input
                        value={eventForm.venue.address}
                        onChange={(e) =>
                          setEventForm((prev) => ({
                            ...prev,
                            venue: { ...prev.venue, address: e.target.value },
                          }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Venue Capacity
                      </label>
                      <Input
                        type="number"
                        value={eventForm.venue.capacity}
                        onChange={(e) =>
                          setEventForm((prev) => ({
                            ...prev,
                            venue: {
                              ...prev.venue,
                              capacity: parseInt(e.target.value) || 0,
                            },
                          }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={eventForm.venue.timezone}
                        onChange={(e) =>
                          setEventForm((prev) => ({
                            ...prev,
                            venue: { ...prev.venue, timezone: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">
                          Pacific Time
                        </option>
                        <option value="Europe/London">London</option>
                        <option value="Europe/Paris">Paris</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={eventForm.description}
                      onChange={(e) =>
                        setEventForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button type="submit">Save Changes</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Event Title
                      </label>
                      <p className="text-gray-900">{event.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <p className="text-gray-900">{event.category}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Start Date
                      </label>
                      <p className="text-gray-900">
                        {formatDate(event.startAt)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        End Date
                      </label>
                      <p className="text-gray-900">{formatDate(event.endAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <Badge variant={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Venue Name
                      </label>
                      <p className="text-gray-900">{event.venue.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Venue Address
                      </label>
                      <p className="text-gray-900">{event.venue.address}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Venue Capacity
                      </label>
                      <p className="text-gray-900">
                        {event.venue.capacity.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Timezone
                      </label>
                      <p className="text-gray-900">{event.venue.timezone}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <p className="text-gray-900 whitespace-pre-line">
                      {event.description}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Ticket Types
                </h2>
                <Button
                  onClick={() => setShowTicketForm(!showTicketForm)}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  Add Ticket Type
                </Button>
              </div>

              {showTicketForm && (
                <form
                  onSubmit={handleTicketCreate}
                  className="mb-6 p-4 border border-gray-200 rounded-lg"
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingTicketType
                      ? 'Edit Ticket Type'
                      : 'Create New Ticket Type'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                      </label>
                      <Input
                        value={ticketForm.name}
                        onChange={(e) =>
                          setTicketForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price ($) *
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={ticketForm.priceCents / 100}
                        onChange={(e) =>
                          setTicketForm((prev) => ({
                            ...prev,
                            priceCents: Math.round(
                              parseFloat(e.target.value) * 100,
                            ),
                          }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity *
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={ticketForm.capacity}
                        onChange={(e) =>
                          setTicketForm((prev) => ({
                            ...prev,
                            capacity: parseInt(e.target.value) || 0,
                          }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sales Start Date
                      </label>
                      <Input
                        type="datetime-local"
                        value={ticketForm.salesStart}
                        onChange={(e) =>
                          setTicketForm((prev) => ({
                            ...prev,
                            salesStart: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sales End Date
                      </label>
                      <Input
                        type="datetime-local"
                        value={ticketForm.salesEnd}
                        onChange={(e) =>
                          setTicketForm((prev) => ({
                            ...prev,
                            salesEnd: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={ticketForm.refundable}
                        onChange={(e) =>
                          setTicketForm((prev) => ({
                            ...prev,
                            refundable: e.target.checked,
                          }))
                        }
                        className="mr-2"
                      />
                      <label className="text-sm text-gray-700">
                        Refundable
                      </label>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={ticketForm.description}
                      onChange={(e) =>
                        setTicketForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="flex items-center space-x-4 mt-4">
                    <Button type="submit">
                      {editingTicketType
                        ? 'Update Ticket Type'
                        : 'Create Ticket Type'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowTicketForm(false);
                        setEditingTicketType(null);
                        setTicketForm({
                          name: '',
                          description: '',
                          priceCents: 0,
                          capacity: 0,
                          salesStart: '',
                          salesEnd: '',
                          refundable: true,
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {ticketTypes.map((ticketType) => (
                  <div
                    key={ticketType._id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {ticketType.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {ticketType.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>
                            Price: ${formatPrice(ticketType.priceCents)}
                          </span>
                          <span>Capacity: {ticketType.capacity}</span>
                          <span>Sold: {ticketType.soldCount}</span>
                          <span>
                            Available:{' '}
                            {ticketType.capacity - ticketType.soldCount}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleTicketEdit(ticketType)}
                          variant="outline"
                          size="sm"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleTicketDelete(ticketType._id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'seating' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Seating Configuration
                </h2>
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() =>
                      router.push(`/organizer/events/${params.id}/seating-plan`)
                    }
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    {event.seatmap
                      ? 'Manage Seating Plan'
                      : 'Create Seating Plan'}
                  </Button>
                </div>
              </div>

              {/* Current Seating Plan Status */}
              <div className="mb-6">
                {event.seatmap ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Badge
                        variant={
                          event.seatmap.type === 'reserved'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {event.seatmap.type === 'reserved'
                          ? 'Reserved Seating'
                          : 'General Admission'}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {event.seatmap.seats?.length || 0} seats
                      </span>
                      <span className="text-sm text-gray-600">
                        {event.seatmap.sections?.length || 0} sections
                      </span>
                    </div>

                    {event.seatmap.sections &&
                      event.seatmap.sections.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">
                            Sections:
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {event.seatmap.sections.map((section, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2"
                              >
                                <div
                                  className="w-4 h-4 rounded"
                                  style={{ backgroundColor: section.color }}
                                />
                                <span className="text-sm">{section.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      No seating plan configured for this event.
                    </p>
                    <p className="text-sm text-gray-500">
                      Create a seating plan to enable reserved seating for your
                      event.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 6v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-6V7a2 2 0 00-2-2H5z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total Tickets Sold
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {ticketTypes.reduce(
                        (sum, type) => sum + type.soldCount,
                        0,
                      )}
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
                    <p className="text-sm font-medium text-gray-500">Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      $
                      {ticketTypes.reduce(
                        (sum, type) => sum + type.soldCount * type.priceCents,
                        0,
                      ) / 100}
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
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Available Tickets
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {ticketTypes.reduce(
                        (sum, type) => sum + (type.capacity - type.soldCount),
                        0,
                      )}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-purple-600"
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
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Conversion Rate
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {ticketTypes.length > 0
                        ? Math.round(
                            (ticketTypes.reduce(
                              (sum, type) => sum + type.soldCount,
                              0,
                            ) /
                              ticketTypes.reduce(
                                (sum, type) => sum + type.capacity,
                                0,
                              )) *
                              100,
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Ticket Type Performance */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Ticket Type Performance
              </h2>
              <div className="space-y-4">
                {ticketTypes.map((ticketType) => {
                  const soldPercentage =
                    (ticketType.soldCount / ticketType.capacity) * 100;
                  return (
                    <div
                      key={ticketType._id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">
                          {ticketType.name}
                        </h3>
                        <div className="text-sm text-gray-500">
                          {ticketType.soldCount} / {ticketType.capacity} sold
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${Math.min(soldPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>${formatPrice(ticketType.priceCents)} each</span>
                        <span>
                          $
                          {formatPrice(
                            ticketType.soldCount * ticketType.priceCents,
                          )}{' '}
                          total
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Sales Timeline */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Sales Timeline
              </h2>
              <div className="text-center py-12">
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sales Timeline Coming Soon
                </h3>
                <p className="text-gray-500">
                  Track your sales performance over time with detailed charts
                  and insights
                </p>
              </div>
            </Card>

            {/* Event Status Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Event Status Management
              </h2>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => handleEventStatusUpdate('published')}
                  disabled={event.status === 'published'}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
                >
                  {event.status === 'published' ? 'Published' : 'Publish Event'}
                </Button>
                <Button
                  onClick={() => handleEventStatusUpdate('draft')}
                  disabled={event.status === 'draft'}
                  variant="outline"
                >
                  {event.status === 'draft' ? 'Draft' : 'Unpublish Event'}
                </Button>
                <Button
                  onClick={() => handleEventStatusUpdate('cancelled')}
                  disabled={event.status === 'cancelled'}
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {event.status === 'cancelled' ? 'Cancelled' : 'Cancel Event'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
