import React from 'react';
import BookingForm from '@/components/booking/BookingForm';

export const metadata = {
  title: 'Book an Appointment | CA Automotive',
  description: 'Schedule your automotive service with our expert technicians. Book repairs, maintenance, or detailing services.',
  keywords: 'car repair booking, auto service appointment, vehicle maintenance schedule',
};

export default function BookingPage() {
  return (
    <div className="booking-page py-10 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Book Your Appointment</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Schedule a service with our expert technicians. We'll take care of your vehicle with the attention to detail it deserves.
            </p>
          </div>
          
          <div className="bg-white shadow-lg rounded-lg p-6 md:p-10">
            <BookingForm />
          </div>
          
          <div className="mt-10 text-center">
            <h2 className="text-xl font-semibold mb-4">Need Immediate Assistance?</h2>
            <p className="mb-4">
              Call us at <a href="tel:+15551234567" className="text-blue-600 font-medium">(555) 123-4567</a>
            </p>
            <p className="text-sm text-gray-500">
              Our business hours are Monday to Friday, 8:00 AM to 6:00 PM. Saturday, 9:00 AM to 3:00 PM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 