"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "../../utils/LanguageContext";

// Available services
const services = [
  {
    id: "collision",
    name: "services.collision",
    description: "services.collisionDesc",
    duration: "1-14 days",
    image: "/images/services/collision.jpg",
  },
  {
    id: "paint",
    name: "services.paint",
    description: "services.paintDesc",
    duration: "5-10 days",
    image: "/images/services/paint.jpg",
  },
  {
    id: "restoration",
    name: "services.restoration",
    description: "services.restorationDesc",
    duration: "30-90 days",
    image: "/images/services/restoration.jpg",
  },
  {
    id: "detailing",
    name: "services.detailing",
    description: "services.detailingDesc",
    duration: "1-2 days",
    image: "/images/services/detailing.jpg",
  },
  {
    id: "towing",
    name: "services.towing",
    description: "services.towingDesc",
    duration: "1-3 hours",
    image: "/images/services/towing.jpg",
  },
  {
    id: "frame",
    name: "services.frame",
    description: "services.frameDesc",
    duration: "2-7 days",
    image: "/images/services/frame.jpg",
  },
  {
    id: "wheel",
    name: "services.wheel",
    description: "services.wheelDesc",
    duration: "1-3 days",
    image: "/images/services/wheel.jpg",
  },
];

// Vehicle makes
const vehicleMakes = [
  "Acura", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "BMW", "Buick", 
  "Cadillac", "Chevrolet", "Chrysler", "Dodge", "Ferrari", "Fiat", "Ford", 
  "Genesis", "GMC", "Honda", "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia", 
  "Lamborghini", "Land Rover", "Lexus", "Lincoln", "Maserati", "Mazda", 
  "McLaren", "Mercedes-Benz", "MINI", "Mitsubishi", "Nissan", "Porsche", 
  "Ram", "Rolls-Royce", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo", "Other"
];

// Available time slots
const timeSlots = {
  "8:00 AM": true,
  "9:00 AM": true,
  "10:00 AM": true,
  "11:00 AM": true,
  "1:00 PM": true,
  "2:00 PM": true,
  "3:00 PM": true,
  "4:00 PM": true,
  "5:00 PM": true,
};

