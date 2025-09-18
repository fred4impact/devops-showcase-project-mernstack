'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { X, AlertTriangle, DollarSign } from 'lucide-react';

interface TicketRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: any;
  onSuccess: () => void;
}

const REFUND_REASONS = [
  { value: 'cancelled_event', label: 'Event Cancelled' },
  { value: 'personal_reasons', label: 'Personal Reasons' },
  { value: 'duplicate_purchase', label: 'Duplicate Purchase' },
  { value: 'technical_issue', label: 'Technical Issue' },
  { value: 'other', label: 'Other' },
];

export function TicketRefundModal({ isOpen, onClose, ticket, onSuccess }: TicketRefundModalProps) {
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason) {
      toast.error('Please select a refund reason');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post(`/tickets/${ticket._id}/refund`, formData);
      toast.success('Refund request submitted successfully');
      onSuccess();
      onClose();
      setFormData({ reason: '', description: '' });
    } catch (error: any) {
      console.error('Error requesting refund:', error);
      toast.error(error.response?.data?.message || 'Failed to submit refund request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ reason: '', description: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Request Refund</h2>
          <Button
            onClick={handleClose}
            variant="outline"
            size="sm"
            className="p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">{ticket?.eventId?.title}</h3>
          <p className="text-sm text-gray-600">{ticket?.ticketTypeId?.name}</p>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <DollarSign className="w-4 h-4 mr-1" />
            ${(ticket?.ticketTypeId?.priceCents / 100).toFixed(2)}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Reason *
            </label>
            <select
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">Select a reason</option>
              {REFUND_REASONS.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Please provide more details about your refund request..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Submitting...' : 'Request Refund'}
            </Button>
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Refund Policy</p>
              <p>Refund requests are subject to the event organizer's refund policy. 
              You will be notified once your request is reviewed.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
