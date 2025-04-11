'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiCalendar, FiUser, FiPhone, FiMail, FiTruck, FiCheck, FiClock, FiX, FiTrash2, FiEdit, FiInfo, FiList } from 'react-icons/fi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import BookingCalendar from './BookingCalendar';
import { getAllBookingsAdmin, updateBookingStatusAdmin, updateBookingAdminNotesAdmin, deleteBookingAdmin } from '@/utils/bookingService';
import toast from 'react-hot-toast';

export default function BookingListAdmin() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [view, setView] = useState('list'); // 'list' or 'calendar'

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/booking');
        
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        
        const data = await response.json();
        setBookings(data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, []);
  
  // Filter bookings based on status
  const filteredBookings = statusFilter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === statusFilter);
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  
  // Handle booking status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setIsUpdating(true);
      
      const response = await fetch('/api/booking', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status: newStatus,
          adminNotes: selectedBooking?.adminNotes || ''
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === id ? { ...booking, status: newStatus } : booking
        )
      );
      
      // Close detail view
      if (selectedBooking?.id === id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
      
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Failed to update booking status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle booking deletion
  const handleDeleteBooking = async (id) => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsUpdating(true);
      
      const response = await fetch(`/api/booking?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete booking');
      }
      
      // Update local state
      setBookings(prevBookings => prevBookings.filter(booking => booking.id !== id));
      
      // Close detail view if deleted booking was selected
      if (selectedBooking?.id === id) {
        setSelectedBooking(null);
      }
      
    } catch (err) {
      console.error('Error deleting booking:', err);
      alert('Failed to delete booking. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Save admin notes
  const handleSaveNotes = async () => {
    if (!selectedBooking) return;
    
    try {
      setIsUpdating(true);
      
      const response = await fetch('/api/booking', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedBooking.id,
          status: selectedBooking.status,
          adminNotes: adminNotes
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save notes');
      }
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === selectedBooking.id 
            ? { ...booking, adminNotes } 
            : booking
        )
      );
      
      setSelectedBooking({ ...selectedBooking, adminNotes });
      
    } catch (err) {
      console.error('Error saving notes:', err);
      alert('Failed to save notes. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Status colors
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
  };
  
  // Status icons
  const statusIcons = {
    pending: <FiClock className="mr-1" />,
    confirmed: <FiCheck className="mr-1" />,
    completed: <FiCheck className="mr-1" />,
    cancelled: <FiX className="mr-1" />
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-500">Loading bookings...</span>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="booking-admin-list">
      {/* Status filter and summary */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Booking Management</h2>
          <p className="text-gray-600">
            Manage and track customer bookings
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center mt-4 md:mt-0">
          {/* View Toggle */}
          <div className="inline-flex rounded-md shadow-sm mb-3 md:mb-0 md:mr-4">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                view === 'list' 
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300`}
            >
              <FiList className="inline mr-1" /> List View
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                view === 'calendar' 
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300`}
            >
              <FiCalendar className="inline mr-1" /> Calendar
            </button>
          </div>
          
          {view === 'list' && (
            <div className="inline-flex shadow-sm rounded-md">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                  statusFilter === 'all' 
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 text-sm font-medium ${
                  statusFilter === 'pending' 
                    ? 'bg-yellow-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border-t border-b border-gray-300`}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter('confirmed')}
                className={`px-4 py-2 text-sm font-medium ${
                  statusFilter === 'confirmed' 
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border-t border-b border-gray-300`}
              >
                Confirmed
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-4 py-2 text-sm font-medium ${
                  statusFilter === 'completed' 
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border-t border-b border-gray-300`}
              >
                Completed
              </button>
              <button
                onClick={() => setStatusFilter('cancelled')}
                className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                  statusFilter === 'cancelled' 
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300`}
              >
                Cancelled
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Booking detail view */}
      {selectedBooking && (
        <div className="mb-8 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="flex justify-between items-center border-b p-4 bg-gray-50">
            <h3 className="text-lg font-medium">Booking Details</h3>
            <button 
              onClick={() => setSelectedBooking(null)} 
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX size={20} />
            </button>
          </div>
          
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Customer Information</h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="text-blue-500 mr-3 mt-0.5">
                      <FiUser size={16} />
                    </div>
                    <div>
                      <p className="font-medium">{selectedBooking.customerName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-blue-500 mr-3 mt-0.5">
                      <FiMail size={16} />
                    </div>
                    <div>
                      <p className="text-sm">{selectedBooking.customerEmail}</p>
                      <a href={`mailto:${selectedBooking.customerEmail}`} className="text-xs text-blue-600">
                        Send email
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-blue-500 mr-3 mt-0.5">
                      <FiPhone size={16} />
                    </div>
                    <div>
                      <p className="text-sm">{selectedBooking.customerPhone}</p>
                      <a href={`tel:${selectedBooking.customerPhone}`} className="text-xs text-blue-600">
                        Call
                      </a>
                    </div>
                  </div>
                </div>
                
                <h4 className="text-sm uppercase tracking-wider text-gray-500 mt-6 mb-3">Vehicle Details</h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="text-blue-500 mr-3 mt-0.5">
                      <FiTruck size={16} />
                    </div>
                    <div>
                      <p className="font-medium">
                        {selectedBooking.vehicleDetails.year} {selectedBooking.vehicleDetails.make} {selectedBooking.vehicleDetails.model}
                      </p>
                      {selectedBooking.vehicleDetails.color && (
                        <p className="text-sm text-gray-500">Color: {selectedBooking.vehicleDetails.color}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Appointment Details</h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="text-blue-500 mr-3 mt-0.5">
                      <FiInfo size={16} />
                    </div>
                    <div>
                      <p className="font-medium">Service Type</p>
                      <p className="text-sm">{selectedBooking.service}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-blue-500 mr-3 mt-0.5">
                      <FiCalendar size={16} />
                    </div>
                    <div>
                      <p className="font-medium">Preferred Date</p>
                      <p className="text-sm">{formatDate(selectedBooking.preferredDate)}</p>
                      
                      {selectedBooking.alternateDate && (
                        <div className="mt-2">
                          <p className="font-medium">Alternate Date</p>
                          <p className="text-sm">{formatDate(selectedBooking.alternateDate)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedBooking.message && (
                    <div className="flex items-start">
                      <div className="text-blue-500 mr-3 mt-0.5">
                        <FiInfo size={16} />
                      </div>
                      <div>
                        <p className="font-medium">Additional Information</p>
                        <p className="text-sm whitespace-pre-line">{selectedBooking.message}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <h4 className="text-sm uppercase tracking-wider text-gray-500 mt-6 mb-3">Admin Notes</h4>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md h-32 text-sm"
                  placeholder="Add notes about this booking..."
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={isUpdating}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {isUpdating ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Update Status</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatusUpdate(selectedBooking.id, 'pending')}
                  disabled={isUpdating || selectedBooking.status === 'pending'}
                  className={`px-4 py-2 text-sm rounded-md inline-flex items-center ${
                    selectedBooking.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200 cursor-default'
                      : 'bg-white text-yellow-700 border border-yellow-300 hover:bg-yellow-50'
                  }`}
                >
                  <FiClock className="mr-1" /> Pending
                </button>
                
                <button
                  onClick={() => handleStatusUpdate(selectedBooking.id, 'confirmed')}
                  disabled={isUpdating || selectedBooking.status === 'confirmed'}
                  className={`px-4 py-2 text-sm rounded-md inline-flex items-center ${
                    selectedBooking.status === 'confirmed'
                      ? 'bg-green-100 text-green-800 border border-green-200 cursor-default'
                      : 'bg-white text-green-700 border border-green-300 hover:bg-green-50'
                  }`}
                >
                  <FiCheck className="mr-1" /> Confirm
                </button>
                
                <button
                  onClick={() => handleStatusUpdate(selectedBooking.id, 'completed')}
                  disabled={isUpdating || selectedBooking.status === 'completed'}
                  className={`px-4 py-2 text-sm rounded-md inline-flex items-center ${
                    selectedBooking.status === 'completed'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200 cursor-default'
                      : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <FiCheck className="mr-1" /> Complete
                </button>
                
                <button
                  onClick={() => handleStatusUpdate(selectedBooking.id, 'cancelled')}
                  disabled={isUpdating || selectedBooking.status === 'cancelled'}
                  className={`px-4 py-2 text-sm rounded-md inline-flex items-center ${
                    selectedBooking.status === 'cancelled'
                      ? 'bg-red-100 text-red-800 border border-red-200 cursor-default'
                      : 'bg-white text-red-700 border border-red-300 hover:bg-red-50'
                  }`}
                >
                  <FiX className="mr-1" /> Cancel
                </button>
                
                <button
                  onClick={() => handleDeleteBooking(selectedBooking.id)}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm rounded-md inline-flex items-center bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 ml-auto"
                >
                  <FiTrash2 className="mr-1" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Calendar View */}
      {view === 'calendar' && (
        <BookingCalendar 
          bookings={bookings} 
          updateBookingStatus={handleStatusUpdate}
          loading={isLoading}
          onBookingSelect={(booking) => {
            setSelectedBooking(booking);
            setAdminNotes(booking.adminNotes || '');
          }}
        />
      )}
      
      {/* List View */}
      {view === 'list' && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {filteredBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr 
                      key={booking.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setAdminNotes(booking.adminNotes || '');
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {booking.customerName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.customerEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {booking.vehicleDetails.year} {booking.vehicleDetails.make}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.vehicleDetails.model}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {booking.service}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(booking.preferredDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[booking.status]}`}>
                          {statusIcons[booking.status]}
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(booking);
                            setAdminNotes(booking.adminNotes || '');
                          }}
                        >
                          <FiEdit size={16} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBooking(booking.id);
                          }}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <FiCalendar size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
              <p className="text-gray-500">
                {statusFilter === 'all' 
                  ? 'There are no bookings in the system yet.'
                  : `There are no ${statusFilter} bookings at the moment.`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 