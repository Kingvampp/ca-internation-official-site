'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { submitBooking } from '@/utils/bookingService';
import { FiCalendar, FiClock, FiUser, FiMail, FiPhone, FiTruck, FiClipboard } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const BookingForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      vehicleDetails: {
        make: '',
        model: '',
        year: '',
        color: '',
      },
      preferredDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    },
  });
  
  const availableServices = [
    { id: 'auto-repair', name: 'Auto Repair' },
    { id: 'body-work', name: 'Body Work' },
    { id: 'paint-correction', name: 'Paint Correction' },
    { id: 'restoration', name: 'Restoration' },
    { id: 'detailing', name: 'Detailing' },
    { id: 'consultation', name: 'Consultation' },
  ];
  
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      // Submit the booking to Firebase
      const result = await submitBooking(data);
      
      if (result.success) {
        setSubmitSuccess(true);
        reset(); // Clear the form
        
        // After 5 seconds, reset the success message
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      } else {
        setErrorMessage(result.error || 'Failed to submit booking. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="booking-form">
      {submitSuccess ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h3 className="text-2xl font-bold text-green-800 mb-2">Booking Submitted Successfully!</h3>
          <p className="text-green-700 mb-4">
            Thank you for your booking request. We will contact you shortly to confirm your appointment.
          </p>
          <button
            type="button"
            onClick={() => setSubmitSuccess(false)}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Submit Another Booking
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errorMessage}
            </div>
          )}
          
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-2">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="customerName">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <FiUser />
                  </div>
                  <input
                    id="customerName"
                    type="text"
                    className={`pl-10 w-full p-3 border rounded-md ${errors.customerName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="John Doe"
                    {...register('customerName', { required: 'Name is required' })}
                  />
                </div>
                {errors.customerName && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerName.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="customerEmail">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <FiMail />
                  </div>
                  <input
                    id="customerEmail"
                    type="email"
                    className={`pl-10 w-full p-3 border rounded-md ${errors.customerEmail ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="your@email.com"
                    {...register('customerEmail', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      }
                    })}
                  />
                </div>
                {errors.customerEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerEmail.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="customerPhone">
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <FiPhone />
                  </div>
                  <input
                    id="customerPhone"
                    type="tel"
                    className={`pl-10 w-full p-3 border rounded-md ${errors.customerPhone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="(123) 456-7890"
                    {...register('customerPhone', { required: 'Phone number is required' })}
                  />
                </div>
                {errors.customerPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerPhone.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="service">
                  Service Type *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <FiClipboard />
                  </div>
                  <select
                    id="service"
                    className={`pl-10 w-full p-3 border rounded-md appearance-none bg-white ${errors.service ? 'border-red-500' : 'border-gray-300'}`}
                    {...register('service', { required: 'Please select a service' })}
                  >
                    <option value="">Select a service...</option>
                    {availableServices.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.service && (
                  <p className="mt-1 text-sm text-red-600">{errors.service.message}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-2">Vehicle Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="vehicleMake">
                  Make *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <FiTruck />
                  </div>
                  <input
                    id="vehicleMake"
                    type="text"
                    className={`pl-10 w-full p-3 border rounded-md ${errors.vehicleDetails?.make ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Toyota"
                    {...register('vehicleDetails.make', { required: 'Vehicle make is required' })}
                  />
                </div>
                {errors.vehicleDetails?.make && (
                  <p className="mt-1 text-sm text-red-600">{errors.vehicleDetails.make.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="vehicleModel">
                  Model *
                </label>
                <input
                  id="vehicleModel"
                  type="text"
                  className={`w-full p-3 border rounded-md ${errors.vehicleDetails?.model ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Camry"
                  {...register('vehicleDetails.model', { required: 'Vehicle model is required' })}
                />
                {errors.vehicleDetails?.model && (
                  <p className="mt-1 text-sm text-red-600">{errors.vehicleDetails.model.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="vehicleYear">
                  Year *
                </label>
                <input
                  id="vehicleYear"
                  type="text"
                  className={`w-full p-3 border rounded-md ${errors.vehicleDetails?.year ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="2023"
                  {...register('vehicleDetails.year', { 
                    required: 'Vehicle year is required',
                    pattern: {
                      value: /^(19|20)\d{2}$/,
                      message: 'Please enter a valid year (1900-2099)'
                    }
                  })}
                />
                {errors.vehicleDetails?.year && (
                  <p className="mt-1 text-sm text-red-600">{errors.vehicleDetails.year.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="vehicleColor">
                  Color
                </label>
                <input
                  id="vehicleColor"
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md"
                  placeholder="Red"
                  {...register('vehicleDetails.color')}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-2">Appointment Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Preferred Date *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <FiCalendar />
                  </div>
                  <DatePicker
                    selected={watch('preferredDate')}
                    onChange={(date) => setValue('preferredDate', date)}
                    className="pl-10 w-full p-3 border border-gray-300 rounded-md"
                    minDate={new Date()}
                    placeholderText="Select preferred date"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Alternate Date (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <FiCalendar />
                  </div>
                  <DatePicker
                    selected={watch('alternateDate')}
                    onChange={(date) => setValue('alternateDate', date)}
                    className="pl-10 w-full p-3 border border-gray-300 rounded-md"
                    minDate={new Date()}
                    placeholderText="Select alternate date"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" htmlFor="message">
                  Additional Information
                </label>
                <textarea
                  id="message"
                  className="w-full p-3 border border-gray-300 rounded-md h-32"
                  placeholder="Please let us know any additional details about your vehicle or service needs..."
                  {...register('message')}
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isSubmitting ? 'Submitting...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BookingForm; 