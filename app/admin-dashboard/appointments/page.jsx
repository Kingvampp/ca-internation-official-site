'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AppointmentsPage() {
  const router = useRouter();

  useEffect(() => {
    console.log('Redirecting from /appointments to /bookings');
    router.replace('/admin-dashboard/bookings');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-64">
          <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">Redirecting to Booking Management...</p>
    </div>
  );
} 