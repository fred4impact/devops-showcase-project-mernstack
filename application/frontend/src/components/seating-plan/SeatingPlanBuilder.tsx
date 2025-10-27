'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Seat, Section } from '@/types';

interface SeatingPlanBuilderProps {
  eventId: string;
  onSave: (seatmap: any) => void;
  initialSeatmap?: any;
}

export function SeatingPlanBuilder({
  onSave,
  initialSeatmap,
}: SeatingPlanBuilderProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [seatmapType, setSeatmapType] = useState<'reserved' | 'ga'>('reserved');
  const [stageLabel, setStageLabel] = useState('Stage');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialSeatmap) {
      setSeats(initialSeatmap.seats || []);
      setSections(initialSeatmap.sections || []);
      setSeatmapType(initialSeatmap.type || 'reserved');
      setStageLabel(initialSeatmap.stageLabel || 'Stage');
    }
  }, [initialSeatmap]);

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

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (isDrawing) {
      addSeat(x, y);
    }
  };

  const addSeat = (x: number, y: number) => {
    const section = sections.find((s) => s.name === selectedSection);
    if (!section) return;

    const seatId = `${section.name}-${seats.filter((s) => s.section === section.name).length + 1}`;
    const newSeat: Seat = {
      seatId,
      section: section.name,
      row: 'A',
      number: (
        seats.filter((s) => s.section === section.name).length + 1
      ).toString(),
      priceModifier: 0,
      accessible: false,
      x,
      y,
    };

    setSeats((prev) => [...prev, newSeat]);
  };

  const addSection = () => {
    const sectionName = prompt('Enter section name:');
    if (!sectionName) return;

    const newSection: Section = {
      name: sectionName,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      x: 50,
      y: 50,
      width: 200,
      height: 100,
    };

    setSections((prev) => [...prev, newSection]);
    setSelectedSection(sectionName);
  };

  const deleteSeat = (seatId: string) => {
    setSeats((prev) => prev.filter((s) => s.seatId !== seatId));
  };

  const deleteSection = (sectionName: string) => {
    setSections((prev) => prev.filter((s) => s.name !== sectionName));
    setSeats((prev) => prev.filter((s) => s.section !== sectionName));
    if (selectedSection === sectionName) {
      setSelectedSection('');
    }
  };

  const updateSeat = (seatId: string, updates: Partial<Seat>) => {
    setSeats((prev) =>
      prev.map((s) => (s.seatId === seatId ? { ...s, ...updates } : s)),
    );
  };

  const generateSeatingPlan = () => {
    const seatmap = {
      type: seatmapType,
      seats,
      sections,
      width: 800,
      height: 600,
      stageLabel,
    };

    onSave(seatmap);
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
      ctx.fillStyle = section.color + '40';
      ctx.fillRect(section.x, section.y, section.width, section.height);
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
      const section = sections.find((s) => s.name === seat.section);
      if (!section) return;

      ctx.fillStyle = '#6b7280';
      ctx.fillRect(seat.x - 5, seat.y - 5, 10, 10);

      // Draw seat label
      ctx.fillStyle = '#374151';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(seat.number, seat.x, seat.y + 15);
    });
  };

  useEffect(() => {
    drawCanvas();
  }, [seats, sections, stageLabel, drawCanvas]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Seating Plan Builder</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seating Type
              </label>
              <select
                value={seatmapType}
                onChange={(e) =>
                  setSeatmapType(e.target.value as 'reserved' | 'ga')
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="reserved">Reserved Seating</option>
                <option value="ga">General Admission</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stage Label
              </label>
              <Input
                value={stageLabel}
                onChange={(e) => setStageLabel(e.target.value)}
                placeholder="Stage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sections
              </label>
              <div className="space-y-2">
                {sections.map((section) => (
                  <div
                    key={section.name}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: section.color }}
                      />
                      <span>{section.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteSection(section.name)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
                <Button onClick={addSection} variant="outline" size="sm">
                  Add Section
                </Button>
              </div>
            </div>

            {seatmapType === 'reserved' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Section
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a section</option>
                  {sections.map((section) => (
                    <option key={section.name} value={section.name}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                onClick={() => setIsDrawing(!isDrawing)}
                variant={isDrawing ? 'primary' : 'outline'}
                size="sm"
              >
                {isDrawing ? 'Stop Drawing' : 'Start Drawing'}
              </Button>
              <Button onClick={generateSeatingPlan} size="sm">
                Generate Plan
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="w-full" ref={containerRef}>
            <div className="w-full border border-gray-300 rounded overflow-hidden">
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className="cursor-crosshair block w-full h-auto"
                style={{ maxWidth: '100%', height: 'auto' }}
                onClick={handleCanvasClick}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Click on the canvas to add seats (when drawing mode is enabled)
            </p>
          </div>
        </div>
      </Card>

      {/* Seats List */}
      {seats.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Seats ({seats.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {seats.map((seat) => (
              <div
                key={seat.seatId}
                className="p-3 border border-gray-200 rounded"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{seat.seatId}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteSeat(seat.seatId)}
                  >
                    Delete
                  </Button>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">
                      Price Modifier:
                    </label>
                    <Input
                      type="number"
                      value={seat.priceModifier}
                      onChange={(e) =>
                        updateSeat(seat.seatId, {
                          priceModifier: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-20 h-6 text-xs"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={seat.accessible}
                      onChange={(e) =>
                        updateSeat(seat.seatId, {
                          accessible: e.target.checked,
                        })
                      }
                    />
                    <label className="text-sm text-gray-600">Accessible</label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
