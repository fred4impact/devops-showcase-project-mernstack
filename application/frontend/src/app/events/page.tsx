'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Search,
  Filter,
  Grid,
  List,
} from 'lucide-react';
import { eventsApi } from '@/lib/api';
import { Event } from '@/types';
import { formatDate, formatDateTime, formatPrice, getImageUrl } from '@/lib/utils';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = [
    'All',
    'Music',
    'Sports',
    'Technology',
    'Business',
    'Education',
    'Arts',
    'Festival',
    'Food & Drink',
    'Health & Fitness',
    'Other',
  ];

  useEffect(() => {
    loadEvents();
  }, [searchTerm, category]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.location = searchTerm;
      if (category && category !== 'All') params.category = category;

      const response = await eventsApi.getEvents(params);
      setEvents(response.data.events);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="success">Live</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'cancelled':
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="hover:shadow-lg transition-all duration-300 group">
      <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 rounded-t-xl flex items-center justify-center">
        {event.images && event.images.length > 0 && getImageUrl(event.images[0]) ? (
          <img
            src={getImageUrl(event.images[0]) || ''}
            alt={event.title}
            className="w-full h-full object-cover rounded-t-xl"
            onError={(e) => {
              console.error('Image failed to load:', event.images[0]);
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <Calendar className="w-16 h-16 text-primary-400" />
        )}
      </div>

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl group-hover:text-primary-600 transition-colors">
              {event.title}
            </CardTitle>
            <CardDescription className="mt-2 line-clamp-2">
              {event.description}
            </CardDescription>
          </div>
          {getEventStatusBadge(event.status)}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-secondary-600">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDateTime(event.startAt)}
          </div>

          <div className="flex items-center text-sm text-secondary-600">
            <MapPin className="w-4 h-4 mr-2" />
            {event.venue.name}
          </div>

          <div className="flex items-center text-sm text-secondary-600">
            <Users className="w-4 h-4 mr-2" />
            {event.venue.capacity.toLocaleString()} capacity
          </div>

          <div className="pt-4">
            <Link href={`/events/${event.slug}`}>
              <Button className="w-full">View Details</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EventListItem = ({ event }: { event: Event }) => (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {event.images && event.images.length > 0 ? (
              <img
                src={getImageUrl(event.images[0]) || ''}
                alt={event.title}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  console.error('Image failed to load:', event.images[0]);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <Calendar className="w-8 h-8 text-primary-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  {event.title}
                </h3>
                <p className="text-secondary-600 mb-3 line-clamp-2">
                  {event.description}
                </p>
              </div>
              {getEventStatusBadge(event.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-secondary-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDateTime(event.startAt)}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {event.venue.name}
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                {event.venue.capacity.toLocaleString()} capacity
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <Link href={`/events/${event.slug}`}>
              <Button>View Details</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-secondary-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6">
                  <div className="h-48 bg-secondary-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-4">
            Discover Events
          </h1>
          <p className="text-lg text-secondary-600">
            Find amazing events happening near you
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex gap-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <div className="flex border border-secondary-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-secondary-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-secondary-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Events Grid/List */}
        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              No events found
            </h3>
            <p className="text-secondary-600">
              Try adjusting your search criteria or check back later for new
              events.
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {events.map((event) =>
              viewMode === 'grid' ? (
                <EventCard key={event._id} event={event} />
              ) : (
                <EventListItem key={event._id} event={event} />
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
