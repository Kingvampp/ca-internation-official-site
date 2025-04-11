'use client';

import React, { useState } from 'react';
import { FaCalendarAlt, FaCalendarPlus, FaDownload } from 'react-icons/fa';
import { Booking } from '@/utils/bookingService';
import { generateICSFile, getCalendarFilename, createCalendarDownloadUrl } from '@/utils/calendarUtils';

interface CalendarIntegrationProps {
  booking: Booking;
}

// Helper function to ensure we have a Date object
const ensureDateObject = (dateValue: any): Date => {
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  // Handle Firestore Timestamp objects
  if (typeof dateValue === 'object' && dateValue !== null && 'toDate' in dateValue && typeof dateValue.toDate === 'function') {
    return dateValue.toDate();
  }
  
  // Try to convert string or number to Date
  try {
    return new Date(dateValue);
  } catch (e) {
    console.warn('Invalid date value:', dateValue);
    return new Date();
  }
};

export default function CalendarIntegration({ booking }: CalendarIntegrationProps) {
  const [showOptions, setShowOptions] = useState(false);
  
  // Handle downloading the ICS file
  const handleDownloadCalendar = () => {
    try {
      // Generate ICS content
      const icsContent = generateICSFile(booking);
      
      // Create download link
      const downloadUrl = createCalendarDownloadUrl(icsContent);
      const filename = getCalendarFilename(booking);
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
      
      // Close options
      setShowOptions(false);
    } catch (error) {
      console.error('Error creating calendar event:', error);
      alert('Could not create calendar event. Please try again.');
    }
  };
  
  // Handle adding to Google Calendar
  const handleAddToGoogleCalendar = () => {
    try {
      // Ensure we have a valid date
      const startDate = ensureDateObject(booking.preferredDate);
      
      // Default duration is 1 hour
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      
      // Format dates for Google Calendar
      const formatGoogleDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      };
      
      // Create event details
      const eventDetails = {
        text: `${booking.service} - ${booking.vehicleDetails.make} ${booking.vehicleDetails.model}`,
        dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
        details: `
Service: ${booking.service}
Vehicle: ${booking.vehicleDetails.year} ${booking.vehicleDetails.make} ${booking.vehicleDetails.model}
Customer: ${booking.customerName}
Phone: ${booking.customerPhone}
Email: ${booking.customerEmail}
${booking.message ? `Notes: ${booking.message}` : ''}
        `.trim(),
        location: 'CA International Autobody'
      };
      
      // Build Google Calendar URL
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.text)}&dates=${eventDetails.dates}&details=${encodeURIComponent(eventDetails.details)}&location=${encodeURIComponent(eventDetails.location)}`;
      
      // Open in new tab
      window.open(googleCalendarUrl, '_blank');
      
      // Close options
      setShowOptions(false);
    } catch (error) {
      console.error('Error adding to Google Calendar:', error);
      alert('Could not add to Google Calendar. Please try again.');
    }
  };
  
  return (
    <div className="calendar-integration relative">
      {/* Main Calendar Button */}
      <button
        type="button"
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors px-3 py-2 rounded-md bg-blue-50 hover:bg-blue-100"
      >
        <FaCalendarAlt />
        <span>Add to Calendar</span>
      </button>
      
      {/* Options Dropdown */}
      {showOptions && (
        <div className="absolute mt-2 right-0 bg-white shadow-lg rounded-md border border-gray-200 p-2 z-10 w-52">
          <button
            type="button"
            onClick={handleDownloadCalendar}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-left"
          >
            <FaDownload />
            <span>Download .ics file</span>
          </button>
          
          <button
            type="button" 
            onClick={handleAddToGoogleCalendar}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-left"
          >
            <FaCalendarPlus />
            <span>Add to Google Calendar</span>
          </button>
        </div>
      )}
    </div>
  );
} 