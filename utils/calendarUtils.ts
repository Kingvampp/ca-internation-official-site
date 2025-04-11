import { Booking } from './bookingService';
import { Timestamp } from 'firebase/firestore';

/**
 * Utility functions for calendar integrations
 */

// Format date to iCalendar format (e.g., 20220505T100000Z)
const formatDateToICS = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
};

// Create a unique UID for iCalendar events
const generateUID = (booking: Booking): string => {
  const id = booking.id || 'unknown';
  const timestamp = new Date().getTime();
  return `booking-${id}-${timestamp}@ca-international-autobody`;
};

// Convert Timestamp or Date to Date object
const ensureDate = (dateValue: Date | Timestamp): Date => {
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  // Handle Firestore Timestamp objects
  if (typeof dateValue === 'object' && 'toDate' in dateValue && typeof dateValue.toDate === 'function') {
    return dateValue.toDate();
  }
  
  // Fall back to current date if invalid
  console.warn('Invalid date value provided to calendar utility:', dateValue);
  return new Date();
};

// Generate iCalendar (.ics) file content from booking
export const generateICSFile = (booking: Booking): string => {
  // Ensure we have valid date objects
  const startDate = ensureDate(booking.preferredDate);
  
  // Default duration is 1 hour
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  
  // Create event description
  const description = `
Service: ${booking.service}
Vehicle: ${booking.vehicleDetails.year} ${booking.vehicleDetails.make} ${booking.vehicleDetails.model}
Customer: ${booking.customerName}
Phone: ${booking.customerPhone}
Email: ${booking.customerEmail}
${booking.message ? `Notes: ${booking.message}` : ''}
  `.trim();

  // Format location
  const location = 'CA International Autobody';
  
  // Generate the ICS content
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${generateUID(booking)}`,
    `DTSTAMP:${formatDateToICS(new Date())}`,
    `DTSTART:${formatDateToICS(startDate)}`,
    `DTEND:${formatDateToICS(endDate)}`,
    `SUMMARY:${booking.service} - ${booking.vehicleDetails.make} ${booking.vehicleDetails.model}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
};

// Generate filename for calendar download
export const getCalendarFilename = (booking: Booking): string => {
  const date = ensureDate(booking.preferredDate);
  
  const dateStr = date.toISOString().split('T')[0];
  const safeService = booking.service.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  
  return `ca-autobody-${safeService}-${dateStr}.ics`;
};

// Create a download URL for the ICS file
export const createCalendarDownloadUrl = (icsContent: string): string => {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
}; 