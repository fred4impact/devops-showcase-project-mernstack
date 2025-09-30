'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Seat {
  seatId: string;
  section: string;
  row: string;
  number: string;
  priceModifier: number;
  accessible: boolean;
  status?: 'available' | 'selected' | 'locked' | 'sold';
}

interface SeatMapProps {
  eventId: string;
  ticketTypeId: string;
  onSeatSelect: (seatId: string, price: number) => void;
  onSeatDeselect: (seatId: string) => void;
  selectedSeats: string[];
  sessionId: string;
}

export function SeatMap({ 
  eventId, 
  ticketTypeId, 
  onSeatSelect, 
  onSeatDeselect, 
  selectedSeats, 
  sessionId 
}: SeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [basePrice, setBasePrice] = useState(0);

  useEffect(() => {
    fetchSeatMap();
  }, [eventId]);

  const fetchSeatMap = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/seating-plan/events/${eventId}/seatmap`);
      setSeats(response.data.seats || []);
      setBasePrice(response.data.basePrice || 0);
    } catch (error) {
      console.error('Error fetching seat map:', error);
      toast.error('Failed to load seat map');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = async (seat: Seat) => {
    if (seat.status === 'sold' || seat.status === 'locked') {
      return;
    }

    const isSelected = selectedSeats.includes(seat.seatId);
    
    if (isSelected) {
      onSeatDeselect(seat.seatId);
    } else {
      // Lock the seat temporarily
      try {
        await api.post(`/seating-plan/events/${eventId}/seats/${seat.seatId}/lock`, {
          sessionId,
          duration: 300, // 5 minutes
        });
        
        const totalPrice = basePrice + seat.priceModifier;
        onSeatSelect(seat.seatId, totalPrice);
        
        // Update seat status
        setSeats(prev => prev.map(s => 
          s.seatId === seat.seatId ? { ...s, status: 'selected' } : s
        ));
      } catch (error) {
        toast.error('Seat is no longer available');
      }
    }
  };

  const getSeatStatus = (seat: Seat) => {
    if (seat.status === 'sold') return 'sold';
    if (seat.status === 'locked') return 'locked';
    if (selectedSeats.includes(seat.seatId)) return 'selected';
    return 'available';
  };

  const getSeatColor = (seat: Seat) => {
    const status = getSeatStatus(seat);
    switch (status) {
      case 'sold':
        return 'bg-gray-400 text-white cursor-not-allowed';
      case 'locked':
        return 'bg-yellow-400 text-white cursor-not-allowed';
      case 'selected':
        return 'bg-primary-600 text-white cursor-pointer';
      default:
        return 'bg-green-500 text-white cursor-pointer hover:bg-green-600';
    }
  };

  const getSeatIcon = (seat: Seat) => {
    if (seat.accessible) {
      return '♿';
    }
    return seat.number;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-10 gap-2">
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (seats.length === 0) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reserved Seating</h3>
        <p className="text-gray-600">This event uses general admission</p>
      </Card>
    );
  }

  // Group seats by section and row
  const sections = seats.reduce((acc, seat) => {
    if (!acc[seat.section]) {
      acc[seat.section] = [];
    }
    acc[seat.section].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Your Seats</h3>
        <p className="text-sm text-gray-600">Click on available seats to select them</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-primary-600 rounded"></div>
          <span className="text-sm text-gray-600">Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-400 rounded"></div>
          <span className="text-sm text-gray-600">Locked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span className="text-sm text-gray-600">Sold</span>
        </div>
      </div>

      {/* Seat Map */}
      <div className="space-y-6">
        {Object.entries(sections).map(([sectionName, sectionSeats]) => (
          <div key={sectionName} className="space-y-2">
            <h4 className="text-md font-medium text-gray-900">{sectionName}</h4>
            
            {/* Stage/Performance Area */}
            <div className="bg-gray-100 rounded-lg p-4 text-center mb-4">
              <span className="text-sm font-medium text-gray-600">Stage</span>
            </div>
            
            {/* Seats Grid */}
            <div className="grid grid-cols-12 gap-1">
              {sectionSeats.map((seat) => (
                <button
                  key={seat.seatId}
                  onClick={() => handleSeatClick(seat)}
                  className={`
                    w-8 h-8 rounded text-xs font-medium transition-all duration-200
                    ${getSeatColor(seat)}
                    ${seat.accessible ? 'ring-2 ring-blue-300' : ''}
                  `}
                  disabled={seat.status === 'sold' || seat.status === 'locked'}
                  title={`${seat.section}${seat.row}-${seat.number} $${basePrice + seat.priceModifier}`}
                >
                  {getSeatIcon(seat)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <div className="mt-6 p-4 bg-primary-50 rounded-lg">
          <h4 className="text-sm font-medium text-primary-900 mb-2">Selected Seats</h4>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map(seatId => {
              const seat = seats.find(s => s.seatId === seatId);
              if (!seat) return null;
              
              return (
                <Badge key={seatId} variant="default">
                  {seat.section}{seat.row}-{seat.number} 
                  <span className="ml-1">${basePrice + seat.priceModifier}</span>
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