export default function BookingPage() {
  const { t, language } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  
  const [selectedService, setSelectedService] = useState("");
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    service: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    date: "",
    time: "",
    name: "",
    email: "",
    phone: "",
    message: "",
    needsPickup: false,
    pickupAddress: "",
  });
  
  const [formStatus, setFormStatus] = useState<null | "success" | "error">(null);
  
  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setFormData((prev) => ({
      ...prev,
      service: serviceId,
    }));
    setStep(2);
  };
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Submitting appointment form with data:', {
        ...formData,
        message: formData.message.length > 0 ? '[Message included]' : '[No message]'
      });
      
      // Format data for API submission
      const appointmentData = {
        customerName: formData.name,
        email: formData.email,
        phone: formData.phone,
        service: formData.service,
        vehicle: `${formData.vehicleYear} ${formData.vehicleMake} ${formData.vehicleModel}`,
        date: formData.date,
        time: formData.time,
        notes: formData.message + (formData.needsPickup ? `\nNeeds pickup at: ${formData.pickupAddress}` : '')
      };
      
      // Submit to API endpoint
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Appointment submission failed:', data);
        throw new Error(data.error || 'Failed to book appointment');
      }
      
      console.log('Appointment submitted successfully:', data);
      
      // Success!
      setFormStatus("success");
      
      // Reset form
      setFormData({
        service: "",
        vehicleMake: "",
        vehicleModel: "",
        vehicleYear: "",
        date: "",
        time: "",
        name: "",
        email: "",
        phone: "",
        message: "",
        needsPickup: false,
        pickupAddress: "",
      });
      setStep(3);
    } catch (error) {
      console.error('Error booking appointment:', error);
      setFormStatus("error");
    }
  };
  
  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="pt-24 pb-20" ref={ref}>
      {/* Hero Section */}
      <section className="bg-gray-50 py-20">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              <span className="text-primary">{t('booking.book.appointment')}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-600 mb-8"
            >
              {t('common.schedule.your.vehicl')}</motion.p>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center justify-center mb-12"
            >
              <div className="relative flex items-center w-full max-w-2xl">
                <div className={`w-1/3 text-center ${step >= 1 ? "text-primary" : "text-gray-400"}`}>
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                    step >= 1 ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    1
                  </div>
                  <p className="mt-2 text-sm">
                    {language === 'es' ? 'Seleccionar Servicio' : t('common.select.service')}
                  </p>
                </div>
                <div className={`w-1/3 text-center ${step >= 2 ? "text-primary" : "text-gray-400"}`}>
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                    step >= 2 ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    2
                  </div>
                  <p className="mt-2 text-sm">
                    {language === 'es' ? 'Detalles de la Cita' : t('common.schedule.details')}
                  </p>
                </div>
                <div className={`w-1/3 text-center ${step >= 3 ? "text-primary" : "text-gray-400"}`}>
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                    step >= 3 ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    3
                  </div>
                  <p className="mt-2 text-sm">
                    {language === 'es' ? 'Confirmación' : t('common.confirmation')}
                  </p>
                </div>
                <div className="absolute top-5 h-0.5 w-full bg-gray-200 -z-10">
                  <div 
                    className="h-0.5 bg-primary transition-all duration-300"
                    style={{ width: `${(step - 1) * 50}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>

            {/* Step 1: Select Service */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-2xl font-bold mb-6 text-center">
                  {language === 'es' ? 'Seleccione un Servicio' : t('common.select.a.service')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`bg-white rounded-lg shadow-car overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        selectedService === service.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => handleServiceSelect(service.id)}
                    >
                      <div className="relative h-48">
                        <Image
                          src={service.image}
                          alt={service.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2">{t(service.name)}</h3>
                        <p className="text-gray-600 mb-4">{t(service.description)}</p>
                        <div className="flex justify-between items-center">
                          <span className="w-4"></span>
                          <button className="text-primary font-medium">
                            {language === 'es' ? 'Seleccionar' : 'Select'}</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Schedule and Details */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <button
                    onClick={goBack}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    ← {t('common.back')}</button>
                  <h2 className="text-2xl font-bold text-center">
                    {t('common.schedule')} {t(services.find(s => s.id === selectedService)?.name || '')}</h2>
                  <div className="w-10"></div> {/* Spacer to center the heading */}
                </div>

                <div className="bg-white rounded-lg shadow-car p-8">
                  {formStatus === "error" && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
                      {language === 'es' 
                        ? 'Hubo un error al procesar su solicitud. Por favor intente de nuevo.'
                        : 'There was an error processing your request. Please try again.'}
                    </div>
                  )}
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="text-lg font-bold mb-4">{t('common.vehicle.information')}</h3>
                        
                        <div className="mb-4">
                          <label htmlFor="vehicleMake" className="form-label">
                            {t('common.make')}</label>
                          <select
                            id="vehicleMake"
                            name="vehicleMake"
                            value={formData.vehicleMake}
                            onChange={handleChange}
                            required
                            className="form-input"
                          >
                            <option value="">{language === 'es' ? 'Seleccionar Marca' : 'Select Make'}</option>
                            {vehicleMakes.map((make) => (
                              <option key={make} value={make}>
                                {make}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="vehicleModel" className="form-label">
                            {t('common.model')}</label>
                          <input
                            type="text"
                            id="vehicleModel"
                            name="vehicleModel"
                            value={formData.vehicleModel}
                            onChange={handleChange}
                            required
                            className="form-input"
                            placeholder="e.g. Accord, 911, Model 3"
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="vehicleYear" className="form-label">
                            {t('common.year')}</label>
                          <input
                            type="number"
                            id="vehicleYear"
                            name="vehicleYear"
                            value={formData.vehicleYear}
                            onChange={handleChange}
                            required
                            min="1900"
                            max={new Date().getFullYear() + 1}
                            className="form-input"
                            placeholder={new Date().getFullYear().toString()}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-bold mb-4">{t('common.appointment.details')}</h3>
                        
                        <div className="mb-4">
                          <label htmlFor="date" className="form-label">
                            {t('common.preferred.date')}</label>
                          <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            min={new Date().toISOString().split("T")[0]}
                            className="form-input"
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="time" className="form-label">
                            {t('common.preferred.time')}</label>
                          <select
                            id="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            required
                            className="form-input"
                          >
                            <option value="">{language === 'es' ? 'Seleccionar Hora' : 'Select Time'}</option>
                            {Object.entries(timeSlots).map(([time, available]) => (
                              <option 
                                key={time} 
                                value={time} 
                                disabled={!available}
                              >
                                {time} {!available && "(Unavailable)"}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <input
                              type="checkbox"
                              id="needsPickup"
                              name="needsPickup"
                              checked={formData.needsPickup}
                              onChange={handleChange}
                              className="w-5 h-5 text-primary accent-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <label htmlFor="needsPickup" className="ml-3 flex flex-col">
                              <span className="font-medium text-gray-900">{t('common.free.pick.up.deliver')}</span>
                              <span className="text-sm text-gray-500">{t('common.complimentary.servic')}</span>
                            </label>
                          </div>
                        </div>
                        
                        {formData.needsPickup && (
                          <div className="mb-4 pl-4 border-l-2 border-primary">
                            <label htmlFor="pickupAddress" className="form-label">
                              {t('common.pick.up.address')}</label>
                            <textarea
                              id="pickupAddress"
                              name="pickupAddress"
                              value={formData.pickupAddress}
                              onChange={handleChange}
                              required={formData.needsPickup}
                              rows={2}
                              className="form-input"
                              placeholder="Enter your complete pick up address"
                            ></textarea>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-4">{t('navigation.information')}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="name" className="form-label">
                          {t('common.your.name')}</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="form-input"
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="form-label">
                          {t('contact.email.address')}</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="form-input"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="phone" className="form-label">
                        {t('contact.phone.number')}</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="form-input"
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="message" className="form-label">
                        {t('common.additional.informati')}</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={3}
                        className="form-input"
                        placeholder="Please provide any additional details about your vehicle or service needs."
                      ></textarea>
                    </div>
                    
                    <button type="submit" className="btn btn-primary w-full">
                      {t('common.book.appointment')}</button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <div className="bg-white rounded-lg shadow-car p-8 mb-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-10 w-10 text-green-500" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-green-500 mb-4">
                    {language === 'es' ? '¡Reserva Confirmada!' : 'Booking Confirmed!'}</h2>
                  <p className="text-gray-600 mb-6">
                    {language === 'es' 
                      ? "Su cita ha sido programada. Hemos enviado un correo electrónico de confirmación con todos los detalles. Nuestro equipo espera poder atenderle."
                      : "Your appointment has been scheduled. We've sent a confirmation email with all the details. Our team is looking forward to serving you."}
                    {formData.needsPickup && (language === 'es' 
                      ? " Hemos registrado su solicitud para nuestro servicio gratuito de recogida y entrega."
                      : " We've registered your request for our complimentary pick up and delivery service.")}
                  </p>
                  
                  <div className="border-t border-gray-100 pt-6 text-left">
                    <h3 className="font-bold mb-4">{language === 'es' ? 'Próximos Pasos:' : 'Next Steps:'}</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                      <li>{language === 'es' ? 'Revise su correo electrónico para ver los detalles de la confirmación.' : 'Check your email for confirmation details.'}</li>
                      <li>{language === 'es' ? 'Si necesita reprogramar, llámenos con al menos 24 horas de anticipación.' : 'If you need to reschedule, please call us at least 24 hours in advance.'}</li>
                      {formData.needsPickup ? (
                        <li>{language === 'es' ? 'Nuestro equipo se pondrá en contacto con usted para confirmar la hora de recogida en el día programado.' : 'Our team will contact you to confirm the pick up time on your scheduled day.'}</li>
                      ) : null}
                      <li>{language === 'es' ? 'Llegue 10 minutos antes de su cita programada.' : 'Arrive 10 minutes before your scheduled appointment time.'}</li>
                      <li>{language === 'es' ? 'Traiga el registro de su vehículo y la información del seguro.' : 'Bring your vehicle registration and insurance information.'}</li>
                    </ol>
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/" className="btn btn-outline">
                    {language === 'es' ? 'Regresar al Inicio' : 'Return to Home'}</Link>
                  <Link href="/services" className="btn btn-primary">
                    {language === 'es' ? 'Explorar Nuestros Servicios' : 'Explore Our Services'}</Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Why Book With Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              {language === 'es' ? 'Por qué Reservar Con ' : 'Why Book With '}
              <span className="text-primary">{language === 'es' ? 'Nosotros' : 'Us'}</span>
            </h2>
            <p className="text-gray-600">
              {language === 'es' ? 'Experimente la comodidad y calidad que nos distingue.' : t('common.experience.the.conve')}</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="bg-white p-6 rounded-lg shadow-car text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-primary" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">
                {language === 'es' ? 'Rápido y Conveniente' : t('common.quick.convenient')}
              </h3>
              <p className="text-gray-600">
                {language === 'es' ? 'Nuestro sistema de reservas en línea le permite programar su cita en minutos, a cualquier hora del día o de la noche.' : t('common.our.online.booking.s')}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="bg-white p-6 rounded-lg shadow-car text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-primary" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">
                {language === 'es' ? 'Sin Sorpresas' : t('common.no.surprises')}
              </h3>
              <p className="text-gray-600">
                {language === 'es' ? 'Le proporcionaremos un presupuesto detallado antes de comenzar cualquier trabajo, para que sepa exactamente qué esperar.' : t('common.well.provide.a.detai')}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.9 }}
              className="bg-white p-6 rounded-lg shadow-car text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-primary" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">
                {language === 'es' ? 'Servicio Experto' : t('common.expert.service')}
              </h3>
              <p className="text-gray-600">
                {language === 'es' ? 'Nuestro equipo de técnicos certificados tiene la formación y experiencia para manejar cualquier proyecto automotriz con precisión.' : t('common.our.team.of.certifie')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
} 