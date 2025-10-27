'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { eventsApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CreateEvent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    category: '',
    startAt: '',
    endAt: '',
    venue: {
      name: '',
      address: '',
      capacity: 0,
      timezone: 'UTC',
    },
    images: [],
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }
  }, [user, loading, router]);

  // Show upgrade message for non-organizers
  if (user && user.role !== 'organizer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="mx-auto h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="h-12 w-12 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Upgrade Required
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              To create events, you need to upgrade to an organizer account.
            </p>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Organizer Benefits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Create Events</h3>
                    <p className="text-sm text-gray-600">
                      Set up events with custom details and settings
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Manage Tickets
                    </h3>
                    <p className="text-sm text-gray-600">
                      Create and manage different ticket types
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Track Sales</h3>
                    <p className="text-sm text-gray-600">
                      Monitor ticket sales and revenue
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Analytics</h3>
                    <p className="text-sm text-gray-600">
                      Get insights into your event performance
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/profile')}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3"
              >
                Upgrade to Organizer
              </Button>
              <Button
                onClick={() => router.push('/events')}
                variant="outline"
                className="px-8 py-3"
              >
                Browse Events
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.title ||
      !formData.slug ||
      !formData.description ||
      !formData.category
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.startAt || !formData.endAt) {
      toast.error('Please select start and end dates');
      return;
    }

    if (!formData.venue.name || !formData.venue.address) {
      toast.error('Please fill in venue information');
      return;
    }

    try {
      setIsSubmitting(true);

      const eventData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        category: formData.category,
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString(),
        venue: {
          name: formData.venue.name,
          address: formData.venue.address,
          capacity: formData.venue.capacity,
          timezone: formData.venue.timezone,
        },
        images: formData.images,
      };

      const response = await eventsApi.createEvent(eventData);

      // Upload image if selected
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);

        try {
          console.log('Uploading image for event:', response.data._id);
          const imageResponse = await eventsApi.uploadEventImage(
            response.data._id,
            formData,
          );
          console.log('Image upload response:', imageResponse);
          toast.success('Event and image created successfully!');
        } catch (imageError) {
          console.error('Error uploading image:', imageError);
          toast.error('Event created but image upload failed');
        }
      } else {
        toast.success('Event created successfully!');
      }

      router.push(`/events/${response.data._id}`);
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-600 mt-2">
            Fill in the details below to create your event
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Event Title *
                </label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter event title"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="slug"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Event Slug *
                </label>
                <Input
                  id="slug"
                  name="slug"
                  type="text"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  placeholder="event-slug-url"
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL-friendly identifier (5-50 characters)
                </p>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe your event (20-1000 characters)"
                />
              </div>

              <div>
                <label
                  htmlFor="startAt"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Start Date & Time *
                </label>
                <Input
                  id="startAt"
                  name="startAt"
                  type="datetime-local"
                  value={formData.startAt}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="endAt"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  End Date & Time *
                </label>
                <Input
                  id="endAt"
                  name="endAt"
                  type="datetime-local"
                  value={formData.endAt}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
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

              <div className="md:col-span-2">
                <label
                  htmlFor="image"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Event Image/Poster
                </label>
                <div className="space-y-4">
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img
                        src={imagePreview}
                        alt="Event preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Venue Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Venue Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label
                  htmlFor="venue.name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Venue Name *
                </label>
                <Input
                  id="venue.name"
                  name="venue.name"
                  type="text"
                  value={formData.venue.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      venue: { ...prev.venue, name: e.target.value },
                    }))
                  }
                  required
                  placeholder="e.g., Convention Center"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="venue.address"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Address *
                </label>
                <Input
                  id="venue.address"
                  name="venue.address"
                  type="text"
                  value={formData.venue.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      venue: { ...prev.venue, address: e.target.value },
                    }))
                  }
                  required
                  placeholder="Full address including city, state, country"
                />
              </div>

              <div>
                <label
                  htmlFor="venue.capacity"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Capacity
                </label>
                <Input
                  id="venue.capacity"
                  name="venue.capacity"
                  type="number"
                  value={formData.venue.capacity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      venue: {
                        ...prev.venue,
                        capacity: parseInt(e.target.value) || 0,
                      },
                    }))
                  }
                  placeholder="Maximum attendees"
                />
              </div>

              <div>
                <label
                  htmlFor="venue.timezone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Timezone
                </label>
                <select
                  id="venue.timezone"
                  name="venue.timezone"
                  value={formData.venue.timezone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      venue: { ...prev.venue, timezone: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Note about ticket types */}
          <Card className="p-6">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ticket Types
              </h3>
              <p className="text-gray-600 mb-4">
                You can add ticket types after creating your event. This allows
                you to set up different pricing tiers and availability.
              </p>
              <p className="text-sm text-gray-500">
                After creating the event, you&apos;ll be able to manage ticket types
                from the event management page.
              </p>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-600 hover:bg-primary-700"
            >
              {isSubmitting ? 'Creating Event...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
