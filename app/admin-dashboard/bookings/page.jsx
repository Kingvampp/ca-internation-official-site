import { Suspense } from 'react';
import BookingListAdmin from '@/components/admin/BookingListAdmin';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export const metadata = {
  title: 'Booking Management | Admin Dashboard',
  description: 'Manage customer bookings and appointment requests',
};

export default function AdminBookingsPage() {
  return (
    <div className="admin-bookings-page">
      <AdminPageHeader 
        title="Booking Management" 
        description="View and manage customer booking requests"
        icon="calendar"
      />
      
      <div className="mt-6">
        <Suspense fallback={<div className="text-center py-10">Loading booking data...</div>}>
          <BookingListAdmin />
        </Suspense>
      </div>
    </div>
  );
} 