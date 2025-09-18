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
  Clock,
  Plus,
  Palette,
  Settings,
  Eye,
  Printer
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
  const [showTicketGenerator, setShowTicketGenerator] = useState(false);
  const [showTicketDesigner, setShowTicketDesigner] = useState(false);
  const [ticketTemplate, setTicketTemplate] = useState({
    backgroundColor: '#ffffff',
    primaryColor: '#3b82f6',
    secondaryColor: '#1f2937',
    logoUrl: '',
    eventName: '',
    venueName: '',
    date: '',
    time: '',
    qrCode: true,
    barcode: false,
    borderStyle: 'solid',
    borderColor: '#e5e7eb'
  });

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

  const generateTicket = async (ticket: Ticket) => {
    try {
      const response = await api.post(`/tickets/${ticket._id}/generate`, {
        template: ticketTemplate
      });
      
      if (response.data.pdfUrl) {
        window.open(response.data.pdfUrl, '_blank');
        toast.success('Ticket generated successfully');
      } else {
        toast.error('Failed to generate ticket');
      }
    } catch (error) {
      console.error('Error generating ticket:', error);
      toast.error('Failed to generate ticket');
    }
  };

  const previewTicket = (ticket: Ticket) => {
    // Create a preview of the ticket with current template
    const previewWindow = window.open('', '_blank', 'width=600,height=800');
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ticket Preview</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .ticket {
              width: 400px;
              height: 200px;
              background: ${ticketTemplate.backgroundColor};
              border: 2px ${ticketTemplate.borderStyle} ${ticketTemplate.borderColor};
              border-radius: 8px;
              padding: 20px;
              position: relative;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .ticket-header {
              color: ${ticketTemplate.primaryColor};
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .ticket-details {
              color: ${ticketTemplate.secondaryColor};
              font-size: 14px;
              margin-bottom: 5px;
            }
            .qr-code {
              position: absolute;
              right: 20px;
              top: 20px;
              width: 80px;
              height: 80px;
              background: #f3f4f6;
              border: 1px solid #d1d5db;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="ticket-header">${ticket.eventId.title}</div>
            <div class="ticket-details">${ticket.ticketTypeId.name}</div>
            <div class="ticket-details">${ticket.eventId.venue.name}</div>
            <div class="ticket-details">${formatDate(ticket.eventId.startAt)}</div>
            <div class="ticket-details">Order: ${ticket.orderId._id.slice(-8)}</div>
            <div class="qr-code">QR Code</div>
          </div>
        </body>
        </html>
      `);
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
              <p className="text-gray-600 mt-2">
                Manage your event tickets, transfers, and refunds
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <Button
                onClick={() => setShowTicketDesigner(true)}
                variant="outline"
                className="flex items-center"
              >
                <Palette className="w-4 h-4 mr-2" />
                Design Tickets
              </Button>
              <Button
                onClick={() => setShowTicketGenerator(true)}
                className="bg-primary-600 hover:bg-primary-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Generate Tickets
              </Button>
            </div>
          </div>
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
                        onClick={() => previewTicket(ticket)}
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      
                      <Button
                        onClick={() => generateTicket(ticket)}
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <Printer className="w-4 h-4 mr-1" />
                        Generate
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

        {/* Ticket Designer Modal */}
        {showTicketDesigner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Ticket Designer</h2>
                <Button
                  onClick={() => setShowTicketDesigner(false)}
                  variant="outline"
                  size="sm"
                >
                  Close
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Design Controls */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={ticketTemplate.backgroundColor}
                      onChange={(e) => setTicketTemplate(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <input
                      type="color"
                      value={ticketTemplate.primaryColor}
                      onChange={(e) => setTicketTemplate(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <input
                      type="color"
                      value={ticketTemplate.secondaryColor}
                      onChange={(e) => setTicketTemplate(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Border Style
                    </label>
                    <select
                      value={ticketTemplate.borderStyle}
                      onChange={(e) => setTicketTemplate(prev => ({ ...prev, borderStyle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Border Color
                    </label>
                    <input
                      type="color"
                      value={ticketTemplate.borderColor}
                      onChange={(e) => setTicketTemplate(prev => ({ ...prev, borderColor: e.target.value }))}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={ticketTemplate.qrCode}
                        onChange={(e) => setTicketTemplate(prev => ({ ...prev, qrCode: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Include QR Code</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={ticketTemplate.barcode}
                        onChange={(e) => setTicketTemplate(prev => ({ ...prev, barcode: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Include Barcode</span>
                    </label>
                  </div>
                </div>
                
                {/* Preview */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div 
                      className="w-full h-48 border-2 rounded-lg p-4 relative"
                      style={{
                        backgroundColor: ticketTemplate.backgroundColor,
                        borderStyle: ticketTemplate.borderStyle,
                        borderColor: ticketTemplate.borderColor
                      }}
                    >
                      <div 
                        className="text-lg font-bold mb-2"
                        style={{ color: ticketTemplate.primaryColor }}
                      >
                        Sample Event
                      </div>
                      <div 
                        className="text-sm mb-1"
                        style={{ color: ticketTemplate.secondaryColor }}
                      >
                        General Admission
                      </div>
                      <div 
                        className="text-sm mb-1"
                        style={{ color: ticketTemplate.secondaryColor }}
                      >
                        Venue Name
                      </div>
                      <div 
                        className="text-sm mb-1"
                        style={{ color: ticketTemplate.secondaryColor }}
                      >
                        Date & Time
                      </div>
                      {ticketTemplate.qrCode && (
                        <div className="absolute right-4 top-4 w-12 h-12 bg-gray-200 border border-gray-300 rounded flex items-center justify-center text-xs text-gray-500">
                          QR
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  onClick={() => setShowTicketDesigner(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    toast.success('Ticket template saved!');
                    setShowTicketDesigner(false);
                  }}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  Save Template
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Generator Modal */}
        {showTicketGenerator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Generate Tickets</h2>
                <Button
                  onClick={() => setShowTicketGenerator(false)}
                  variant="outline"
                  size="sm"
                >
                  Close
                </Button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">
                  Generate custom tickets for all your events using your saved template.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={() => {
                      toast.success('Generating tickets for all events...');
                      setShowTicketGenerator(false);
                    }}
                    className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500"
                  >
                    <div className="text-center">
                      <Printer className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <div className="font-medium">All Events</div>
                      <div className="text-sm text-gray-500">Generate for all your events</div>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => {
                      toast.success('Generating tickets for selected events...');
                      setShowTicketGenerator(false);
                    }}
                    className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500"
                  >
                    <div className="text-center">
                      <Settings className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <div className="font-medium">Selected Events</div>
                      <div className="text-sm text-gray-500">Choose specific events</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
