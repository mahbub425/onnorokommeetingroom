import React, { useState, useEffect } from "react";
import { Room, Booking } from "@/types/database";
import { format, parseISO, addMinutes, isBefore, isAfter, differenceInMinutes, startOfDay, isSameDay, addHours } from "date-fns";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Generates 30-minute time slots for the entire day (e.g., "00:00", "00:30", ..., "23:30")
const generateDetailedTimeSlots = () => {
  const slots = [];
  let currentTime = parseISO(`2000-01-01T00:00:00`);
  const endTime = parseISO(`2000-01-01T23:59:00`); // Up to 23:30

  while (isBefore(currentTime, endTime) || (currentTime.getHours() === endTime.getHours() && currentTime.getMinutes() === endTime.getMinutes())) {
    slots.push(format(currentTime, "HH:mm"));
    currentTime = addMinutes(currentTime, 30);
  }
  return slots;
};

// Generates hourly labels for the header (e.g., "12 AM", "1 AM", ..., "11 PM")
const generateHourlyLabels = () => {
  const labels = [];
  for (let i = 0; i < 24; i++) {
    labels.push(format(parseISO(`2000-01-01T${i.toString().padStart(2, '0')}:00:00`), "h a"));
  }
  return labels;
};

interface DailyScheduleGridProps {
  rooms: Room[];
  bookings: Booking[];
  selectedDate: Date;
  onBookSlot: (roomId: string, date: Date, startTime: string, endTime: string) => void;
  onViewBooking: (booking: Booking) => void;
}

