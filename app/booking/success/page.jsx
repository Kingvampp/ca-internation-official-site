import React from 'react';
import Link from 'next/link';
import { FiCheckCircle, FiCalendar, FiHome } from 'react-icons/fi';

export const metadata = {
  title: 'Booking Confirmed | CA Automotive',
  description: 'Your appointment has been scheduled successfully. We look forward to serving you.',
};

export default function BookingSuccessPage() {
  return (
    <div className="booking-success-page py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-green-500 mb-4">
            <FiCheckCircle className="mx-auto h-20 w-20" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Booking Confirmed!</h1>
          
          <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
            <p className="text-lg text-gray-700 mb-6">
              Thank you for scheduling an appointment with CA Automotive. We have received your booking request and will contact you shortly to confirm the details.
            </p>
            
            <div className="inline-flex items-center text-sm text-gray-500 mb-6">
              <FiCalendar className="mr-2" />
              <span>Check your email for booking details</span>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                If you need to make any changes to your appointment, please contact us at:
              </p>
              <p className="font-medium">
                <a href="tel:+15551234567" className="text-blue-600 hover:underline">(555) 123-4567</a>
              </p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Link href="/" className="inline-flex items-center px-5 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <FiHome className="mr-2" />
              Return to Home
            </Link>
            <Link href="/services" className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              <FiCalendar className="mr-2" />
              View Our Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}