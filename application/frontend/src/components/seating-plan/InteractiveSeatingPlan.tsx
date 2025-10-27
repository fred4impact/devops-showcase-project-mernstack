'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Seat, Section } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface InteractiveSeatingPlanProps {
  eventId: string;
  ticketTypeId: string;
  onSeatSelect: (seatId: string, price: number) => void;
  onSeatDeselect: (seatId: string) => void;
  selectedSeats: string[];
  sessionId: string;
  basePrice: number;
}

export function InteractiveSeatingPlan({
  eventId,
  onSeatSelect,
  onSeatDeselect,
  selectedSeats,
  sessionId,
  basePrice,
}: InteractiveSeatingPlanProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [seatmapType, setSeatmapType] = useState<'reserved' | 'ga'>('reserved');
  const [stageLabel, setStageLabel] = useState('Stage');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSeatmap();
  }, [eventId]);

  // Fluid canvas sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current && canvasRef.current) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = Math.min(600, window.innerHeight * 0.5);

        // Calculate aspect ratio (4:3)
        const aspectRatio = 4 / 3;
        let newWidth = containerWidth - 20; // Account for padding
        let newHeight = newWidth / aspectRatio;

        // If height is too large, constrain by height
        if (newHeight > containerHeight) {
          newHeight = containerHeight;
          newWidth = newHeight * aspectRatio;
        }

        setCanvasSize({
          width: Math.floor(newWidth),
          height: Math.floor(newHeight),
        });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const fetchSeatmap = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/seating-plan/events/${eventId}/seatmap`);
      const seatmap = response.data;

      setSeats(seatmap.seats || []);
      setSections(seatmap.sections || []);
      setSeatmapType(seatmap.type || 'reserved');
      setStageLabel(seatmap.stageLabel || 'Stage');
    } catch (error) {
      console.error('Error fetching seatmap:', error);
      toast.error('Failed to load seating plan');
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
      try {
        // Lock the seat temporarily
        await api.post(
          `/seating-plan/events/${eventId}/seats/${seat.seatId}/lock`,
          {
            sessionId,
            duration: 300, // 5 minutes
          },
        );

        const totalPrice = basePrice + seat.priceModifier;
        onSeatSelect(seat.seatId, totalPrice);

        // Update seat status locally
        setSeats((prev) =>
          prev.map((s) =>
            s.seatId === seat.seatId ? { ...s, status: 'selected' } : s,
          ),
        );
      } catch (error) {
        toast.error('Seat is no longer available');
        // Refresh seatmap to get updated status
        fetchSeatmap();
      }
    }
  };


  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw stage - adjust size based on canvas dimensions
    const stageWidth = Math.min(700, canvas.width - 100);
    const stageX = (canvas.width - stageWidth) / 2;
    const stageY = 50;
    const stageHeight = 60;

    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(stageX, stageY, stageWidth, stageHeight);
    ctx.fillStyle = '#374151';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(stageLabel, canvas.width / 2, stageY + 40);

    // Draw sections
    sections.forEach((section) => {
      ctx.fillStyle = section.color + '20';
      ctx.fillRect(section.x, section.y, section.width, section.height);
      ctx.strokeStyle = section.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(section.x, section.y, section.width, section.height);

      ctx.fillStyle = '#374151';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        section.name,
        section.x + section.width / 2,
        section.y + section.height / 2,
      );
    });

    // Draw seats
    seats.forEach((seat) => {
      const isHovered = hoveredSeat === seat.seatId;
      const isSelected = selectedSeats.includes(seat.seatId);

      // Seat color based on status
      let seatColor = '#6b7280'; // default gray
      if (seat.status === 'sold') seatColor = '#ef4444';
      else if (seat.status === 'locked') seatColor = '#f59e0b';
      else if (isSelected) seatColor = '#3b82f6';
      else if (seat.accessible) seatColor = '#10b981';

      ctx.fillStyle = seatColor;
      ctx.fillRect(seat.x - 8, seat.y - 8, 16, 16);

      // Highlight on hover
      if (isHovered) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(seat.x - 8, seat.y - 8, 16, 16);
      }

      // Seat number
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(seat.number, seat.x, seat.y + 3);
    });
  };

  const handleCanvasMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find seat under mouse
    const seatUnderMouse = seats.find(
      (seat) => Math.abs(seat.x - x) < 8 && Math.abs(seat.y - y) < 8,
    );

    setHoveredSeat(seatUnderMouse?.seatId || null);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedSeat = seats.find(
      (seat) => Math.abs(seat.x - x) < 8 && Math.abs(seat.y - y) < 8,
    );

    if (clickedSeat) {
      handleSeatClick(clickedSeat);
    }
  };

  useEffect(() => {
    drawCanvas();
  }, [seats, sections, selectedSeats, hoveredSeat, stageLabel]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading seating plan...</p>
        </div>
      </Card>
    );
  }

  if (seatmapType === 'ga') {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">General Admission</h3>
          <p className="text-gray-600">
            This event uses general admission seating
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Seat Selection</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm">Selected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">Sold</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span className="text-sm">Accessible</span>
            </div>
          </div>
        </div>

        <div className="relative w-full" ref={containerRef}>
          <div className="w-full border border-gray-300 rounded overflow-hidden">
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="cursor-pointer block w-full h-auto"
              style={{ maxWidth: '100%', height: 'auto' }}
              onMouseMove={handleCanvasMouseMove}
              onClick={handleCanvasClick}
            />
          </div>

          {hoveredSeat && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white p-2 rounded text-sm">
              {(() => {
                const seat = seats.find((s) => s.seatId === hoveredSeat);
                if (!seat) return '';
                const price = basePrice + seat.priceModifier;
                return `${seat.seatId} - $${(price / 100).toFixed(2)}`;
              })()}
            </div>
          )}
        </div>
      </Card>

      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Selected Seats</h3>
          <div className="space-y-2">
            {selectedSeats.map((seatId) => {
              const seat = seats.find((s) => s.seatId === seatId);
              if (!seat) return null;
              const price = basePrice + seat.priceModifier;
              return (
                <div
                  key={seatId}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{seat.seatId}</Badge>
                    {seat.accessible && (
                      <Badge variant="secondary">Accessible</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      ${(price / 100).toFixed(2)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSeatDeselect(seatId)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