const DailyScheduleGrid: React.FC<DailyScheduleGridProps> = ({
  rooms,
  bookings,
  selectedDate,
  onBookSlot,
  onViewBooking,
}) => {
  const allDetailedTimeSlots = generateDetailedTimeSlots(); // 30-minute intervals for grid cells (48 slots)
  const allHourlyLabels = generateHourlyLabels(); // Hourly labels for the header (24 labels)

  const [visibleTimeStartIndex, setVisibleTimeStartIndex] = useState(0);

  useEffect(() => {
    const now = new Date();
    const isToday = isSameDay(selectedDate, now);

    if (isToday) {
      // Calculate the start index for the current hour, rounded down
      const currentHour = now.getHours();
      const currentHourStartIndex = currentHour * 2; // Each hour has 2 x 30-min slots
      setVisibleTimeStartIndex(currentHourStartIndex);
    } else {
      // For past or future dates, default to 9 AM (index 18 for 09:00)
      setVisibleTimeStartIndex(18);
    }
  }, [selectedDate]);


  // Calculate the visible 30-minute slots (12 slots for 6 hours)
  const visibleDetailedTimeSlots = allDetailedTimeSlots.slice(visibleTimeStartIndex, visibleTimeStartIndex + 12);
  // Calculate the visible hourly labels (6 labels for 6 hours)
  const visibleHourlyLabels = allHourlyLabels.slice(visibleTimeStartIndex / 2, (visibleTimeStartIndex / 2) + 6);

  const handlePrevTimeRange = () => {
    setVisibleTimeStartIndex(prev => Math.max(0, prev - 12)); // Move back 6 hours (12 x 30-min slots)
  };

  const handleNextTimeRange = () => {
    const maxStartIndex = allDetailedTimeSlots.length - 12; // Max index to show last 6 hours
    setVisibleTimeStartIndex(prev => Math.min(maxStartIndex, prev + 12)); // Move forward 6 hours
  };

  const getBookingsForRoomAndDate = (roomId: string, date: Date) => {
    const formattedSelectedDate = format(date, "yyyy-MM-dd");
    return bookings.filter((booking: Booking) =>
      booking.room_id === roomId && booking.date === formattedSelectedDate
    ).sort((a: Booking, b: Booking) => a.start_time.localeCompare(b.start_time));
  };

  // Only block if the entire selected date is in the past
  const canBookOnSelectedDate = !isBefore(startOfDay(selectedDate), startOfDay(new Date()));

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex justify-end items-end">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevTimeRange}
            disabled={visibleTimeStartIndex === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextTimeRange}
            disabled={visibleTimeStartIndex >= (allDetailedTimeSlots.length - 12)}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[auto_1fr] min-w-full border border-gray-200 dark:border-gray-700 rounded-lg shadow-md bg-white dark:bg-gray-800 relative">
        {/* Room Header Column - Sticky */}
        <div className="grid grid-rows-1 auto-rows-min sticky left-0 z-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-md">
          <div className="h-16 flex items-center justify-center p-2 font-semibold text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
            Rooms / Time
          </div>
          {rooms.map((room: Room) => (
            <div
              key={room.id}
              className="h-24 flex items-center p-2 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200"
            >
              <span
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: room.color || "#ccc" }}
              ></span>
              {room.name}
            </div>
          ))}
        </div>

        {/* Main Grid Content - Scrollable */}
        <div className="flex-1 overflow-x-hidden">
          {/* Hourly Time Headers */}
          <div className="grid grid-cols-12 border-b border-gray-200 dark:border-gray-700">
            {visibleHourlyLabels.map((label: string, _index: number) => (
              <div
                key={label}
                className="h-16 flex items-center justify-center p-2 font-semibold text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                style={{ gridColumn: 'span 2' }} // Each hourly label spans two 30-min columns
              >
                {label}
              </div>
            ))}
          </div>

          {/* Room Schedule Rows */}
          {rooms.map((room: Room) => {
            const dailyBookings = getBookingsForRoomAndDate(room.id, selectedDate);

            return (
              <div key={room.id} className="grid grid-cols-12 h-24 relative"> {/* This is the parent for absolute positioning */}
                {/* Render background 30-minute cells */}
                {visibleDetailedTimeSlots.map((slotTime: string, _index: number) => {
                  const isSlotOccupiedForClickability = dailyBookings.some((booking: Booking) => {
                    const bookingStart = parseISO(`2000-01-01T${booking.start_time}`);
                    const bookingEnd = parseISO(`2000-01-01T${booking.end_time}`);
                    const slotStartDateTime = parseISO(`2000-01-01T${slotTime}:00`);
                    const slotEndDateTime = addMinutes(slotStartDateTime, 30);
                    return (
                      (bookingStart.getTime() < slotEndDateTime.getTime() && bookingEnd.getTime() > slotStartDateTime.getTime())
                    );
                  });

                  // A slot is bookable if the entire selected date is not in the past
                  const canBookThisSlot = canBookOnSelectedDate;

                  return (
                    <div
                      key={`${room.id}-bg-slot-${slotTime}`}
                      className={cn(
                        "h-full flex items-center justify-center p-1 border-r border-b border-gray-200 dark:border-gray-700 last:border-r-0",
                        isSlotOccupiedForClickability ? "bg-gray-100 dark:bg-gray-700/10 cursor-not-allowed opacity-60" : (canBookThisSlot ? "bg-gray-50 dark:bg-gray-700/20 group hover:bg-gray-100 dark:hover:bg-gray-700/40 cursor-pointer" : "bg-gray-100 dark:bg-gray-700/10 cursor-not-allowed opacity-60")
                      )}
                      onClick={!isSlotOccupiedForClickability && canBookThisSlot ? () => {
                        // Pass the exact slotTime clicked, and calculate end time 1 hour later
                        const defaultEndTime = format(addHours(parseISO(`2000-01-01T${slotTime}:00`), 1), "HH:mm");
                        onBookSlot(room.id, selectedDate, slotTime, defaultEndTime);
                      } : undefined}
                      style={{ gridColumn: `span 1` }} // Each empty slot is 30 minutes, spans 1 grid column
                    >
                      {!isSlotOccupiedForClickability && <Plus className={cn("h-5 w-5 text-gray-400", canBookThisSlot ? "opacity-0 group-hover:opacity-100 transition-opacity" : "opacity-50")} />}
                    </div>
                  );
                })}

                {/* Render actual booking cards on top */}
                {dailyBookings.map((booking: Booking) => {
                  const bookingStart = parseISO(`2000-01-01T${booking.start_time}`);
                  const bookingEnd = parseISO(`2000-01-01T${booking.end_time}`);
                  const durationMinutes = differenceInMinutes(bookingEnd, bookingStart);

                  // Calculate start time relative to the beginning of the visible 6-hour window
                  const visibleWindowStart = parseISO(`2000-01-01T${allDetailedTimeSlots[visibleTimeStartIndex]}:00`);
                  const offsetMinutes = differenceInMinutes(bookingStart, visibleWindowStart);

                  // Only render if the booking is within or overlaps the visible window
                  if (isAfter(bookingEnd, visibleWindowStart) && isBefore(bookingStart, addMinutes(visibleWindowStart, 6 * 60))) {
                    // Calculate left position and width based on the 6-hour visible window (12 x 30-min slots)
                    // Each 30-min slot is 1/12th of the total width.
                    const totalVisibleMinutes = 6 * 60; // 6 hours in minutes
                    const leftPercentage = (offsetMinutes / totalVisibleMinutes) * 100;
                    const widthPercentage = (durationMinutes / totalVisibleMinutes) * 100;

                    // Ensure left is not negative (if booking starts before visible window)
                    const clampedLeft = Math.max(0, leftPercentage);
                    // Adjust width if booking starts before visible window
                    const adjustedWidth = (leftPercentage < 0) ? ((durationMinutes + offsetMinutes) / totalVisibleMinutes) * 100 : widthPercentage;
                    const clampedWidth = Math.min(100 - clampedLeft, adjustedWidth); // Ensure it doesn't go beyond 100%

                    return (
                      <div
                        key={`${room.id}-${booking.id}`}
                        className="h-full flex flex-col items-center justify-center p-2 rounded-md text-white cursor-pointer transition-colors duration-200 overflow-hidden absolute"
                        onClick={(e) => { e.stopPropagation(); onViewBooking(booking); }} // Stop propagation
                        style={{
                          backgroundColor: room.color || "#888",
                          left: `${clampedLeft}%`,
                          width: `${clampedWidth}%`,
                          zIndex: 10,
                          marginLeft: '4px', // Add some margin to separate cards
                          marginRight: '4px',
                        }}
                      >
                        <span className="font-medium text-center leading-tight text-sm truncate w-full px-1">
                          {booking.title}
                        </span>
                        <span className="text-xs text-center opacity-90 mt-1">
                          {format(bookingStart, "h:mma")} - {format(bookingEnd, "h:mma")}
                        </span>
                      </div>
                    );
                  }
                  return null; // Booking is outside the visible window
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DailyScheduleGrid;