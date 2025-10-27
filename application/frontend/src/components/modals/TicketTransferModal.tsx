'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { X, User, Mail, MessageSquare } from 'lucide-react';

interface TicketTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: any;
  onSuccess: () => void;
}

export function TicketTransferModal({
  isOpen,
  onClose,
  ticket,
  onSuccess,
}: TicketTransferModalProps) {
  const [formData, setFormData] = useState({
    recipientEmail: '',
    recipientName: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.recipientEmail) {
      toast.error('Recipient email is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.put(`/tickets/${ticket._id}/transfer`, formData);
      toast.success('Ticket transferred successfully');
      onSuccess();
      onClose();
      setFormData({ recipientEmail: '', recipientName: '', message: '' });
    } catch (error: any) {
      console.error('Error transferring ticket:', error);
      toast.error(error.response?.data?.message || 'Failed to transfer ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ recipientEmail: '', recipientName: '', message: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Transfer Ticket
          </h2>
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
          <h3 className="font-medium text-gray-900 mb-2">
            {ticket?.eventId?.title}
          </h3>
          <p className="text-sm text-gray-600">{ticket?.ticketTypeId?.name}</p>
          <p className="text-sm text-gray-500">
            {new Date(ticket?.eventId?.startAt).toLocaleDateString()}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="email"
                value={formData.recipientEmail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    recipientEmail: e.target.value,
                  }))
                }
                placeholder="recipient@example.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Name (Optional)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                value={formData.recipientName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    recipientName: e.target.value,
                  }))
                }
                placeholder="John Doe"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, message: e.target.value }))
                }
                placeholder="Add a personal message..."
                rows={3}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary-600 hover:bg-primary-700"
            >
              {isSubmitting ? 'Transferring...' : 'Transfer Ticket'}
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

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Once transferred, you will no longer have
            access to this ticket. The recipient will receive an email
            notification.
          </p>
        </div>
      </Card>
    </div>
  );
}
