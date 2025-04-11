"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { HiPhone, HiMail, HiLocationMarker, HiClock } from "react-icons/hi";
import { useLanguage } from "../../utils/LanguageContext";

interface GoogleMapProps {
  address: string;
  height?: string;
  width?: string;
}

const GoogleMap = ({ address, height = '100%', width = '100%' }: GoogleMapProps) => {
  const { t } = useLanguage();
  
  // Create a URL-friendly version of the address
  const encodedAddress = encodeURIComponent(address);
  
  // Use Google Maps embed that doesn't require an API key
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3155.973412180308!2d-122.38798158426412!3d37.71840242034071!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808f7f4877f54b87%3A0x94ce77cb6c7ec8e0!2s1330%20Egbert%20Ave%2C%20San%20Francisco%2C%20CA%2094124!5e0!3m2!1sen!2sus!4v1652475244909!5m2!1sen!2sus`;
  
  return (
    <iframe
      src={mapUrl}
      width={width}
      height={height}
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title={t('contact.google.maps.location')}
      aria-label={t('contact.map.showing.the.loca')}
      className="rounded-lg"
    />
  );
};

export default function ContactPage() {
  const { t, language } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  
  const [formStatus, setFormStatus] = useState<null | "success" | "error">(null);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    try {
      setFormStatus("success");
      // Reset form after success
      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "",
        message: "",
      });
    } catch (error) {
      setFormStatus("error");
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
              <span className="text-primary">{t('contact.us')}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-600 mb-8"
            >
              {t('contact.have.questions.re')}</motion.p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-white rounded-lg shadow-car p-8">
                <h2 className="text-2xl font-bold mb-6">{t('contact.send.us.a.message')}</h2>
                
                {formStatus === "success" && (
                  <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md">
                    {t('contact.thank.you.for.m')}</div>
                )}
                
                {formStatus === "error" && (
                  <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
                    {t('contact.there.was.an.error.s')}</div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="form-label">
                      {t('contact.your.name')}</label>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="email" className="form-label">
                        {language === 'es' ? 'Correo Electrónico' : 'Email Address'}</label>
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
                    <div>
                      <label htmlFor="phone" className="form-label">
                        {language === 'es' ? 'Número de Teléfono' : t('contact.phone.number')}</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="(123) 456-7890"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="service" className="form-label">
                      {language === 'es' ? 'Servicio de Interés' : 'Service Interested In'}</label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="">{language === 'es' ? 'Seleccione un servicio' : 'Select a service'}</option>
                      <option value="collision">{language === 'es' ? 'Reparación de Colisión' : 'Collision Repair'}</option>
                      <option value="paint">{language === 'es' ? 'Pintura Personalizada' : 'Custom Paint'}</option>
                      <option value="restoration">{language === 'es' ? 'Restauración de Clásicos' : 'Classic Restoration'}</option>
                      <option value="specialty">{language === 'es' ? 'Especialidad' : 'Specialty'}</option>
                      <option value="other">{language === 'es' ? 'Otro' : 'Other'}</option>
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="form-label">
                      {t('contact.your.message')}</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="form-input"
                      placeholder="Tell us about your project or inquiry..."
                    ></textarea>
                  </div>
                  
                  <button type="submit" className="btn btn-primary w-full">
                    {t('contact.send.message')}</button>
                </form>
              </div>
            </motion.div>
            
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-white">{language === 'es' ? 'Información de Contacto' : 'Contact Information'}</h2>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-primary text-white p-3 rounded-md mr-4">
                        <HiPhone size={24} />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg text-white">{language === 'es' ? 'Teléfono' : 'Phone'}</h3>
                        <p className="text-white">{language === 'es' ? '(415) 447-4001' : '(415) 447-4001'}</p>
                        <p className="text-white text-sm mt-1">{language === 'es' ? 'Lunes - Sábado: 9:00 AM - 5:00 PM' : 'Monday - Saturday: 9:00 AM - 5:00 PM'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-primary text-white p-3 rounded-md mr-4">
                        <HiMail size={24} />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg text-white">{language === 'es' ? 'Correo Electrónico' : 'Email'}</h3>
                        <p className="text-white">international_auto@sbcglobal.net</p>
                        <p className="text-white text-sm mt-1">{language === 'es' ? 'Responderemos en 24 horas' : 'We will respond within 24 hours'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-primary text-white p-3 rounded-md mr-4">
                        <HiLocationMarker size={24} />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg text-white">{language === 'es' ? 'Ubicación' : 'Location'}</h3>
                        <p className="text-white">1330 Egbert Avenue</p>
                        <p className="text-white">San Francisco, CA 94124</p>
                        <a 
                          href="https://maps.google.com?q=1330+Egbert+Avenue+San+Francisco+CA+94124" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-white text-sm mt-1 inline-block hover:underline"
                        >
                          {language === 'es' ? 'Obtener Indicaciones' : 'Get Directions'}</a>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-primary text-white p-3 rounded-md mr-4">
                        <HiClock size={24} />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg text-white">{language === 'es' ? 'Horario' : 'Hours'}</h3>
                        <p className="text-white">{language === 'es' ? 'Lunes - Sábado: 9:00 AM - 5:00 PM' : 'Monday - Saturday: 9:00 AM - 5:00 PM'}</p>
                        <p className="text-white">{language === 'es' ? 'Domingo: Cerrado' : 'Sunday: Closed'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">{language === 'es' ? 'Programar una Cita' : 'Schedule an Appointment'}</h3>
                  <p className="text-gray-600 mb-4">
                    {language === 'es' ? '¿Necesita programar una cita de inmediato? Utilice nuestro sistema de reservas en línea para un servicio más rápido.' : 'Need to schedule an appointment right away? Use our online booking system for faster service.'}</p>
                  <Link href="/booking" className="btn btn-accent w-full">
                    {language === 'es' ? 'Reservar una Cita' : 'Book an Appointment'}</Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-10">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative aspect-video rounded-lg overflow-hidden shadow-car"
          >
            <GoogleMap 
              address={'1330 Egbert Avenue, San Francisco, CA 94124'} 
              height="600"
            />
          </motion.div>
          <div className="text-center mt-4 text-gray-500 text-sm">
            <p>{language === 'es' ? 'Visítenos en nuestra ubicación en San Francisco' : 'Visit us at our San Francisco location'}</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              <span className="text-primary">{language === 'es' ? 'Preguntas?' : 'Questions?'}</span>
            </h2>
            <p className="text-gray-600">
              {language === 'es' ? 'Encuentre respuestas a preguntas comunes sobre nuestros servicios y procesos.' : 'Find answers to common questions about our services and processes.'}</p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="bg-white p-6 rounded-lg shadow-car"
            >
              <h3 className="font-bold text-lg mb-2">{language === 'es' ? '¿Cuánto tiempo toma una reparación típica?' : 'How long does a typical repair take?'}</h3>
              <p className="text-gray-600">
                {language === 'es' 
                  ? 'Los tiempos de reparación dependen del tipo y extensión del daño. Las reparaciones menores pueden tomar 1-3 días, mientras que trabajos de colisión mayores o restauraciones pueden tomar varias semanas. Proporcionaremos una estimación de tiempo durante su consulta inicial.'
                  : 'Repair times depend on the type and extent of damage. Minor repairs may take 1-3 days, while major collision work or restorations can take several weeks. We\'ll provide a timeframe estimate during your initial consultation.'}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="bg-white p-6 rounded-lg shadow-car"
            >
              <h3 className="font-bold text-lg mb-2">{language === 'es' ? '¿Trabajan con compañías de seguros?' : 'Do you work with insurance companies?'}</h3>
              <p className="text-gray-600">
                {language === 'es'
                  ? 'Sí, trabajamos con todas las principales compañías de seguros y podemos ayudar a gestionar su reclamación de principio a fin, asegurando que reciba la cobertura a la que tiene derecho.'
                  : 'Yes, we work with all major insurance companies and can help manage your claim from start to finish, ensuring you receive the coverage you\'re entitled to.'}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.9 }}
              className="bg-white p-6 rounded-lg shadow-car"
            >
              <h3 className="font-bold text-lg mb-2">{language === 'es' ? '¿Ofrecen garantía por su trabajo?' : 'Do you offer warranty on your work?'}</h3>
              <p className="text-gray-600">
                {language === 'es'
                  ? 'Absolutamente. Proporcionamos una garantía de por vida en todas las reparaciones y trabajos de pintura mientras sea propietario de su vehículo.'
                  : 'Absolutely. We provide a lifetime warranty on all repairs and paintwork for as long as you own your vehicle.'}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 1 }}
              className="bg-white p-6 rounded-lg shadow-car"
            >
              <h3 className="font-bold text-lg mb-2">{language === 'es' ? '¿Puedo obtener un presupuesto antes de comprometerme a reparaciones?' : 'Can I get an estimate before committing to repairs?'}</h3>
              <p className="text-gray-600">
                {language === 'es'
                  ? 'Sí, proporcionamos presupuestos detallados gratuitos para todos los servicios. Puede traer su vehículo para una evaluación o enviar fotos para una evaluación inicial.'
                  : 'Yes, we provide free detailed estimates for all services. You can bring your vehicle in for an evaluation or send photos for an initial assessment.'}</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
} 