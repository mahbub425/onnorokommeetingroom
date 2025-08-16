import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/auth";
import { useToast } from "@/components/ui/use-toast";
import { Room, Booking } from "@/types/database";
import AnalyticsFilters from "./AnalyticsFilters";
import AnalyticsCards from "./AnalyticsCards";
import BookingsByRoomChart from "./BookingsByRoomChart";
import DailyBookingGrowthChart from "./DailyBookingGrowthChart";
import { format, startOfDay, isWithinInterval } from "date-fns";
import { DateRange } from "react-day-picker";

interface AnalyticsDashboardProps {
  filterRoomId: string | null;
  setFilterRoomId: (id: string | null) => void;
  filterDateRange: DateRange;
  setFilterDateRange: (range: DateRange | undefined) => void;
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
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [todaysBookings, setTodaysBookings] = useState<number>(0);
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

    // Determine if any filter is active for total bookings calculation
    const isAnyFilterActive = filterRoomId !== null || filterDateRange.from !== undefined || filterDateRange.to !== undefined;

    let totalBookingsCount = 0;
    if (!isAnyFilterActive) {
      // Fetch ABSOLUTE TOTAL Bookings when no filters are active
      const { count, error } = await supabase
        .from('bookings')
        .select('id', { count: 'exact' });
      
      if (error) {
        toast({ title: "Error", description: "Failed to fetch overall total bookings.", variant: "destructive" });
      } else {
        totalBookingsCount = count || 0;
      }
    }

    // Fetch Bookings data for charts and "Today's Bookings" (always filtered by current filters)
    let filteredBookingsQuery = supabase.from('bookings').select(`
      *,
      profiles (
        name,
        pin,
        department
      ),
      rooms (
        name
      )
    `, { count: 'exact' }); // Count exact for the filtered results

    if (filterRoomId) {
      filteredBookingsQuery = filteredBookingsQuery.eq('room_id', filterRoomId);
    }
    if (filterDateRange.from) {
      filteredBookingsQuery = filteredBookingsQuery.gte('date', format(filterDateRange.from, 'yyyy-MM-dd'));
    }
    if (filterDateRange.to) {
      filteredBookingsQuery = filteredBookingsQuery.lte('date', format(filterDateRange.to, 'yyyy-MM-dd'));
    }

    const { data: filteredBookings, error: filteredBookingsError, count: currentFilteredBookingsCount } = await filteredBookingsQuery.order('date', { ascending: true });

    if (filteredBookingsError) {
      toast({ title: "Error", description: "Failed to fetch filtered bookings data.", variant: "destructive" });
    } else {
      const bookingsWithDetails = filteredBookings?.map(booking => ({
        ...booking,
        user_name: booking.profiles?.name,
        user_pin: booking.profiles?.pin,
        user_department: booking.profiles?.department,
        room_name: booking.rooms?.name,
      })) as Booking[] || [];
      
      setBookingsData(bookingsWithDetails);
      
      // Set totalBookings based on whether filters are active
      setTotalBookings(isAnyFilterActive ? (currentFilteredBookingsCount || 0) : totalBookingsCount);
      
      // Calculate Today's Bookings from the fetched filtered data
      const today = startOfDay(new Date());
      let countToday = 0;

      // Check if today falls within the selected date range filter
      const isTodayWithinFilterRange = (filterDateRange.from && filterDateRange.to)
        ? isWithinInterval(today, { start: startOfDay(filterDateRange.from), end: startOfDay(filterDateRange.to) })
        : true; // If no date range filter, consider today as within range

      if (isTodayWithinFilterRange) {
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