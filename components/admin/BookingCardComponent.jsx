import React from 'react';
import { 
  FiCalendar, FiClock, FiPhone, FiMail, 
  FiUser, FiTruck, FiTag, FiCheckCircle, 
  FiCheck, FiXCircle 
} from 'react-icons/fi';

/**
 * BookingCard component for displaying booking information
 * 
 * @param {Object} booking - The booking data to display
 * @param {Object} statusStyles - Styles for different booking statuses
 * @param {Function} formatBookingDate - Function to format booking date
 * @param {Function} updateBookingStatus - Function to update booking status
 * @param {boolean} compact - Whether to display in compact mode
 * @param {boolean} expanded - Whether to display in expanded mode
 * @param {Function} onToggleExpand - Function to toggle expanded state
 */
const BookingCard = ({ 
  booking, 
  statusStyles, 
  formatBookingDate, 
  updateBookingStatus, 
  compact = false, 
  expanded = false, 
  onToggleExpand 
}) => {
  const status = booking.status ? booking.status.toLowerCase() : 'pending';
  const vehicleDetails = booking.vehicle || booking.vehicleDetails;
  const serviceType = booking.service || booking.serviceType;
  
  const handleStatusUpdate = (e, newStatus) => {
    e.stopPropagation();
    if (typeof updateBookingStatus === 'function') {
      updateBookingStatus(booking.id, newStatus.toLowerCase());
    }
  };
  
  const formatTime = (timestamp) => {
    if (!timestamp) return null;
    
    try {
      let date;
      
      if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (timestamp && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else {
        return null;
      }
      
      if (isNaN(date.getTime())) return null;
      
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true
      }).format(date);
    } catch (e) {
      return null;
    }
  };
  
  // Function to get all notes from the booking
  const getClientNotes = () => {
    const notes = [];
    
    // Add primary notes if they exist
    if (booking.notes) {
      notes.push({
        label: "Client Notes",
        content: booking.notes
      });
    }
    
    // Add additional notes if they exist
    if (booking.additionalNotes) {
      notes.push({
        label: "Additional Notes",
        content: booking.additionalNotes
      });
    }
    
    // Add vehicle-specific notes if they exist
    if (vehicleDetails && vehicleDetails.notes) {
      notes.push({
        label: "Vehicle Notes",
        content: vehicleDetails.notes
      });
    }
    
    // Add service-specific notes
    if (booking.serviceNotes) {
      notes.push({
        label: "Service Notes",
        content: booking.serviceNotes
      });
    }
    
    return notes;
  };
  
  const clientNotes = getClientNotes();
  
  return (
    <div 
      className={`booking-card bg-white p-4 rounded-lg border shadow-sm status-${status} ${expanded ? 'ring-2 ring-blue-300' : ''}`}
      onClick={() => onToggleExpand && onToggleExpand(booking.id)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-gray-900">
            {booking.customerName || 'No name provided'}
          </h4>
          <div className="text-sm text-gray-500 mt-1">
            <div className="flex items-center">
              <FiCalendar className="mr-1" />
              {formatBookingDate ? formatBookingDate(booking) : "No date"}
            </div>
            <div className="flex items-center mt-1">
              <FiClock className="mr-1" /> 
              {formatTime(booking.preferredDate) || "No time"}
            </div>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-medium 
          ${statusStyles?.[status]?.bg || 'bg-gray-100'} 
          ${statusStyles?.[status]?.text || 'text-gray-800'} 
          ${statusStyles?.[status]?.border || 'border-gray-200'} border`}>
          {booking.status || 'Pending'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <div className="flex items-center text-gray-700 mt-1">
            <FiPhone className="mr-2" />
            {booking.phone || booking.customerPhone || 'No phone'}
          </div>
          
          <div className="flex items-center text-gray-700 mt-1">
            <FiMail className="mr-2" />
            {booking.email || booking.customerEmail || 'No email'}
          </div>
        </div>
        
        <div>
          <div className="flex items-center text-gray-700 mt-1">
            <FiTruck className="mr-2" />
            {vehicleDetails 
              ? `${vehicleDetails.year || ''} ${vehicleDetails.make || ''} ${vehicleDetails.model || ''}`
              : 'No vehicle details'}
          </div>
          
          <div className="flex items-center text-gray-700 mt-1">
            <FiTag className="mr-2" />
            {serviceType || 'No service specified'}
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-3 pt-2 border-t">
          {clientNotes.length > 0 ? (
            <div className="space-y-3">
              {clientNotes.map((note, idx) => (
                <div key={idx} className="mb-2">
                  <div className="text-xs text-gray-500 mb-1">{note.label}:</div>
                  <div className="text-sm bg-gray-50 p-3 rounded-md">{note.content}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic py-2">
              No additional notes provided
            </div>
          )}
        </div>
      )}
      
      <div className="mt-3 pt-3 border-t">
        <div className="flex flex-wrap gap-2">
          {status !== 'confirmed' && (
            <button
              onClick={(e) => handleStatusUpdate(e, 'confirmed')}
              className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded border hover:bg-green-100"
            >
              <FiCheckCircle className="inline mr-1" /> Confirm
            </button>
          )}
          
          {status !== 'completed' && (
            <button
              onClick={(e) => handleStatusUpdate(e, 'completed')}
              className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded border hover:bg-blue-100"
            >
              <FiCheck className="inline mr-1" /> Complete
            </button>
          )}
          
          {status !== 'cancelled' && (
            <button
              onClick={(e) => handleStatusUpdate(e, 'cancelled')}
              className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded border hover:bg-red-100"
            >
              <FiXCircle className="inline mr-1" /> Cancel
            </button>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand && onToggleExpand(booking.id);
            }}
            className="px-3 py-1 text-xs bg-gray-50 text-gray-700 rounded border ml-auto"
          >
            {expanded ? 'Show Less' : 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingCard; 