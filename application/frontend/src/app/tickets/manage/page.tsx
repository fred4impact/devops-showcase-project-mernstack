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
import { 
  Search, 
  Filter, 
  Download, 
  Share2, 
  RefreshCw, 
  QrCode,
  Calendar,
  MapPin,
  User,
  DollarSign,
  Clock
} from 'lucide-react';
import { TicketTransferModal } from '@/components/modals/TicketTransferModal';
import { TicketRefundModal } from '@/components/modals/TicketRefundModal';

interface Ticket {
  _id: string;
  ticketUUID: string;
  qrPayload: string;
  status: string;
  issuedAt: string;
  usedAt?: string;
  pdfUrl?: string;
  orderId: {
    _id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  };
  eventId: {
    _id: string;
    title: string;
    startAt: string;
    venue: {
      name: string;
      address: string;
    };
  };
  ticketTypeId: {
    _id: string;
    name: string;
    priceCents: number;
  };
}

export default function TicketManagement() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchTickets();
    }
  }, [user, loading, router]);

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await api.get(`/tickets/my-tickets?${params.toString()}`);
      setTickets(response.data.tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleTransferTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowTransferModal(true);
  };

  const handleRefundTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowRefundModal(true);
  };

  const downloadTicket = async (ticket: Ticket) => {
    try {
      if (ticket.pdfUrl) {
        window.open(ticket.pdfUrl, '_blank');
      } else {
        const response = await api.get(`/tickets/${ticket._id}/pdf`);
        if (response.data.pdfUrl) {
          window.open(response.data.pdfUrl, '_blank');
        } else {
          toast.error('PDF not available for this ticket');
        }
      }
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toast.error('Failed to download ticket');
    }
  };

  const shareTicket = async (ticket: Ticket) => {
    try {
      const shareData = {
        title: `My ticket for ${ticket.eventId.title}`,
        text: `Check out my ticket for ${ticket.eventId.title}`,
        url: window.location.origin + `/tickets/${ticket._id}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Ticket link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing ticket:', error);
      toast.error('Failed to share ticket');
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
      case 'issued':
      case 'active':
        return 'success';
      case 'used':
        return 'secondary';
      case 'refunded':
        return 'error';
      default:
        return 'warning';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.eventId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticketTypeId.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            Manage your event tickets, transfers, and refunds
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="issued">Active</option>
              <option value="used">Used</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <Button
            onClick={fetchTickets}
            variant="outline"
            className="flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-gray-500 mb-4">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'You haven\'t purchased any tickets yet'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button
                onClick={() => router.push('/events')}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Browse Events
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredTickets.map((ticket) => (
              <Card key={ticket._id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {ticket.eventId.title}
                        </h3>
                        <p className="text-gray-600 mb-2">{ticket.ticketTypeId.name}</p>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(ticket.eventId.startAt)}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-4 h-4 mr-2" />
                          {ticket.eventId.venue.name}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                        <div className="text-sm text-gray-500">
                          ${formatPrice(ticket.ticketTypeId.priceCents)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Order ID</label>
                        <p className="text-gray-900">{ticket.orderId._id.slice(-8)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Issued</label>
                        <p className="text-gray-900">{formatDate(ticket.issuedAt)}</p>
                      </div>
                      {ticket.usedAt && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Used</label>
                          <p className="text-gray-900">{formatDate(ticket.usedAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => downloadTicket(ticket)}
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                      
                      <Button
                        onClick={() => shareTicket(ticket)}
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                      
                      {ticket.status === 'issued' && (
                        <>
                          <Button
                            onClick={() => handleTransferTicket(ticket)}
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                          >
                            <User className="w-4 h-4 mr-1" />
                            Transfer
                          </Button>
                          
                          <Button
                            onClick={() => handleRefundTicket(ticket)}
                            variant="outline"
                            size="sm"
                            className="flex items-center text-red-600 hover:text-red-700"
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Refund
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modals */}
        <TicketTransferModal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          ticket={selectedTicket}
          onSuccess={fetchTickets}
        />

        <TicketRefundModal
          isOpen={showRefundModal}
          onClose={() => setShowRefundModal(false)}
          ticket={selectedTicket}
          onSuccess={fetchTickets}
        />
      </div>
    </div>
  );
}
