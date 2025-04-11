"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { HiCheck, HiShieldCheck, HiClock, HiCurrencyDollar } from "react-icons/hi";
import { useLanguage } from "../../utils/LanguageContext";

export default function ServicesPage() {
  const { t, language } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  // Services data
  const services = [
    {
      id: "collision",
      title: t('services.collision'),
      description: t('services.collisionDesc'),
      image: "/images/service-page/collision repair.jpg",
      features: [
        t('services.features.collision.1'),
        t('services.features.collision.2'),
        t('services.features.collision.3'),
        t('services.features.collision.4'),
        t('services.features.collision.5'),
      ],
    },
    {
      id: "paint",
      title: t('services.paint'),
      description: t('services.paintDesc'),
      image: "/images/service-page/custom paint.jpg",
      features: [
        t('services.features.paint.1'),
        t('services.features.paint.2'),
        t('services.features.paint.3'),
        t('services.features.paint.4'),
        t('services.features.paint.5'),
      ],
    },
    {
      id: "restoration",
      title: t('services.restoration'),
      description: t('services.restorationDesc'),
      image: "/images/service-page/vehicle restoration.jpg",
      features: [
        t('services.features.restoration.1'),
        t('services.features.restoration.2'),
        t('services.features.restoration.3'),
        t('services.features.restoration.4'),
        t('services.features.restoration.5'),
      ],
    },
    {
      id: "detailing",
      title: t('services.detailing'),
      description: t('services.detailingDesc'),
      image: "/images/service-page/vehicle detailing.jpg",
      features: [
        t('services.features.detailing.1'),
        t('services.features.detailing.2'),
        t('services.features.detailing.3'),
        t('services.features.detailing.4'),
        t('services.features.detailing.5'),
      ],
    },
    {
      id: "pickup",
      title: t('services.pickup'),
      description: t('services.pickupDesc'),
      image: "/images/service-page/pick up and delivery.jpg",
      features: [
        t('services.features.pickup.1'),
        t('services.features.pickup.2'),
        t('services.features.pickup.3'),
        t('services.features.pickup.4'),
        t('services.features.pickup.5'),
      ],
    },
    {
      id: "towing",
      title: t('services.towing'),
      description: t('services.towingDesc'),
      image: "/images/service-page/24-7 towing.jpg",
      features: [
        t('services.features.towing.1'),
        t('services.features.towing.2'),
        t('services.features.towing.3'),
        t('services.features.towing.4'),
        t('services.features.towing.5'),
      ],
    },
    {
      id: "frame",
      title: t('services.frame'),
      description: t('services.frameDesc'),
      image: "/images/service-page/frame straightnening.jpg",
      features: [
        t('services.features.frame.1'),
        t('services.features.frame.2'),
        t('services.features.frame.3'),
        t('services.features.frame.4'),
        t('services.features.frame.5'),
      ],
    },
    {
      id: "wheel",
      title: t('services.wheel'),
      description: t('services.wheelDesc'),
      image: "/images/service-page/wheel-repair.jpg",
      features: [
        t('services.features.wheel.1'),
        t('services.features.wheel.2'),
        t('services.features.wheel.3'),
        t('services.features.wheel.4'),
        t('services.features.wheel.5'),
      ],
    },
  ];

  // Benefits
  const benefits = [
    {
      icon: <div className="text-primary"><HiShieldCheck size={32} /></div>,
      title: t('services.benefits.warranty'),
      description: t('services.benefits.warranty.desc'),
    },
    {
      icon: <div className="text-primary"><HiClock size={32} /></div>,
      title: t('services.benefits.turnaround'),
      description: t('services.benefits.turnaround.desc'),
    },
    {
      icon: <div className="text-primary"><HiCurrencyDollar size={32} /></div>,
      title: t('services.benefits.pricing'),
      description: t('services.benefits.pricing.desc'),
    },
  ];

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
              className="text-4xl md:text-5xl font-bold mb-6 text-gray-900"
            >
              <span className="text-gray-900">
                {language === 'es' ? 'Nuestros ' : 'Our '}
                <span className="text-primary">
                  {language === 'es' ? 'Servicios' : 'Services'}
                </span>
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-600 mb-8"
            >
              {language === 'es' 
                ? 'Ofrecemos servicios profesionales de reparación y personalización para todos los tipos de vehículos.' 
                : 'We provide professional repair and customization services for all types of vehicles.'}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container">
          <div className="space-y-24">
            {services.map((service, index) => (
              <div
                key={service.id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className={`order-2 ${
                    index % 2 === 1 ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? 20 : -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 * index + 0.2 }}
                  className={`order-1 ${
                    index % 2 === 1 ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <h2 className="text-3xl font-bold mb-4 text-white">{service.title}</h2>
                  <p className="mb-6 text-gray-200 font-medium leading-relaxed">{service.description}</p>
                  <ul className="space-y-3">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start group transition-all duration-300 hover:translate-x-1">
                        <div className="mt-1 mr-2 transition-transform duration-300 group-hover:scale-110 text-primary">
                          <HiCheck size={20} />
                        </div>
                        <span className="text-gray-200 transition-colors duration-300 group-hover:text-primary font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    {service.id === "towing" ? (
                      <Link
                        href="tel:+14156897200"
                        className="btn btn-primary bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                      >
                        {t('services.call.now')}</Link>
                    ) : (
                      <Link
                        href="/booking"
                        className="btn btn-primary bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                      >
                        {t('services.book.appointment')}</Link>
                    )}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              <span className="text-gray-900">
                {language === 'es' ? '¿Por qué ' : 'Why '}
                <span className="text-primary">
                  {language === 'es' ? 'Elegirnos?' : 'Choose Us?'}
                </span>
              </span>
            </h2>
            <p className="text-gray-600 text-lg">
              {language === 'es'
                ? 'Estamos comprometidos a brindar el servicio de la más alta calidad y la satisfacción del cliente.'
                : "We're committed to providing the highest quality service and customer satisfaction."}
            </p>
          </motion.div>

          {/* Benefits cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <div className="text-primary"><HiShieldCheck size={32} /></div>,
                title: language === 'es' ? 'Garantía de por Vida' : 'Lifetime Warranty',
                description: language === 'es' 
                  ? 'Respaldamos nuestro trabajo con una garantía de por vida en servicios seleccionados.'
                  : 'We back our work with a lifetime warranty on select services.'
              },
              {
                icon: <div className="text-primary"><HiClock size={32} /></div>,
                title: language === 'es' ? 'Servicio Rápido' : 'Quick Turnaround',
                description: language === 'es'
                  ? 'Entendemos el valor de su tiempo y nos esforzamos por completar los trabajos de manera eficiente.'
                  : 'We understand the value of your time and strive to complete jobs efficiently.'
              },
              {
                icon: <div className="text-primary"><HiCurrencyDollar size={32} /></div>,
                title: language === 'es' ? 'Precios Competitivos' : 'Competitive Pricing',
                description: language === 'es'
                  ? 'Ofrecemos servicios de alta calidad a precios justos y competitivos.'
                  : 'We offer high-quality services at fair and competitive prices.'
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 * index + 0.4 }}
                className="bg-white p-8 rounded-lg shadow-car text-center"
              >
                <div className="flex justify-center mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              {language === 'es' ? 'Nuestro Proceso' : 'Our Process'}</h2>
            <p className="text-gray-600 text-lg">
              {language === 'es'
                ? 'Un enfoque sistemático para garantizar resultados excepcionales en cada proyecto.'
                : 'A systematic approach to ensure exceptional results on every project.'}
            </p>
          </motion.div>

          <div className="relative">
            {/* Process timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200 hidden md:block"></div>

            {/* Process steps */}
            <div className="space-y-12 md:space-y-0 relative">
              {[
                {
                  number: 1,
                  title: t('services.process.1.title'),
                  description: t('services.process.1.description'),
                },
                {
                  number: 2,
                  title: t('services.process.2.title'),
                  description: t('services.process.2.description'),
                },
                {
                  number: 3,
                  title: t('services.process.3.title'),
                  description: t('services.process.3.description'),
                },
                {
                  number: 4,
                  title: t('services.process.4.title'),
                  description: t('services.process.4.description'),
                },
                {
                  number: 5,
                  title: t('services.process.5.title'),
                  description: t('services.process.5.description'),
                },
              ].map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.15 * index + 0.6 }}
                  className={`md:flex items-center ${
                    index % 2 === 0
                      ? "md:flex-row"
                      : "md:flex-row-reverse md:text-right"
                  } mb-12`}
                >
                  <div
                    className={`md:w-1/2 ${
                      index % 2 === 0 ? "md:pr-12" : "md:pl-12"
                    }`}
                  >
                    <div className="bg-white p-6 rounded-lg shadow-car">
                      <h3 className="text-xl font-bold mb-2 text-gray-900">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  <div className="flex justify-center my-4 md:my-0 md:w-0">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg relative z-10">
                      {step.number}
                    </div>
                  </div>
                  <div className="md:w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1 }}
              className="text-3xl md:text-4xl font-bold mb-6"
            >
              {t('services.ready.get.started')}</motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="text-lg text-white/80 mb-8"
            >
              {t('services.cta.description')}</motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link
                href="tel:+14156897200"
                className="btn bg-white text-primary hover:bg-gray-100"
              >
                {t('services.call.now')}</Link>
              <Link
                href="/booking"
                className="btn bg-accent text-white hover:bg-accent/90"
              >
                {t('services.book.appointment')}</Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
} 