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
  const [isDrawingSection, setIsDrawingSection] = useState(false);
  const [sectionStartPos, setSectionStartPos] = useState<{ x: number; y: number } | null>(null);
  const [sectionCurrentPos, setSectionCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [draggingSection, setDraggingSection] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
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

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate coordinates accounting for canvas scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    console.log('Canvas click:', { x, y, isDrawing, selectedSection, canvasWidth: canvas.width, canvasHeight: canvas.height, rectWidth: rect.width, rectHeight: rect.height });

    // PRIORITY 1: If we're in seat drawing mode, add a seat (highest priority - ALWAYS check this first)
    if (isDrawing && selectedSection) {
      event.preventDefault();
      event.stopPropagation();
      
      const section = sections.find((s) => s.name === selectedSection);
      if (!section) {
        console.error('Section not found:', selectedSection);
        alert('Selected section not found. Please select a section first.');
        return;
      }

      console.log('Section bounds:', {
        sectionX: section.x,
        sectionY: section.y,
        sectionWidth: section.width,
        sectionHeight: section.height,
        clickX: x,
        clickY: y
      });

      const isWithinSection =
        x >= section.x &&
        x <= section.x + section.width &&
        y >= section.y &&
        y <= section.y + section.height;
      
      console.log('Is within section:', isWithinSection);
      
      if (isWithinSection) {
        console.log('Adding seat at:', x, y);
        addSeat(x, y);
        // Force canvas redraw
        drawCanvas();
        return;
      } else {
        // Show feedback that seat must be within section
        console.warn('Click outside section bounds');
        alert(`Please click within the "${selectedSection}" section boundaries to add seats.\n\nSection bounds: x=${Math.round(section.x)}-${Math.round(section.x + section.width)}, y=${Math.round(section.y)}-${Math.round(section.y + section.height)}\nYour click: x=${Math.round(x)}, y=${Math.round(y)}`);
        return;
      }
    }

    // PRIORITY 2: If we're in section positioning mode, handle section positioning
    if (isDrawingSection && selectedSection) {
      event.preventDefault();
      setSectionStartPos({ x, y });
      return;
    }

    // PRIORITY 3: Handle section selection and dragging (only if not in drawing modes)
    const clickedSection = sections.find(
      (section) =>
        x >= section.x &&
        x <= section.x + section.width &&
        y >= section.y &&
        y <= section.y + section.height
    );

    if (clickedSection) {
      // If clicking on a section that's not selected, select it
      if (clickedSection.name !== selectedSection) {
        setSelectedSection(clickedSection.name);
        setIsDrawingSection(false);
        setIsDrawing(false);
        return;
      }

      // If clicking on the selected section and NOT in drawing mode, allow dragging
      if (clickedSection.name === selectedSection && !isDrawing && !isDrawingSection) {
        setDraggingSection(clickedSection.name);
        setDragOffset({
          x: x - clickedSection.x,
          y: y - clickedSection.y,
        });
        return;
      }
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate coordinates accounting for canvas scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    // If dragging a section, update its position
    if (draggingSection && dragOffset) {
      const section = sections.find((s) => s.name === draggingSection);
      if (section) {
        const newX = Math.max(0, Math.min(x - dragOffset.x, canvas.width - section.width));
        const newY = Math.max(0, Math.min(y - dragOffset.y, canvas.height - section.height));
        updateSection(draggingSection, { x: newX, y: newY });
      }
    }

    // If drawing a section, track current position for preview
    if (isDrawingSection && sectionStartPos) {
      setSectionCurrentPos({ x, y });
    }
  };

  const handleCanvasMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate coordinates accounting for canvas scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    // If we were drawing/positioning a section, finish it
    if (isDrawingSection && sectionStartPos && selectedSection) {
      const section = sections.find((s) => s.name === selectedSection);
      if (section) {
        // If clicking on the section itself, just move it
        const clickedSection = sections.find(
          (s) =>
            x >= s.x &&
            x <= s.x + s.width &&
            y >= s.y &&
            y <= s.y + s.height &&
            s.name === selectedSection
        );

        if (clickedSection) {
          // Just move the section to the new position
          const newX = Math.max(0, Math.min(x - (section.width / 2), canvas.width - section.width));
          const newY = Math.max(0, Math.min(y - (section.height / 2), canvas.height - section.height));
          updateSection(selectedSection, {
            x: newX,
            y: newY,
          });
        } else {
          // Resize/reposition the section
          const width = Math.abs(x - sectionStartPos.x);
          const height = Math.abs(y - sectionStartPos.y);
          
          if (width > 20 && height > 20) {
            const finalX = Math.min(sectionStartPos.x, x);
            const finalY = Math.min(sectionStartPos.y, y);
            updateSection(selectedSection, {
              x: finalX,
              y: finalY,
              width,
              height,
            });
          }
        }
      }
      setSectionStartPos(null);
      setSectionCurrentPos(null);
      setIsDrawingSection(false);
    }

    // Stop dragging
    if (draggingSection) {
      setDraggingSection(null);
      setDragOffset(null);
    }
  };

  const addSeat = (x: number, y: number) => {
    const section = sections.find((s) => s.name === selectedSection);
    if (!section) {
      console.error('Section not found:', selectedSection);
      alert('No section selected. Please select a section first.');
      return;
    }

    console.log('Adding seat - Section:', section.name, 'Position:', x, y);
    console.log('Section bounds:', {
      x: section.x,
      y: section.y,
      width: section.width,
      height: section.height
    });

    // Check if seat is within section bounds
    const isWithinSection =
      x >= section.x &&
      x <= section.x + section.width &&
      y >= section.y &&
      y <= section.y + section.height;

    if (!isWithinSection) {
      console.warn('Seat outside bounds');
      return; // Don't show alert here, already shown in handleCanvasMouseDown
    }

    // Check if there's already a seat very close to this position (within 20 pixels)
    const existingSeat = seats.find(
      (s) =>
        s.section === section.name &&
        Math.abs(s.x - x) < 20 &&
        Math.abs(s.y - y) < 20
    );

    if (existingSeat) {
      console.log('Seat already exists at this position:', existingSeat.seatId);
      return; // Don't add duplicate seat
    }

    const sectionSeats = seats.filter((s) => s.section === section.name);
    const seatNumber = sectionSeats.length + 1;
    const seatId = `${section.name}-${seatNumber}`;
    
    const newSeat: Seat = {
      seatId,
      section: section.name,
      row: 'A',
      number: seatNumber.toString(),
      priceModifier: 0,
      accessible: false,
      x: Math.round(x),
      y: Math.round(y),
    };

    console.log('Creating new seat:', newSeat);
    setSeats((prev) => {
      const updated = [...prev, newSeat];
      console.log('Updated seats array:', updated);
      return updated;
    });
    
    // Force immediate canvas redraw
    setTimeout(() => {
      drawCanvas();
    }, 0);
    
    console.log(`✓ Seat ${seatId} added at (${Math.round(x)}, ${Math.round(y)})`);
  };

  const addSection = () => {
    const sectionName = prompt('Enter section name:');
    if (!sectionName) return;

    // Check if section name already exists
    if (sections.some((s) => s.name === sectionName)) {
      alert('A section with this name already exists');
      return;
    }

    // Generate a unique color
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#84cc16', // lime
    ];
    const usedColors = sections.map((s) => s.color);
    const availableColor = colors.find((c) => !usedColors.includes(c)) || 
      `#${Math.floor(Math.random() * 16777215).toString(16)}`;

    // Place new section in a non-overlapping position
    let x = 100;
    let y = 150;
    let attempts = 0;
    while (attempts < 20) {
      const overlapping = sections.some(
        (s) =>
          x < s.x + s.width &&
          x + 200 > s.x &&
          y < s.y + s.height &&
          y + 150 > s.y
      );
      if (!overlapping) break;
      x += 220;
      if (x > 600) {
        x = 100;
        y += 160;
      }
      attempts++;
    }

    const newSection: Section = {
      name: sectionName,
      color: availableColor,
      x,
      y,
      width: 200,
      height: 150,
    };

    setSections((prev) => [...prev, newSection]);
    setSelectedSection(sectionName);
    // Don't automatically enter drawing mode - let user choose to position it
    setIsDrawingSection(false);
  };

  const updateSection = (sectionName: string, updates: Partial<Section>) => {
    setSections((prev) =>
      prev.map((s) => (s.name === sectionName ? { ...s, ...updates } : s))
    );
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
    // Validate that we have sections for reserved seating
    if (seatmapType === 'reserved' && sections.length === 0) {
      alert('Please add at least one section for reserved seating');
      return;
    }

    // Validate that we have seats for reserved seating
    if (seatmapType === 'reserved' && seats.length === 0) {
      alert('Please add at least one seat to your sections');
      return;
    }

    // Validate that all seats are within their section bounds
    const seatsOutsideBounds = seats.filter((seat) => {
      const section = sections.find((s) => s.name === seat.section);
      if (!section) return true;
      return (
        seat.x < section.x ||
        seat.x > section.x + section.width ||
        seat.y < section.y ||
        seat.y > section.y + section.height
      );
    });

    if (seatsOutsideBounds.length > 0) {
      const confirmSave = confirm(
        `Warning: ${seatsOutsideBounds.length} seat(s) are outside their section bounds. Do you want to save anyway?`
      );
      if (!confirmSave) return;
    }

    const seatmap = {
      type: seatmapType,
      seats: seatmapType === 'reserved' ? seats : [],
      sections: seatmapType === 'reserved' ? sections : [],
      width: canvasSize.width,
      height: canvasSize.height,
      stageLabel,
    };

    console.log('Saving seatmap:', seatmap);
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
      const isSelected = selectedSection === section.name;
      const isDragging = draggingSection === section.name;
      
      // Draw section background with different opacity based on selection
      ctx.fillStyle = section.color + (isSelected ? '80' : '40');
      ctx.fillRect(section.x, section.y, section.width, section.height);
      
      // Draw section border - thicker and brighter if selected
      ctx.strokeStyle = isSelected ? section.color : section.color + '80';
      ctx.lineWidth = isSelected ? 4 : 2;
      ctx.strokeRect(section.x, section.y, section.width, section.height);
      
      // Draw section label with background for readability
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      const textY = section.y + section.height / 2;
      const textX = section.x + section.width / 2;
      
      // Add text background for better visibility
      if (isSelected) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(textX - 40, textY - 10, 80, 20);
      }
      
      ctx.fillStyle = isSelected ? section.color : '#374151';
      ctx.fillText(section.name, textX, textY + 5);
      
      // Draw selection indicator in corner
      if (isSelected) {
        ctx.fillStyle = section.color;
        ctx.fillRect(section.x + section.width - 12, section.y + section.height - 12, 12, 12);
        // Draw checkmark
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(section.x + section.width - 9, section.y + section.height - 6);
        ctx.lineTo(section.x + section.width - 6, section.y + section.height - 3);
        ctx.lineTo(section.x + section.width - 3, section.y + section.height - 8);
        ctx.stroke();
      }
      
      // Show seat count in section
      const sectionSeatCount = seats.filter((s) => s.section === section.name).length;
      if (sectionSeatCount > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${sectionSeatCount} seats`, section.x + 5, section.y + section.height - 5);
      }
    });

    // Draw section being drawn (preview)
    if (isDrawingSection && sectionStartPos && sectionCurrentPos) {
      const section = sections.find((s) => s.name === selectedSection);
      if (section) {
        const width = sectionCurrentPos.x - sectionStartPos.x;
        const height = sectionCurrentPos.y - sectionStartPos.y;
        const x = sectionStartPos.x;
        const y = sectionStartPos.y;
        
        ctx.fillStyle = section.color + '30';
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = section.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x, y, width, height);
        ctx.setLineDash([]);
      }
    }

    // Draw seats
    seats.forEach((seat) => {
      const section = sections.find((s) => s.name === seat.section);
      if (!section) return;

      // Check if seat is within section bounds (for visual feedback)
      const isWithinBounds =
        seat.x >= section.x &&
        seat.x <= section.x + section.width &&
        seat.y >= section.y &&
        seat.y <= section.y + section.height;

      const isSelectedSection = seat.section === selectedSection;

      // Draw seat with different colors based on state
      if (!isWithinBounds) {
        ctx.fillStyle = '#ef4444'; // Red if outside bounds
        ctx.strokeStyle = '#dc2626';
      } else if (isSelectedSection && isDrawing) {
        ctx.fillStyle = '#3b82f6'; // Blue if in selected section and drawing mode
        ctx.strokeStyle = '#2563eb';
      } else {
        ctx.fillStyle = '#6b7280'; // Gray for normal seats
        ctx.strokeStyle = '#374151';
      }
      
      ctx.fillRect(seat.x - 6, seat.y - 6, 12, 12);
      ctx.lineWidth = 2;
      ctx.strokeRect(seat.x - 6, seat.y - 6, 12, 12);

      // Draw seat label
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(seat.number, seat.x, seat.y + 18);
    });
  };

  useEffect(() => {
    drawCanvas();
  }, [seats, sections, stageLabel, selectedSection, isDrawing, isDrawingSection, draggingSection, sectionStartPos, sectionCurrentPos]);

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
                onChange={(e) => {
                  const newType = e.target.value as 'reserved' | 'ga';
                  setSeatmapType(newType);
                  // Reset drawing states when changing type
                  setIsDrawing(false);
                  setIsDrawingSection(false);
                  if (newType === 'ga') {
                    // Clear seats for general admission
                    setSeats([]);
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="reserved">Reserved Seating</option>
                <option value="ga">General Admission</option>
              </select>
              {seatmapType === 'ga' && (
                <p className="text-xs text-gray-500 mt-1">
                  General Admission doesn't require individual seats
                </p>
              )}
              {seatmapType === 'reserved' && (
                <p className="text-xs text-blue-600 mt-1">
                  ✓ Reserved Seating allows you to add individual seats
                </p>
              )}
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

            {seatmapType === 'reserved' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Section {sections.length === 0 && <span className="text-red-500">*</span>}
                </label>
                {sections.length === 0 ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                    <p className="font-semibold mb-1">No sections created yet</p>
                    <p className="text-xs">Click "Add Section" above to create a section first.</p>
                  </div>
                ) : (
                  <>
                    <select
                      value={selectedSection}
                      onChange={(e) => {
                        setSelectedSection(e.target.value);
                        setIsDrawingSection(false);
                        setIsDrawing(false);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">-- Select a section --</option>
                      {sections.map((section) => (
                        <option key={section.name} value={section.name}>
                          {section.name} ({seats.filter((s) => s.section === section.name).length} seats)
                        </option>
                      ))}
                    </select>
                    {selectedSection && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                        <p className="font-semibold mb-1">✓ Selected: {selectedSection}</p>
                        <p className="text-blue-700">
                          {isDrawingSection
                            ? 'Click and drag to position/resize section'
                            : isDrawing
                              ? '✓ Ready! Click within section on canvas to add seats'
                              : 'Click "Position Section" or "Add Seats" button below'}
                        </p>
                      </div>
                    )}
                    {!selectedSection && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        <p>⚠ Please select a section to add seats</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
                <p className="font-semibold mb-1">General Admission Mode</p>
                <p className="text-xs">Individual seats are not needed for General Admission. Switch to "Reserved Seating" to add seats.</p>
              </div>
            )}

            <div className="flex flex-col space-y-2">
              {seatmapType === 'reserved' ? (
                <>
                  {selectedSection ? (
                    <>
                      <Button
                        onClick={() => {
                          setIsDrawingSection(!isDrawingSection);
                          setIsDrawing(false);
                        }}
                        variant={isDrawingSection ? 'primary' : 'outline'}
                        size="sm"
                      >
                        {isDrawingSection ? 'Stop Positioning Section' : 'Position Section'}
                      </Button>
                      <Button
                        onClick={() => {
                          setIsDrawing(!isDrawing);
                          setIsDrawingSection(false);
                          if (!isDrawing) {
                            // When starting to add seats, show helpful message
                            console.log(`Ready to add seats to "${selectedSection}". Click within the section on the canvas.`);
                          }
                        }}
                        variant={isDrawing ? 'primary' : 'outline'}
                        size="sm"
                        className={isDrawing ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                      >
                        {isDrawing ? '✓ Adding Seats (Click on Canvas)' : 'Add Seats'}
                      </Button>
                    </>
                  ) : (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Select a section to add seats</p>
                      <p className="text-xs">Choose a section from the dropdown above to enable seat placement.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                  <p className="font-semibold mb-1">General Admission Mode</p>
                  <p className="text-xs">Switch to "Reserved Seating" to add individual seats and sections.</p>
                </div>
              )}
              <Button 
                onClick={generateSeatingPlan} 
                size="sm"
                className="mt-2"
              >
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
                className={`block w-full h-auto ${
                  isDrawingSection || draggingSection
                    ? 'cursor-move'
                    : isDrawing
                      ? 'cursor-crosshair'
                      : 'cursor-pointer'
                }`}
                style={{ maxWidth: '100%', height: 'auto' }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={() => {
                  setDraggingSection(null);
                  setDragOffset(null);
                  setSectionStartPos(null);
                  setSectionCurrentPos(null);
                  setIsDrawingSection(false);
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {selectedSection
                ? isDrawingSection
                  ? 'Click and drag on canvas to position/resize the section'
                  : isDrawing
                    ? `Click within the "${selectedSection}" section to add seats`
                    : 'Click "Position Section" to move/resize, or "Add Seats" to place seats'
                : 'Add a section first, then select it to position and add seats'}
            </p>
          </div>
        </div>
      </Card>

      {/* Seats List - Always show if there are seats or if a section is selected */}
      {(seats.length > 0 || (selectedSection && sections.length > 0)) && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Seats {seats.length > 0 && `(${seats.length})`}
            </h3>
            {selectedSection && (
              <span className="text-sm text-gray-600">
                {seats.filter((s) => s.section === selectedSection).length} in {selectedSection}
              </span>
            )}
          </div>
          {seats.length === 0 && selectedSection && seatmapType === 'reserved' && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              <p className="font-semibold mb-2">No seats added yet</p>
              <div className="space-y-1 text-xs">
                <p>1. Make sure "Reserved Seating" is selected above</p>
                <p>2. Select "{selectedSection}" from the dropdown</p>
                <p>3. Click the <strong>"Add Seats"</strong> button in the left panel</p>
                <p>4. Click anywhere within the "{selectedSection}" section on the canvas to add seats</p>
              </div>
            </div>
          )}
          {seatmapType === 'ga' && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              <p className="font-semibold mb-1">General Admission Mode</p>
              <p className="text-xs">Switch to "Reserved Seating" to add individual seats.</p>
            </div>
          )}
          {seats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {seats
                .filter((seat) => !selectedSection || seat.section === selectedSection)
                .map((seat) => {
                const section = sections.find((s) => s.name === seat.section);
                const isWithinBounds = section
                  ? seat.x >= section.x &&
                    seat.x <= section.x + section.width &&
                    seat.y >= section.y &&
                    seat.y <= section.y + section.height
                  : true;

                return (
                  <div
                    key={seat.seatId}
                    className={`p-3 border rounded ${
                      isWithinBounds
                        ? 'border-gray-200 bg-white'
                        : 'border-red-300 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium">{seat.seatId}</span>
                        {!isWithinBounds && (
                          <span className="ml-2 text-xs text-red-600">
                            (Outside section)
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteSeat(seat.seatId)}
                      >
                        Delete
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600 w-24">
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
                          className="w-24 h-8 text-sm"
                          placeholder="0"
                        />
                        <span className="text-xs text-gray-500">cents</span>
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
                          className="w-4 h-4"
                        />
                        <label className="text-sm text-gray-600">
                          Accessible Seat
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
          {selectedSection && seats.filter((s) => s.section !== selectedSection).length > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              <button
                onClick={() => setSelectedSection('')}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Show all seats ({seats.length})
              </button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
