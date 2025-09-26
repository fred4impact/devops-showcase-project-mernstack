'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SeatingPlanBuilder } from '@/components/seating-plan/SeatingPlanBuilder';
import { Event } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function SeatingPlanManagement() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${eventId}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSeatingPlan = async (seatmap: any) => {
    try {
      setSaving(true);
      await api.post(`/seating-plan/events/${eventId}/seatmap`, seatmap);
      toast.success('Seating plan saved successfully');
      fetchEvent(); // Refresh event data
    } catch (error) {
      console.error('Error saving seating plan:', error);
      toast.error('Failed to save seating plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSeatingPlan = async () => {
    if (!confirm('Are you sure you want to delete the seating plan? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      await api.delete(`/seating-plan/events/${eventId}/seatmap`);
      toast.success('Seating plan deleted successfully');
      fetchEvent(); // Refresh event data
    } catch (error) {
      console.error('Error deleting seating plan:', error);
      toast.error('Failed to delete seating plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading event...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
              <p className="text-gray-600 mb-6">The event you're looking for doesn't exist.</p>
              <Button onClick={() => router.push('/organizer/events')}>
                Back to Events
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Seating Plan Management</h1>
              <p className="mt-2 text-gray-600">{event.title}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/organizer/events/${eventId}/manage`)}
              >
                Back to Event
              </Button>
            </div>
          </div>
        </div>

        {/* Current Seating Plan Status */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Current Seating Plan</h2>
          {event.seatmap ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Badge variant={event.seatmap.type === 'reserved' ? 'default' : 'secondary'}>
                  {event.seatmap.type === 'reserved' ? 'Reserved Seating' : 'General Admission'}
                </Badge>
                <span className="text-sm text-gray-600">
                  {event.seatmap.seats?.length || 0} seats
                </span>
                <span className="text-sm text-gray-600">
                  {event.seatmap.sections?.length || 0} sections
                </span>
              </div>
              
              {event.seatmap.sections && event.seatmap.sections.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Sections:</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.seatmap.sections.map((section, index) => (
                      <div key={index} className="flex items-center space-x-2">
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

              <div className="flex space-x-2">
                <Button
                  onClick={handleDeleteSeatingPlan}
                  variant="outline"
                  disabled={saving}
                >
                  Delete Seating Plan
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No seating plan configured for this event.</p>
              <p className="text-sm text-gray-500">
                Create a seating plan to enable reserved seating for your event.
              </p>
            </div>
          )}
        </Card>

        {/* Seating Plan Builder */}
        <SeatingPlanBuilder
          eventId={eventId}
          onSave={handleSaveSeatingPlan}
          initialSeatmap={event.seatmap}
        />

        {/* Help Section */}
        <Card className="p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">How to Use the Seating Plan Builder</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <strong>1. Choose Seating Type:</strong> Select between Reserved Seating or General Admission.
            </div>
            <div>
              <strong>2. Create Sections:</strong> Add sections to organize your seating areas (e.g., Orchestra, Balcony).
            </div>
            <div>
              <strong>3. Add Seats:</strong> Click on the canvas to place seats in your selected section.
            </div>
            <div>
              <strong>4. Configure Seats:</strong> Set price modifiers and accessibility options for individual seats.
            </div>
            <div>
              <strong>5. Save:</strong> Click "Generate Plan" to save your seating configuration.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
