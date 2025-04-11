'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

export default function BookAppointmentForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    service: '',
    vehicle: '',
    date: '',
    time: '',
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          service: formData.service,
          vehicleDetails: {
            make: formData.vehicle.split(' ')[0] || '',
            model: formData.vehicle.split(' ').slice(1).join(' ') || '',
            year: '', // Not collected in form but required by API
            color: '' // Not collected in form but optional
          },
          preferredDate: new Date(`${formData.date}T${formData.time}`),
          message: formData.notes
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to book appointment');
      }
      
      // Success!
      setSuccess(true);
      setFormData({
        customerName: '',
        email: '',
        phone: '',
        service: '',
        vehicle: '',
        date: '',
        time: '',
        notes: ''
      });
      
      toast.success('Appointment booked successfully! We will contact you shortly to confirm.');
      
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError(err.message || 'Failed to book appointment');
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate minimum date (today) for the date picker
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  
  // Service options
  const serviceOptions = [
    { value: 'Paint Correction', label: 'Paint Correction' },
    { value: 'Full Detail', label: 'Full Detail' },
    { value: 'Ceramic Coating', label: 'Ceramic Coating' },
    { value: 'Window Tinting', label: 'Window Tinting' },
    { value: 'Vinyl Wrap', label: 'Vinyl Wrap' },
    { value: 'Collision Repair', label: 'Collision Repair' },
    { value: 'Custom Paint', label: 'Custom Paint' },
    { value: 'Classic Restoration', label: 'Classic Restoration' },
    { value: 'Other', label: 'Other' }
  ];
  
  // Time slots
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', 
    '2:00 PM', '3:00 PM', '4:00 PM'
  ];
  
  if (success) {
    return (
      <div className="bg-bmw-blue/10 border border-bmw-blue text-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Appointment Booked!</h3>
        <p className="mb-4">Thank you for booking an appointment with us. We will contact you shortly to confirm your appointment.</p>
        <button
          onClick={() => setSuccess(false)}
          className="px-4 py-2 bg-bmw-blue text-white rounded-md hover:bg-bmw-dark-blue transition-colors"
        >
          Book Another Appointment
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-b from-bmw-dark-blue/90 to-bmw-blue/90 text-white shadow-lg rounded-lg p-8">
      <div className="flex items-center mb-6">
        <FaCalendarAlt className="text-bmw-red text-xl mr-3" />
        <h2 className="text-2xl font-bold">Book an Appointment</h2>
      </div>
      
      {error && (
        <div className="bg-red-900/40 border border-red-500 text-white p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-white/90 mb-2">
              Your Name*
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-bmw-red focus:border-transparent text-white placeholder-white/50"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
              Email Address*
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-bmw-red focus:border-transparent text-white placeholder-white/50"
              placeholder="john@example.com"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-white/90 mb-2">
              Phone Number*
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-bmw-red focus:border-transparent text-white placeholder-white/50"
              placeholder="(555) 123-4567"
            />
          </div>
          
          <div>
            <label htmlFor="vehicle" className="block text-sm font-medium text-white/90 mb-2">
              Vehicle Make/Model*
            </label>
            <input
              type="text"
              id="vehicle"
              name="vehicle"
              value={formData.vehicle}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-bmw-red focus:border-transparent text-white placeholder-white/50"
              placeholder="Toyota Camry"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-white/90 mb-2">
            Service Needed*
          </label>
          <select
            id="service"
            name="service"
            value={formData.service}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-bmw-red focus:border-transparent text-white"
          >
            <option value="" className="bg-bmw-dark-blue text-white">Select a service</option>
            {serviceOptions.map(option => (
              <option key={option.value} value={option.value} className="bg-bmw-dark-blue text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-white/90 mb-2">
              Preferred Date*
            </label>
            <div className="relative">
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={minDate}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-bmw-red focus:border-transparent text-white"
              />
              <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50" />
            </div>
          </div>
          
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-white/90 mb-2">
              Preferred Time*
            </label>
            <div className="relative">
              <select
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-bmw-red focus:border-transparent text-white"
              >
                <option value="" className="bg-bmw-dark-blue text-white">Select a time</option>
                {timeSlots.map(time => (
                  <option key={time} value={time} className="bg-bmw-dark-blue text-white">
                    {time}
                  </option>
                ))}
              </select>
              <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50" />
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-white/90 mb-2">
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-bmw-red focus:border-transparent text-white placeholder-white/50"
            placeholder="Please provide any additional details about your service needs..."
          ></textarea>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-gradient-to-r from-bmw-blue to-bmw-red text-white py-4 rounded-md font-medium text-lg ${
            loading ? 'opacity-70 cursor-not-allowed' : 'hover:from-bmw-dark-blue hover:to-bmw-red/90'
          } transition-all shadow-lg`}
        >
          {loading ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>
    </div>
  );
} 