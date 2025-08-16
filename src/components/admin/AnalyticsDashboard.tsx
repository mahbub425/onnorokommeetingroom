import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/auth";
import { useToast } from "@/components/ui/use-toast";
import { Room, Booking } from "@/types/database";
import AnalyticsFilters from "./AnalyticsFilters";
import AnalyticsCards from "./AnalyticsCards";
import BookingsByRoomChart from "./BookingsByRoomChart";
import DailyBookingGrowthChart from "./DailyBookingGrowthChart";
import { format, isWithinInterval } from "date-fns";
import { DateRange } from "react-day-picker"; // Import DateRange type

interface AnalyticsDashboardProps {
  filterRoomId: string | null;
  setFilterRoomId: (id: string | null) => void;
  filterDateRange: DateRange; // Using DateRange type
  setFilterDateRange: (range: DateRange | undefined) => void; // Using DateRange type
  rooms: Room[];
  saveAdminPreference: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  filterRoomId,
  setFilterRoomId,
  filterDateRange,
  setFilterDateRange,
  rooms,
  saveAdminPreference,
}) => {
  const { toast } = useToast();
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalBookings, setTotalBookings] = useState<number>(0); // This will now be filtered total
  const [todaysBookings, setTodaysBookings] = useState<number>(0); // This will now be filtered for today
  const [bookingsData, setBookingsData] = useState<Booking[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [filterRoomId, filterDateRange]);

  const fetchAnalyticsData = async () => {
    // Fetch Total Active Users (unfiltered)
    const { count: usersCount, error: usersError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('status', 'active');

    if (usersError) {
      toast({ title: "Error", description: "Failed to fetch total users.", variant: "destructive" });
    } else {
      setTotalUsers(usersCount || 0);
    }

    // Fetch Bookings data for all cards and charts (filtered data)
    let query = supabase.from('bookings').select(`
      *,
      profiles (
        name,
        pin,
        department
      ),
      rooms (
        name
      )
    `, { count: 'exact' }); // Moved count: 'exact' here

    if (filterRoomId) {
      query = query.eq('room_id', filterRoomId);
    }
    if (filterDateRange.from) {
      query = query.gte('date', format(filterDateRange.from, 'yyyy-MM-dd'));
    }
    if (filterDateRange.to) {
      query = query.lte('date', format(filterDateRange.to, 'yyyy-MM-dd'));
    }

    const { data: bookings, error: bookingsError, count: filteredBookingsCount } = await query.order('date', { ascending: true }).limit(1000); // Removed count from limit

    if (bookingsError) {
      toast({ title: "Error", description: "Failed to fetch filtered bookings data.", variant: "destructive" });
    } else {
      const bookingsWithDetails = bookings?.map(booking => ({
        ...booking,
        user_name: booking.profiles?.name,
        user_pin: booking.profiles?.pin,
        user_department: booking.profiles?.department,
        room_name: booking.rooms?.name,
      })) as Booking[] || [];
      
      setBookingsData(bookingsWithDetails);
      setTotalBookings(filteredBookingsCount || 0); // Set total bookings based on filters

      // Calculate Today's Bookings from the fetched filtered data
      const today = new Date();
      let countToday = 0;
      if (filterDateRange.from && filterDateRange.to) {
        // Check if today is within the selected date range
        if (isWithinInterval(today, { start: filterDateRange.from, end: filterDateRange.to })) {
          countToday = bookingsWithDetails.filter(b => format(new Date(b.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')).length;
        }
      } else if (!filterDateRange.from && !filterDateRange.to) {
        // If no date range filter, count all bookings for today
        countToday = bookingsWithDetails.filter(b => format(new Date(b.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')).length;
      }
      setTodaysBookings(countToday);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

      <AnalyticsFilters
        filterRoomId={filterRoomId}
        setFilterRoomId={setFilterRoomId}
        filterDateRange={filterDateRange}
        setFilterDateRange={setFilterDateRange}
        rooms={rooms}
        onApplyFilters={fetchAnalyticsData}
        onSavePreferences={saveAdminPreference}
      />

      <AnalyticsCards
        totalUsers={totalUsers}
        totalBookings={totalBookings}
        todaysBookings={todaysBookings}
        rating={4.6} // Static rating as per requirements
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BookingsByRoomChart bookings={bookingsData} rooms={rooms} />
        <DailyBookingGrowthChart bookings={bookingsData} rooms={rooms} />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;