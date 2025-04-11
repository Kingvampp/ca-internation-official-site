"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { useLanguage } from "../../utils/LanguageContext";

export default function Contact() {
  const { t, translationStats, language } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    service: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Log translation keys for debugging purposes
  useEffect(() => {
    console.log('🌐 [Contact] Translation stats:', {
      loaded: translationStats.loaded,
      count: translationStats.count,
      missing: translationStats.missing.length
    });
    
    // Check for key translations we're using
    const keysToCheck = [
      'contact.us',
      'contact.subtitle',
      'contact.phoneLabel',
      'contact.email',
      'contact.location',
      'contact.hours',
      'contact.monday.saturday.900.',
      'contact.sunday.closed',
      'contact.1330.egbert.avenue',
      'contact.san.francisco.ca.941',
      'contact.locationTitle',
      'contact.mapTitle'
    ];
    
    keysToCheck.forEach(key => {
      const translation = t(key);
      if (translation === key) {
        console.warn(`🌐 [Contact] Missing translation for: ${key}`);
      } else {
        console.log(`🌐 [Contact] Translation loaded for ${key}: "${translation}"`);
      }
    });
  }, [t, translationStats, language]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    // Simulate form submission
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitSuccess(true);
      setFormState({
        name: "",
        email: "",
        phone: "",
        message: "",
        service: "",
      });
    } catch (error) {
      setSubmitError(t('contact.there.was.an.error.s'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-white" id="contact" ref={ref}>
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="section-title"
          >
            {t('contact.us')} <span className="text-primary">{t('contact.subtitle')}</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="section-subtitle"
          >
            {t('contact.have.questions.re')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-gray-50 rounded-lg shadow-car p-8">
              <h3 className="text-2xl font-bold mb-6">{t('contact.send.us.a.message')}</h3>

              {submitSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                  {t('contact.thank.you.for.m')}
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="form-label">
                        {t('contact.your.name')}
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        className="form-input"
                        placeholder={t('contact.your.name')}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="form-label">
                        {language === 'es' ? 'Correo Electrónico' : 'Email'}
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        className="form-input"
                        placeholder={language === 'es' ? 'Correo Electrónico' : 'Email'}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="phone" className="form-label">
                        {t('contact.phone.number')}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formState.phone}
                        onChange={handleChange}
                        className="form-input"
                        placeholder={t('contact.phonePlaceholder')}
                      />
                    </div>
                    <div>
                      <label htmlFor="service" className="form-label">
                        {t('contact.service.interested.i')}
                      </label>
                      <select
                        id="service"
                        name="service"
                        value={formState.service}
                        onChange={handleChange}
                        className="form-input"
                        required
                      >
                        <option value="">{t('contact.select.a.service')}</option>
                        <option value="collision">{t('contact.collision.repair')}</option>
                        <option value="paint">{t('contact.custom.paint')}</option>
                        <option value="restoration">{t('contact.classic.restoration')}</option>
                        <option value="detailing">{t('services.detailing')}</option>
                        <option value="other">{t('contact.other')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="message" className="form-label">
                      {t('contact.your.message')}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formState.message}
                      onChange={handleChange}
                      rows={4}
                      className="form-input"
                      placeholder={t('contact.your.message')}
                      required
                    ></textarea>
                  </div>

                  {submitError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                      {t('contact.there.was.an.error.s')}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    className={`btn btn-primary w-full ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('contact.sending') : t('contact.send.message')}
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="h-full flex flex-col">
              <div className="bg-primary text-white rounded-lg shadow-car p-8 mb-8">
                <h3 className="text-2xl font-bold mb-6">{t('contact.information')}</h3>
                <ul className="space-y-6">
                  <div className="flex items-start">
                    <span className="text-accent mt-1 mr-4 flex-shrink-0">
                      <FaPhoneAlt size={16} />
                    </span>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{t('contact.phoneLabel')}</h4>
                      <a
                        href="tel:+14154474001"
                        className="text-white hover:text-white transition-colors"
                      >
                        {t('contact.4474001')}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <span className="text-accent mt-1 mr-4 flex-shrink-0">
                      <FaEnvelope size={16} />
                    </span>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{language === 'es' ? 'Correo Electrónico' : t('contact.email')}</h4>
                      <a
                        href="mailto:international_auto@sbcglobal.net"
                        className="text-white hover:text-white transition-colors"
                      >
                        {t('contact.infocainternationalc')}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <span className="text-accent mt-1 mr-4 flex-shrink-0">
                      <FaMapMarkerAlt size={16} />
                    </span>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{t('contact.location')}</h4>
                      <address className="text-white not-italic">
                        {language === 'es' ? '1330 Egbert Avenue, San Francisco, CA 94124' : t('contact.1330.egbert.avenue')}<br />
                        {t('contact.san.francisco.ca.941')}
                      </address>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <span className="text-accent mt-1 mr-4 flex-shrink-0">
                      <FaClock size={16} />
                    </span>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{t('contact.hours')}</h4>
                      <div className="text-white">
                        <p>{t('contact.monday.saturday.900.')}</p>
                        <p>{language === 'es' ? 'Domingo: Cerrado' : t('contact.sunday.closed')}</p>
                      </div>
                    </div>
                  </div>
                </ul>
              </div>

              <div className="bg-gray-100 rounded-lg p-8 flex-grow">
                <h3 className="text-2xl font-bold mb-6">{t('contact.locationTitle')}</h3>
                <div className="relative h-64 w-full rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3155.8773454685113!2d-122.38918742393953!3d37.72461767191848!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808f7f39377596c1%3A0x9f66ad9a491a8d57!2s1330%20Egbert%20Ave%2C%20San%20Francisco%2C%20CA%2094124!5e0!3m2!1sen!2sus!4v1695662841562!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    className="absolute inset-0 border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={t('contact.mapTitle')}
                    aria-label={t('contact.google.maps.location')}
                  ></iframe>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 