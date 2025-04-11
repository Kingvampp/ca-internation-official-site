'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiPhone, 
  FiMail,
  FiTruck,
  FiTag,
  FiCheckCircle,
  FiClock as FiPending,
  FiXCircle,
  FiCheck,
  FiList,
  FiFilter
} from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import "react-datepicker/dist/react-datepicker.css";
import './BookingCalendar.css';

const BookingCalendar = ({ bookings = [], updateBookingStatus, loading = false }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month');
  const [filteredStatuses, setFilteredStatuses] = useState({
    pending: true,
    confirmed: true,
    completed: true,
    cancelled: true
  });
  const [viewMode, setViewMode] = useState('day'); // 'day', 'filter', or 'all'
  const [activeFilter, setActiveFilter] = useState(null);
  
  // Enhanced status colors
  const statusColors = {
    pending: "#facc15", // Yellow
    confirmed: "#22c55e", // Green
    completed: "#3b82f6", // Blue
    cancelled: "#ef4444", // Red
  };

  // Enhanced status styles
  const statusStyles = {
    pending: {
      bg: "bg-yellow-50",
      text: "text-yellow-800",
      border: "border-yellow-400",
      icon: <FiPending className="mr-1" />
    },
    confirmed: {
      bg: "bg-green-50",
      text: "text-green-800",
      border: "border-green-400",
      icon: <FiCheckCircle className="mr-1" />
    },
    completed: {
      bg: "bg-blue-50",
      text: "text-blue-800",
      border: "border-blue-400",
      icon: <FiCheck className="mr-1" />
    },
    cancelled: {
      bg: "bg-red-50",
      text: "text-red-800",
      border: "border-red-400",
      icon: <FiXCircle className="mr-1" />
    }
  };

  // Check if all filters are active or none (which means all are shown)
  const allFiltersActive = useMemo(() => {
    const activeFilters = Object.values(filteredStatuses).filter(v => v).length;
    return activeFilters === 4 || activeFilters === 0;
  }, [filteredStatuses]);

  // Function to get all dates with bookings - improved for Firestore data
  const getBookingDates = useMemo(() => {
    // Only filter by active statuses
    const filteredBookings = bookings.filter(booking => 
      booking.status && filteredStatuses[booking.status.toLowerCase()]
    );
    
    // Debug the first booking to understand data structure
    if (filteredBookings.length > 0) {
      console.log("Sample booking structure:", {
        id: filteredBookings[0].id,
        date: filteredBookings[0].date,
        preferredDate: filteredBookings[0].preferredDate,
        status: filteredBookings[0].status,
        fields: Object.keys(filteredBookings[0])
      });
    } else {
      console.log("No bookings match current filters");
    }
    
    return filteredBookings.reduce((acc, booking) => {
      // Check both date and preferredDate fields
      const dateField = booking.preferredDate || booking.date;
      if (!dateField) return acc;
      
      // Ensure proper date handling for Firestore Timestamp or date strings
      let bookingDate;
      try {
        // Handle different date formats
        if (dateField && typeof dateField === 'object' && 'toDate' in dateField) {
          bookingDate = dateField.toDate(); // Firestore Timestamp
        } else if (dateField instanceof Date) {
          bookingDate = dateField; // Already a Date object
        } else if (typeof dateField === 'string') {
          bookingDate = new Date(dateField); // Date string
        } else if (typeof dateField === 'number') {
          bookingDate = new Date(dateField); // Timestamp in milliseconds
        } else {
          console.warn('Unknown date type for booking:', booking.id, dateField);
          return acc;
        }
      } catch (e) {
        console.warn('Invalid booking date:', dateField, e);
        return acc;
      }
      
      // Skip invalid dates
      if (isNaN(bookingDate.getTime())) {
        console.warn('Invalid date detected:', dateField);
        return acc;
      }
      
      const dateString = bookingDate.toDateString();
      
      if (!acc[dateString]) {
        acc[dateString] = {
          date: bookingDate,
          statuses: {}
        };
      }
      
      const status = booking.status.toLowerCase();
      acc[dateString].statuses[status] = (acc[dateString].statuses[status] || 0) + 1;
      
      return acc;
    }, {});
  }, [bookings, filteredStatuses]);

  // Function to get bookings for selected date with better Firestore support
  const getBookingsForDate = (date) => {
    if (!date) return [];
    
    const selectedDateString = date.toDateString();
    
    return bookings.filter(booking => {
      // Check both preferredDate and date fields
      const dateField = booking.preferredDate || booking.date;
      if (!dateField) return false;
      
      // Handle different date formats from Firestore
      let bookingDate;
      try {
        if (dateField && typeof dateField === 'object' && 'toDate' in dateField) {
          bookingDate = dateField.toDate(); // Firestore Timestamp
        } else if (dateField instanceof Date) {
          bookingDate = dateField; // Already a Date object
        } else if (typeof dateField === 'string') {
          bookingDate = new Date(dateField); // Date string
        } else if (typeof dateField === 'number') {
          bookingDate = new Date(dateField); // Timestamp in milliseconds
        } else {
          console.warn('Unknown date type for booking:', booking.id, dateField);
          return false;
        }
      } catch (e) {
        console.warn('Invalid booking date:', dateField, e);
        return false;
      }
      
      // Skip invalid dates
      if (isNaN(bookingDate.getTime())) {
        console.warn('Invalid date detected:', dateField);
        return false;
      }
      
      return bookingDate.toDateString() === selectedDateString && 
             filteredStatuses[booking.status.toLowerCase()];
    });
  };

  // Function to get all bookings of a specific status
  const getBookingsByStatus = (status) => {
    return bookings
      .filter(booking => booking.status.toLowerCase() === status.toLowerCase())
      .sort((a, b) => {
        // Sort by date first - handle both preferredDate and date fields
        const getBookingDate = (booking) => {
          const dateField = booking.preferredDate || booking.date;
          if (!dateField) return new Date(0); // Default to epoch if no date
          
          // Handle different date formats
          try {
            if (dateField && typeof dateField === 'object' && 'toDate' in dateField) {
              return dateField.toDate(); // Firestore Timestamp
            } else if (dateField instanceof Date) {
              return dateField; // Already a Date object
            } else if (typeof dateField === 'string') {
              return new Date(dateField); // Date string
            } else if (typeof dateField === 'number') {
              return new Date(dateField); // Timestamp in milliseconds
            } else {
              return new Date(0); // Default to epoch on error
            }
          } catch (e) {
            console.warn('Error parsing date:', e);
            return new Date(0); // Default to epoch on error
          }
        };
        
        const dateA = getBookingDate(a);
        const dateB = getBookingDate(b);
        
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
        
        // If same date, sort by time
        if (a.time && b.time) {
          return a.time.localeCompare(b.time);
        }
        return 0;
      });
  };

  // Function to get all filtered bookings
  const getAllFilteredBookings = useMemo(() => {
    // Extract the date handling function to reuse it
    const getBookingDate = (booking) => {
      const dateField = booking.preferredDate || booking.date;
      if (!dateField) return new Date(0); // Default to epoch if no date
      
      // Handle different date formats
      try {
        if (dateField && typeof dateField === 'object' && 'toDate' in dateField) {
          return dateField.toDate(); // Firestore Timestamp
        } else if (dateField instanceof Date) {
          return dateField; // Already a Date object
        } else if (typeof dateField === 'string') {
          return new Date(dateField); // Date string
        } else if (typeof dateField === 'number') {
          return new Date(dateField); // Timestamp in milliseconds
        } else {
          return new Date(0); // Default to epoch on error
        }
      } catch (e) {
        console.warn('Error parsing date:', e);
        return new Date(0); // Default to epoch on error
      }
    };
    
    return bookings
      .filter(booking => filteredStatuses[booking.status.toLowerCase()])
      .sort((a, b) => {
        // Sort by date first
        const dateA = getBookingDate(a);
        const dateB = getBookingDate(b);
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
        
        // If same date, sort by time
        if (a.time && b.time) {
          return a.time.localeCompare(b.time);
        }
        return 0;
      });
  }, [bookings, filteredStatuses]);

  // Current selected date bookings
  const selectedDateBookings = useMemo(() => 
    getBookingsForDate(selectedDate), 
    [selectedDate, bookings, filteredStatuses]
  );
  
  // All bookings for the active filter
  const filteredBookings = useMemo(() => {
    if (!activeFilter) return [];
    return getBookingsByStatus(activeFilter);
  }, [activeFilter, bookings]);

  // State for expanded booking details
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  
  // Toggle expanded booking details
  const toggleBookingDetails = (bookingId) => {
    if (expandedBookingId === bookingId) {
      setExpandedBookingId(null);
    } else {
      setExpandedBookingId(bookingId);
    }
  };

  // Format booking date with improved error handling and Firestore support
  const formatBookingDate = (booking) => {
    if (!booking) return 'No booking data';
    
    // Check both preferredDate and date fields
    const dateField = booking.preferredDate || booking.date;
    
    if (!dateField) return 'No date specified';
    
    try {
      // Handle different date formats
      let bookingDate;
      
      if (dateField && typeof dateField === 'object' && 'toDate' in dateField) {
        // Firestore Timestamp
        bookingDate = dateField.toDate();
      } else if (dateField instanceof Date) {
        // JavaScript Date object
        bookingDate = dateField;
      } else if (typeof dateField === 'string') {
        // Date string
        bookingDate = new Date(dateField);
      } else if (typeof dateField === 'number') {
        // Timestamp in milliseconds
        bookingDate = new Date(dateField);
      } else {
        return 'Invalid date format';
      }
      
      // Validate the date
      if (isNaN(bookingDate.getTime())) {
        return 'Invalid date';
      }
      
      // Format the date: Day of week, Month Day, Year
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      
      return bookingDate.toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Error formatting booking date:', error);
      return 'Date formatting error';
    }
  };

  // Format the timestamp to show only time in Pacific timezone
  const formatTimeOnly = (timestamp) => {
    if (!timestamp) return "No time specified";
    
    try {
      // Convert to Date object from various formats
      let dateObj;
      
      if (typeof timestamp === 'object' && 'toDate' in timestamp) {
        // Firestore Timestamp
        dateObj = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        // JavaScript Date object
        dateObj = timestamp;
      } else if (typeof timestamp === 'string') {
        // ISO string or date string
        dateObj = new Date(timestamp);
      } else if (typeof timestamp === 'number') {
        // Unix timestamp (milliseconds)
        dateObj = new Date(timestamp);
      } else {
        return "Invalid time format";
      }
      
      if (isNaN(dateObj.getTime())) {
        return "Invalid time";
      }
      
      // Format time to Pacific Time
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Los_Angeles' // Pacific Time
      }).format(dateObj);
      
    } catch (error) {
      console.warn('Error formatting time:', error);
      return "Time format error";
    }
  };

  // Safe time formatting with improved error handling
  const formatTime = (timeString) => {
    if (!timeString) return "No time specified";
    
    // Handle different time formats
    try {
      // If it's already in HH:MM format
      if (typeof timeString === 'string' && timeString.match(/^\d{1,2}:\d{2}$/)) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
      } 
      
      // If it's a Date object or timestamp
      if (timeString instanceof Date || (typeof timeString === 'object' && 'toDate' in timeString)) {
        const date = timeString instanceof Date ? timeString : timeString.toDate();
        return date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        });
      }
      
      // If it's a timestamp number
      if (typeof timeString === 'number') {
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        });
      }
      
      // Fallback
      return timeString.toString();
    } catch (error) {
      console.warn('Error formatting time:', error, timeString);
      return "Invalid time format";
    }
  };

  // Format date for display
  const formatDate = (date) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Custom day renderer for DatePicker to show booking indicators
  const renderDayContents = (day, date) => {
    const dateString = date.toDateString();
    const hasBookings = getBookingDates[dateString];
    const isToday = date.toDateString() === new Date().toDateString();
    const isSelected = date.toDateString() === selectedDate.toDateString();
    
    // Get day of month as string
    const dayStr = day.toString();
    
    // Determine background color based on booking statuses
    let bgColor = 'transparent';
    let hasBorder = false;
    
    if (hasBookings) {
      const statuses = Object.keys(hasBookings.statuses).filter(status => filteredStatuses[status]);
      
      if (statuses.length > 1) {
        // Multiple booking types
        bgColor = 'rgba(148, 163, 184, 0.2)';
        hasBorder = true;
      } else if (statuses.length === 1) {
        // Single booking type
        const status = statuses[0];
        switch (status) {
          case 'pending':
            bgColor = 'rgba(250, 204, 21, 0.15)';
            break;
          case 'confirmed':
            bgColor = 'rgba(34, 197, 94, 0.15)';
            break;
          case 'completed':
            bgColor = 'rgba(59, 130, 246, 0.15)';
            break;
          case 'cancelled':
            bgColor = 'rgba(239, 68, 68, 0.15)';
            break;
          default:
            bgColor = 'transparent';
        }
      }
    }
    
    // Custom styles for the day content
    const dayContentStyle = {
      backgroundColor: bgColor,
      borderRadius: '8px',
      boxShadow: hasBorder ? '0 0 0 1px rgba(0,0,0,0.1) inset' : 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      position: 'relative'
    };
    
    return (
      <div 
        className={`calendar-day-content ${isSelected ? 'calendar-day-selected' : ''}`}
        style={dayContentStyle}
      >
        <span className={`calendar-day-number ${isToday ? 'today' : ''}`}>{dayStr}</span>
        
        {hasBookings && (
          <div className="calendar-day-indicators">
            {Object.entries(hasBookings.statuses).map(([status, count]) => (
              filteredStatuses[status] && (
                <span
                  key={status}
                  className={`day-indicator-dot dot-${status}`}
                  style={{
                    width: count > 1 ? '8px' : '6px',
                    height: count > 1 ? '8px' : '6px',
                    opacity: 0.9
                  }}
                  title={`${count} ${status} booking${count > 1 ? 's' : ''}`}
                />
              )
            ))}
          </div>
        )}
      </div>
    );
  };

  // Toggle status filter
  const toggleStatus = (status) => {
    // If we're in single-filter mode, handle differently
    if (Object.values(filteredStatuses).filter(v => v).length === 1 && filteredStatuses[status]) {
      // If trying to disable the only enabled filter, enable all instead
      setFilteredStatuses({
        pending: true,
        confirmed: true,
        completed: true,
        cancelled: true
      });
      setActiveFilter(null);
      setViewMode('all');
    } else if (allFiltersActive) {
      // If all filters are active, switch to only this one
      setFilteredStatuses({
        pending: status === 'pending',
        confirmed: status === 'confirmed',
        completed: status === 'completed',
        cancelled: status === 'cancelled'
      });
      setActiveFilter(status);
      setViewMode('filter');
    } else {
      // Toggle single status and turn off others
      setFilteredStatuses({
        pending: status === 'pending',
        confirmed: status === 'confirmed',
        completed: status === 'completed',
        cancelled: status === 'cancelled'
      });
      
      // Set this as the active filter
      setActiveFilter(status);
      setViewMode('filter');
    }
  };
  
  // Show all filtered bookings
  const showAllFiltered = () => {
    if (viewMode !== 'all') {
      setViewMode('all');
      setActiveFilter(null);
    } else {
      setViewMode('day');
    }
  };
  
  // Group bookings by date for filter view
  const groupedFilteredBookings = useMemo(() => {
    if (!filteredBookings.length) return {};
    
    return filteredBookings.reduce((acc, booking) => {
      // Use preferredDate or fall back to date
      const dateField = booking.preferredDate || booking.date;
      if (!dateField) return acc;
      
      // Handle different date formats
      let bookingDate;
      try {
        if (dateField && typeof dateField === 'object' && 'toDate' in dateField) {
          bookingDate = dateField.toDate(); // Firestore Timestamp
        } else if (dateField instanceof Date) {
          bookingDate = dateField; // Already a Date object
        } else if (typeof dateField === 'string') {
          bookingDate = new Date(dateField); // Date string
        } else {
          console.warn('Unknown date type for booking:', booking.id, dateField);
          return acc;
        }
      } catch (e) {
        console.warn('Invalid booking date:', dateField, e);
        return acc;
      }
      
      // Skip invalid dates
      if (isNaN(bookingDate.getTime())) {
        console.warn('Invalid date detected:', dateField);
        return acc;
      }
      
      const dateString = bookingDate.toDateString();
      
      if (!acc[dateString]) {
        acc[dateString] = {
          date: bookingDate,
          bookings: []
        };
      }
      
      acc[dateString].bookings.push(booking);
      return acc;
    }, {});
  }, [filteredBookings]);
  
  // Group all filtered bookings by date
  const groupedAllFilteredBookings = useMemo(() => {
    if (!getAllFilteredBookings.length) return {};
    
    return getAllFilteredBookings.reduce((acc, booking) => {
      // Use preferredDate or fall back to date
      const dateField = booking.preferredDate || booking.date;
      if (!dateField) return acc;
      
      // Handle different date formats
      let bookingDate;
      try {
        if (dateField && typeof dateField === 'object' && 'toDate' in dateField) {
          bookingDate = dateField.toDate(); // Firestore Timestamp
        } else if (dateField instanceof Date) {
          bookingDate = dateField; // Already a Date object
        } else if (typeof dateField === 'string') {
          bookingDate = new Date(dateField); // Date string
        } else {
          console.warn('Unknown date type for booking:', booking.id, dateField);
          return acc;
        }
      } catch (e) {
        console.warn('Invalid booking date:', dateField, e);
        return acc;
      }
      
      // Skip invalid dates
      if (isNaN(bookingDate.getTime())) {
        console.warn('Invalid date detected:', dateField);
        return acc;
      }
      
      const dateString = bookingDate.toDateString();
      
      if (!acc[dateString]) {
        acc[dateString] = {
          date: bookingDate,
          bookings: []
        };
      }
      
      acc[dateString].bookings.push(booking);
      return acc;
    }, {});
  }, [getAllFilteredBookings]);

  // Effect to detect when all filters are active and show the "all" view
  useEffect(() => {
    if (allFiltersActive && !activeFilter) {
      setViewMode('all');
    }
  }, [filteredStatuses, allFiltersActive, activeFilter]);

  // Handle booking status update with animation
  const handleUpdateBookingStatus = (bookingId, newStatus) => {
    // First check if bookingId and newStatus are valid
    if (!bookingId || !newStatus) {
      console.error('Invalid booking ID or status');
      return;
    }

    // Log the status update attempt
    console.log(`Updating booking ${bookingId} to status: ${newStatus}`);
    
    // Add subtle animation to the booking card
    const bookingElement = document.getElementById(`booking-${bookingId}`);
    if (bookingElement) {
      bookingElement.style.animation = 'statusChange 0.5s ease';
      setTimeout(() => {
        bookingElement.style.animation = '';
      }, 500);
    }
    
    // Make sure updateBookingStatus is a function before calling it
    if (typeof updateBookingStatus === 'function') {
      // Normalize status to lowercase for the API
      const normalizedStatus = newStatus.toLowerCase();
      // Call the parent component's update function
      updateBookingStatus(bookingId, normalizedStatus);
    } else {
      console.error('updateBookingStatus is not a function', typeof updateBookingStatus);
      alert('Cannot update booking status at this time. Please refresh the page and try again.');
    }
  };

  // Function to produce a cleaner display for raw timestamp values
  const formatRawTimestamp = (timestamp) => {
    if (!timestamp) return "";
    
    // Convert to Date object
    let date;
    try {
      if (typeof timestamp === 'object' && 'toDate' in timestamp) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string') {
        // Check if it looks like an ISO string with T
        if (timestamp.includes('T')) {
          // Hide the raw ISO timestamp
          return null;
        }
        date = new Date(timestamp);
      } else if (typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
        return null; // Don't show anything for unrecognized formats
      }
      
      if (isNaN(date.getTime())) {
        return null;
      }
      
      // Format to a shorter time string in Pacific time
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Los_Angeles'
      }).format(date);
      
    } catch (error) {
      return null; // Don't show anything if there's an error
    }
  };
  
  // Determine if we should show the raw timestamp element
  const shouldShowRawTimestamp = (booking) => {
    if (!booking.preferredDate) return false;
    
    try {
      // For Firestore timestamps or Date objects, show the formatted time
      if ((typeof booking.preferredDate === 'object' && 'toDate' in booking.preferredDate) || 
          booking.preferredDate instanceof Date) {
        return true;
      }
      
      // For raw ISO strings that aren't displayed well, hide them
      if (typeof booking.preferredDate === 'string' && booking.preferredDate.includes('T')) {
        return false;
      }
      
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Calendar header */}
      <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-1">
          <FiCalendar className="mr-2 text-blue-500" />
          Booking Calendar
        </h2>
        <p className="text-sm text-gray-600">
          {viewMode === 'day' ? 'Select a date to view bookings' : 
           viewMode === 'filter' ? `Viewing all ${activeFilter} bookings` :
           'Viewing all bookings'}
        </p>
      </div>
      
      <div className="grid md:grid-cols-5 gap-0">
        {/* Calendar picker section - 2 columns on larger screens */}
        <div className="md:col-span-2 p-4 border-r border-gray-200">
          <DatePicker
            selected={selectedDate}
            onChange={date => {
              setSelectedDate(date);
              setViewMode('day');
              setActiveFilter(null);
            }}
            inline
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            className="booking-datepicker"
            calendarClassName="custom-large-calendar"
            renderDayContents={renderDayContents}
            previousMonthButtonLabel={<FiChevronLeft />}
            nextMonthButtonLabel={<FiChevronRight />}
            onMonthChange={() => {}}
          />
          
          {/* Status filter buttons */}
          <div className="calendar-legend mb-2">
            {Object.entries(statusColors).map(([status, color]) => {
              const isActive = activeFilter === status;
              const isEnabled = filteredStatuses[status];
              
              // Determine border color based on status
              let borderColor = color;
              let hoverBg = 'rgba(0,0,0,0.05)';
              
              switch (status) {
                case 'pending':
                  borderColor = '#ca8a04'; // Darker yellow
                  hoverBg = 'rgba(250, 204, 21, 0.2)';
                  break;
                case 'confirmed':
                  borderColor = '#16a34a'; // Darker green
                  hoverBg = 'rgba(34, 197, 94, 0.2)';
                  break;
                case 'completed':
                  borderColor = '#2563eb'; // Darker blue
                  hoverBg = 'rgba(59, 130, 246, 0.2)';
                  break;
                case 'cancelled':
                  borderColor = '#dc2626'; // Darker red
                  hoverBg = 'rgba(239, 68, 68, 0.2)';
                  break;
              }
              
              return (
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center transition-all duration-200`}
                  style={{
                    backgroundColor: isEnabled ? `rgba(${color.replace('#', '').match(/../g).map(h => parseInt(h, 16)).join(',')}, 0.15)` : '#f3f4f6',
                    color: isEnabled ? `rgba(0,0,0,0.8)` : 'rgba(0,0,0,0.4)',
                    border: `2px solid ${isEnabled ? borderColor : '#e5e7eb'}`,
                    boxShadow: isActive ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
                    transform: isActive ? 'translateY(-2px)' : 'none',
                    fontWeight: isEnabled ? '600' : '400'
                  }}
                  onMouseEnter={(e) => {
                    if (isEnabled) {
                      e.currentTarget.style.backgroundColor = hoverBg;
                    } else {
                      e.currentTarget.style.backgroundColor = '#e5e7eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isEnabled ? `rgba(${color.replace('#', '').match(/../g).map(h => parseInt(h, 16)).join(',')}, 0.15)` : '#f3f4f6';
                  }}
                >
                  <span 
                    className="w-4 h-4 rounded-full mr-1.5 border"
                    style={{ 
                      backgroundColor: isEnabled ? color : '#e5e7eb',
                      borderColor: isEnabled ? borderColor : '#d1d5db',
                      boxShadow: isEnabled ? `0 0 4px ${color}77` : 'none'
                    }}
                  />
                  <span className="capitalize">{status}</span>
                </button>
              );
            })}
          </div>
          
          {/* View all filtered button */}
          <button
            onClick={showAllFiltered}
            className={`w-full mt-2 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-all duration-200 ${
              viewMode === 'all' 
                ? 'bg-blue-100 text-blue-800 border border-blue-300 ring-2 ring-offset-2 ring-blue-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            <FiFilter className="mr-1.5" />
            {viewMode === 'all' ? 'Currently Viewing All' : 'View All Filtered Bookings'}
          </button>
        </div>
        
        {/* Selected day bookings section - 3 columns on larger screens */}
        <div className="md:col-span-3 p-5 bg-gray-50 min-h-[500px]">
          {viewMode === 'day' ? (
            /* DAY VIEW - Shows bookings for the selected date */
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {formatDate(selectedDate)}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedDateBookings.length} booking{selectedDateBookings.length !== 1 ? 's' : ''} 
                  {filteredStatuses.pending && filteredStatuses.confirmed && 
                    filteredStatuses.completed && filteredStatuses.cancelled ? '' : ' (filtered)'}
                </p>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : selectedDateBookings.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={selectedDate.toDateString()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {selectedDateBookings.map((booking) => (
                      <BookingCard 
                        key={booking.id}
                        booking={booking}
                        statusStyles={statusStyles}
                        formatTime={formatTime}
                        formatBookingDate={formatBookingDate}
                        formatTimeOnly={formatTimeOnly}
                        formatRawTimestamp={formatRawTimestamp}
                        shouldShowRawTimestamp={shouldShowRawTimestamp}
                        updateBookingStatus={handleUpdateBookingStatus}
                        expanded={expandedBookingId === booking.id}
                        onToggleExpand={toggleBookingDetails}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="text-gray-400 mb-2">
                    <FiCalendar size={40} />
                  </div>
                  <p className="text-gray-500 mb-1">No bookings found for this date</p>
                  <p className="text-xs text-gray-400">
                    {Object.values(filteredStatuses).some(v => !v) 
                      ? 'Try adjusting your status filters above'
                      : 'Select another date or add a new booking'}
                  </p>
                </div>
              )}
            </>
          ) : viewMode === 'filter' ? (
            /* FILTER VIEW - Shows all bookings of a specific status */
            <>
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: statusColors[activeFilter] }}
                    ></div>
                    All {activeFilter} Bookings
                  </h3>
                  <p className="text-sm text-gray-500">
                    {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setViewMode('day');
                    setActiveFilter(null);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <FiCalendar className="mr-1" />
                  Back to Calendar View
                </button>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredBookings.length > 0 ? (
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                  {Object.entries(groupedFilteredBookings).map(([dateString, { date, bookings }]) => (
                    <div key={dateString} className="date-group">
                      <h4 className="text-md font-medium text-gray-700 mb-2 sticky top-0 bg-gray-50 py-1 z-10">
                        {formatDate(date)}
                      </h4>
                      <div className="space-y-3 ml-0">
                        {bookings.map(booking => (
                          <BookingCard 
                            key={booking.id}
                            booking={booking}
                            statusStyles={statusStyles}
                            formatTime={formatTime}
                            formatBookingDate={formatBookingDate}
                            formatTimeOnly={formatTimeOnly}
                            formatRawTimestamp={formatRawTimestamp}
                            shouldShowRawTimestamp={shouldShowRawTimestamp}
                            updateBookingStatus={handleUpdateBookingStatus}
                            compact={true}
                            expanded={expandedBookingId === booking.id}
                            onToggleExpand={toggleBookingDetails}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="text-gray-400 mb-2">
                    <FiList size={40} />
                  </div>
                  <p className="text-gray-500 mb-1">No {activeFilter} bookings found</p>
                  <p className="text-xs text-gray-400">
                    Try selecting a different status filter
                  </p>
                </div>
              )}
            </>
          ) : (
            /* ALL VIEW - Shows all bookings with active filters */
            <>
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FiFilter className="mr-2 text-blue-500" />
                    All Filtered Bookings
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getAllFilteredBookings.length} booking{getAllFilteredBookings.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setViewMode('day');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <FiCalendar className="mr-1" />
                  Back to Calendar View
                </button>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : getAllFilteredBookings.length > 0 ? (
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                  {Object.entries(groupedAllFilteredBookings).map(([dateString, { date, bookings }]) => (
                    <div key={dateString} className="date-group">
                      <h4 className="text-md font-medium text-gray-700 mb-2 sticky top-0 bg-gray-50 py-1 z-10">
                        {formatDate(date)}
                      </h4>
                      <div className="space-y-3 ml-0">
                        {bookings.map(booking => (
                          <BookingCard 
                            key={booking.id}
                            booking={booking}
                            statusStyles={statusStyles}
                            formatTime={formatTime}
                            formatBookingDate={formatBookingDate}
                            formatTimeOnly={formatTimeOnly}
                            formatRawTimestamp={formatRawTimestamp}
                            shouldShowRawTimestamp={shouldShowRawTimestamp}
                            updateBookingStatus={handleUpdateBookingStatus}
                            compact={true}
                            expanded={expandedBookingId === booking.id}
                            onToggleExpand={toggleBookingDetails}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="text-gray-400 mb-2">
                    <FiList size={40} />
                  </div>
                  <p className="text-gray-500 mb-1">No bookings found with current filters</p>
                  <p className="text-xs text-gray-400">
                    Try selecting a different filter combination
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Extracted BookingCard component for reuse
const BookingCard = ({ booking, statusStyles, formatTime, formatBookingDate, formatTimeOnly, formatRawTimestamp, shouldShowRawTimestamp, updateBookingStatus, compact = false, expanded = false, onToggleExpand }) => {
  const status = booking.status ? booking.status.toLowerCase() : 'pending';
  
  // Extract vehicle details
  const vehicleDetails = booking.vehicle || booking.vehicleDetails;
  const serviceType = booking.service || booking.serviceType;
  
  // Safely handle status update button click
  const handleStatusUpdate = (e, newStatus) => {
    e.stopPropagation(); // Prevent card expansion when clicking buttons
    console.log(`Attempting to update booking ${booking.id} to ${newStatus}`);
    
    if (typeof updateBookingStatus === 'function') {
      // Normalize status to lowercase for consistency
      const normalizedStatus = newStatus.toLowerCase();
      updateBookingStatus(booking.id, normalizedStatus);
    } else {
      console.error('updateBookingStatus is not a function', typeof updateBookingStatus);
      alert('Cannot update booking status at this time. Please refresh the page and try again.');
    }
  };
  
  // Display the timestamp in a cleaner way
  const displayTimestamp = () => {
    if (!booking.preferredDate) return null;
    
    // Filter out raw ISO timestamps
    if (typeof booking.preferredDate === 'string' && booking.preferredDate.includes('T')) {
      // Try to convert to a Date and format
      try {
        const date = new Date(booking.preferredDate);
        if (!isNaN(date.getTime())) {
          return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'America/Los_Angeles'
          }).format(date);
        }
      } catch (e) {
        return null;
      }
    }
    
    // For Firestore timestamps
    if (typeof booking.preferredDate === 'object' && 'toDate' in booking.preferredDate) {
      try {
        const date = booking.preferredDate.toDate();
        return new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'America/Los_Angeles'
        }).format(date);
      } catch (e) {
        return null;
      }
    }
    
    // For Date objects
    if (booking.preferredDate instanceof Date) {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Los_Angeles'
      }).format(booking.preferredDate);
    }
    
    return null;
  };
  
  return (
    <div 
      id={`booking-${booking.id}`}
      key={booking.id} 
      className={`booking-day-event bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow status-${status} ${compact ? 'p-3' : ''} ${expanded ? 'expanded ring-2 ring-blue-300' : ''} cursor-pointer`}
      onClick={() => onToggleExpand && onToggleExpand(booking.id)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-lg'}`}>
            {booking.customerName || 'No name provided'}
          </h4>
          <div className="flex flex-col text-sm text-gray-500 mt-1">
            <div className="flex items-center">
              <FiCalendar className="mr-1 text-gray-400" />
              {formatBookingDate && typeof formatBookingDate === 'function' 
                ? formatBookingDate(booking)
                : "Date formatting unavailable"}
            </div>
            <div className="flex items-center mt-1">
              <FiClock className="mr-1 text-gray-400" /> 
              {displayTimestamp() || "No time specified"}
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium 
          ${statusStyles[status]?.bg || 'bg-gray-100'} 
          ${statusStyles[status]?.text || 'text-gray-800'} 
          ${statusStyles[status]?.border || 'border-gray-200'} border
        `}>
          <div className="flex items-center">
            {statusStyles[status]?.icon}
            {booking.status || 'Pending'}
          </div>
        </div>
      </div>
      
      {/* Always show at least basic info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        {/* Left column */}
        <div>
          <div className="flex items-center text-gray-700 mt-1">
            <FiPhone className="mr-2 text-gray-400" />
            {booking.phone || booking.customerPhone || 'No phone provided'}
          </div>
          
          <div className="flex items-center text-gray-700 mt-1">
            <FiMail className="mr-2 text-gray-400" />
            {booking.email || booking.customerEmail || 'No email provided'}
          </div>
          
          {/* Only show for expanded or non-compact views */}
          {(expanded || !compact) && booking.preferredContact && (
            <div className="flex items-center text-gray-700 mt-1">
              <FiUser className="mr-2 text-gray-400" />
              <span>Preferred contact: {booking.preferredContact}</span>
            </div>
          )}
        </div>
        
        {/* Right column */}
        <div>
          <div className="flex items-center text-gray-700 mt-1">
            <FiTruck className="mr-2 text-gray-400" />
            {vehicleDetails 
              ? `${vehicleDetails.year || ''} ${vehicleDetails.make || ''} ${vehicleDetails.model || ''}`
              : 'No vehicle details'}
          </div>
          
          <div className="flex items-center text-gray-700 mt-1">
            <FiTag className="mr-2 text-gray-400" />
            {serviceType || 'No service specified'}
          </div>
        </div>
      </div>
      
      {/* Additional details for expanded view */}
      {expanded && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          {booking.notes && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1">Notes:</div>
              <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                {booking.notes}
              </div>
            </div>
          )}
          
          {booking.requestDetails && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1">Request Details:</div>
              <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                {booking.requestDetails}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Action buttons - always visible */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex flex-wrap gap-2">
          {(!booking.status || booking.status.toLowerCase() !== 'confirmed') && (
            <button
              onClick={(e) => handleStatusUpdate(e, 'confirmed')}
              className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded border border-green-200 hover:bg-green-100 transition-colors flex items-center"
            >
              <FiCheckCircle className="mr-1" /> Confirm
            </button>
          )}
          
          {(!booking.status || booking.status.toLowerCase() !== 'completed') && (
            <button
              onClick={(e) => handleStatusUpdate(e, 'completed')}
              className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 transition-colors flex items-center"
            >
              <FiCheck className="mr-1" /> Complete
            </button>
          )}
          
          {(!booking.status || booking.status.toLowerCase() !== 'cancelled') && (
            <button
              onClick={(e) => handleStatusUpdate(e, 'cancelled')}
              className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100 transition-colors flex items-center"
            >
              <FiXCircle className="mr-1" /> Cancel
            </button>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card expansion when clicking buttons
              onToggleExpand && onToggleExpand(booking.id);
            }}
            className="px-3 py-1 text-xs bg-gray-50 text-gray-700 rounded border border-gray-200 hover:bg-gray-100 transition-colors ml-auto flex items-center"
          >
            {expanded ? 'Show Less' : 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar; 