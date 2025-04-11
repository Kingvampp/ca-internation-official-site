"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "../../utils/LanguageContext";
import { HiUsers, HiClock, HiShieldCheck, HiStar } from "react-icons/hi";
import { FaTools, FaHandshake, FaCar, FaHistory, FaMapMarkerAlt } from "react-icons/fa";

const AboutPage = () => {
  const { t, language } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  // Stats data
  const stats = [
    {
      icon: <HiUsers size={32} color="var(--primary-color)" />,
      value: "5000+",
      label: language === 'es' ? 'Clientes Satisfechos' : 'Satisfied Clients',
    },
    {
      icon: <HiClock size={32} color="var(--primary-color)" />,
      value: "25+",
      label: language === 'es' ? 'Años de Experiencia' : 'Years of Experience',
    },
    {
      icon: <HiShieldCheck size={32} color="var(--primary-color)" />,
      value: "100%",
      label: language === 'es' ? 'Garantía de Calidad' : 'Quality Guarantee',
    },
    {
      icon: <HiStar size={32} color="var(--primary-color)" />,
      value: "4.9",
      label: language === 'es' ? 'Calificación Promedio' : 'Average Rating',
    },
  ];

  // Values data
  const values = [
    {
      title: language === 'es' ? 'Artesanía de Calidad' : 'Quality Craftsmanship',
      description: language === 'es'
        ? 'Nunca comprometemos la calidad. Cada reparación y restauración se realiza con atención meticulosa al detalle y los más altos estándares de artesanía.'
        : "We never compromise on quality. Every repair and restoration is performed with meticulous attention to detail and the highest standards of workmanship.",
      icon: <FaTools size={32} color="#fff" />,
    },
    {
      title: language === 'es' ? 'Satisfacción del Cliente' : 'Customer Satisfaction',
      description: language === 'es'
        ? 'La satisfacción de nuestros clientes es nuestra máxima prioridad. Trabajamos de cerca con cada cliente para asegurar que su visión y expectativas no solo se cumplan, sino que se excedan.'
        : "Our clients satisfaction is our top priority. We work closely with each customer to ensure their vision and expectations are not just met, but exceeded.",
      icon: <FaHandshake size={32} color="#fff" />,
    },
    {
      title: language === 'es' ? 'Entrega Puntual' : 'Timely Delivery',
      description: language === 'es'
        ? 'Entendemos la importancia de devolverle a la carretera. Nos comprometemos con plazos realistas y le mantenemos informado durante todo el proceso.'
        : "We understand the importance of getting you back on the road. We commit to realistic timelines and keep you informed throughout the process.",
      icon: <HiClock size={32} color="#fff" />,
    },
    {
      title: language === 'es' ? 'Excelencia en la Industria' : 'Industry Excellence',
      description: language === 'es'
        ? 'Invertimos continuamente en la última tecnología y técnicas para proporcionar soluciones de vanguardia incluso para los proyectos automotrices más desafiantes.'
        : "We continuously invest in the latest technology and techniques to provide cutting-edge solutions for even the most challenging automotive projects.",
      icon: <HiStar size={32} color="#fff" />,
    },
  ];

  return (
    <div className="pt-20 pb-0" ref={ref}>
      {/* Hero Section - Update with more consistent blue theme */}
      <section className="relative py-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-cover bg-center z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-black/70 to-blue-800/80"></div>
          <div className="bg-hero-pattern absolute inset-0"></div>
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="hero-particles"></div>
          <div className="diagonal-lines"></div>
        </div>

        <div className="container relative z-10">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-6xl font-bold mb-6 text-white hero-text-glow"
            >
              {language === 'es' 
                ? 'El Principal Taller Automotriz de ' 
                : "San Francisco's Premier "}
              <motion.span 
                className="text-sky-400 inline-block"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              >
                {language === 'es' 
                  ? 'San Francisco' 
                  : "Automotive Shop"}
              </motion.span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              {language === 'es'
                ? 'Sirviendo al Área de la Bahía con artesanía excepcional desde 1997'
                : 'Serving the Bay Area with exceptional craftsmanship since 1997'}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex justify-center items-center"
            >
              <div className="inline-flex items-center bg-blue-900/40 px-4 py-2 rounded-md backdrop-blur-sm border border-blue-400/20 shadow-glow">
                <FaMapMarkerAlt size={16} color="white" />
                <span className="text-white ml-2">San Francisco, CA</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About CA International Section - Remove white background */}
      <section className="py-20 relative overflow-hidden">
        <div className="about-bg-graphics"></div>
        <div className="container relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="text-gray-500 text-4xl font-light"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                About
              </motion.div>
              <motion.h2 
                className="text-5xl font-bold mb-6 text-sky-500"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              >
                CA International
              </motion.h2>
              <div className="space-y-5 text-gray-600 text-lg">
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  {language === 'es'
                    ? 'Desde 1997, CA International Automotive ha sido el destino principal para la excelencia automotriz en el Área de la Bahía. Lo que comenzó como un pequeño negocio familiar se ha convertido en un nombre de confianza en reparación de colisiones, trabajos de pintura personalizados y restauración de automóviles clásicos.'
                    : 'Since 1997, CA International Automotive has been the premier destination for automotive excellence in the Bay Area. What started as a small family business has grown into a trusted name in collision repair, custom paint work, and classic car restoration.'}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  {language === 'es'
                    ? 'Ubicado en el corazón de San Francisco, nuestro equipo de técnicos capacitados combina la artesanía tradicional con tecnología de vanguardia para ofrecer resultados que superan las expectativas. Tratamos cada vehículo con el cuidado y la atención que merece, ya sea un auto de uso diario o un artículo de colección valioso.'
                    : 'Located in the heart of San Francisco, our team of skilled technicians combines traditional craftsmanship with cutting-edge technology to deliver results that exceed expectations. We treat every vehicle with the care and attention it deserves, whether it is a daily driver or a prized collector item.'}
                </motion.p>
              </div>
              <motion.div 
                className="mt-8 flex gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <Link 
                  href="/services" 
                  className="bg-sky-500 text-white font-bold py-3 px-6 rounded-md transition duration-300 hover:bg-sky-600 hover:shadow-lg"
                >
                  {language === 'es' ? 'Nuestros Servicios' : 'Our Services'}
                </Link>
                <Link 
                  href="/contact" 
                  className="bg-gray-100 text-gray-800 font-bold py-3 px-6 rounded-md transition duration-300 hover:bg-gray-200 hover:shadow-lg"
                >
                  {language === 'es' ? 'Contáctenos' : 'Get in Touch'}
                </Link>
              </motion.div>
            </motion.div>
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/about/workshop.jpg"
                  alt="CA International Workshop"
                  fill
                  className="object-cover hover-zoom"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 text-white text-center">
                  {language === 'es' 
                    ? 'Nuestras instalaciones de última generación en San Francisco' 
                    : 'Our state-of-the-art facility in San Francisco'}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our San Francisco Story Section - Remove bg-gray-50 */}
      <section className="py-20 relative overflow-hidden">
        <div className="story-bg-pattern"></div>
        <div className="container relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-4">
              <span className="text-gray-800">Our </span>
              <span className="text-sky-500">San Francisco Story</span>
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-xl">
              {language === 'es' 
                ? 'El viaje que nos convirtió en el taller automotriz más confiable del Área de la Bahía'
                : "The journey that made us the Bay Area's most trusted automotive shop"}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative h-[500px] rounded-lg overflow-hidden shadow-2xl founder-image-container">
                <Image
                  src="/images/about/founder.jpg"
                  alt="CA International Founder"
                  fill
                  className="object-cover founder-image"
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold mb-6 text-sky-800">
                {language === 'es' ? 'De Humildes Comienzos en SF' : 'From Humble Beginnings in SF'}
              </h3>
              <div className="space-y-4 text-gray-600 text-lg">
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  {language === 'es'
                    ? 'Nuestro fundador, Oscar Martinez, aportó más de 10 años de experiencia trabajando con vehículos europeos de lujo cuando estableció CA International. Su compromiso con la excelencia y atención al detalle rápidamente le ganó al taller una reputación de calidad y servicio excepcionales.'
                    : 'Our founder, Oscar Martinez, brought over 10 years of experience working with luxury European vehicles when he established CA International. His commitment to excellence and attention to detail quickly earned the shop a reputation for exceptional quality and service.'}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  {language === 'es'
                    ? 'Hoy, CA International Automotive continúa defendiendo estos principios fundacionales, combinando la artesanía tradicional con tecnología de vanguardia para ofrecer resultados que superan las expectativas de nuestros clientes.'
                    : "Today, CA International Automotive continues to uphold these founding principles, combining traditional craftsmanship with cutting-edge technology to deliver results that exceed our customers expectations."}
                </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="values-section py-20">
        <div className="values-overlay"></div>
        <div className="values-grid-bg"></div>
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl text-white font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              {language === 'es' ? 'Nuestros Valores' : 'Our Values'}
            </motion.h2>
            <motion.p 
              className="text-blue-200 text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {language === 'es'
                ? 'En CA International, nuestros valores fundamentales guían cada reparación, cada interacción y cada decisión que tomamos.'
                : 'At CA International, our core values guide every repair, every interaction, and every decision we make.'}
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="bg-blue-800/50 p-8 rounded-lg shadow-glow-blue hover:shadow-glow-blue-hover transition-all duration-500 backdrop-blur-sm value-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mb-4 shadow-glow-sm value-icon">
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center mb-4">{value.title}</h3>
                <p className="text-gray-300 text-center">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - More dynamic blue background */}
      <section className="py-16 bg-sky-500 text-white cta-section">
        <div className="cta-overlay"></div>
        <div className="cta-circles"></div>
        <div className="container relative z-10">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              {language === 'es' 
                ? '¿Listo para Experimentar la Diferencia de CA International?' 
                : 'Ready to Experience the CA International Difference?'}
            </h2>
            <p className="text-xl mb-8 text-white">
              {language === 'es'
                ? 'Ya sea que necesite reparación de colisiones, trabajos de pintura personalizados o restauración de automóviles clásicos, nuestro equipo está listo para superar sus expectativas.'
                : 'Whether you need collision repair, custom paint work, or classic car restoration, our team is ready to exceed your expectations.'}
            </p>
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Link 
                href="/contact" 
                className="bg-white text-sky-500 hover:bg-gray-100 font-bold py-3 px-8 rounded-md transition duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                {language === 'es' ? 'Contáctenos' : 'Contact Us'}
              </Link>
              <Link 
                href="/booking" 
                className="bg-transparent hover:bg-sky-600 border-2 border-white font-bold py-3 px-8 rounded-md transition duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                {language === 'es' ? 'Agendar una Cita' : 'Book an Appointment'}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <style>{`
        .container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        /* Global pattern styles */
        .bg-pattern {
          background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                          linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        
        /* Hero section styles */
        .bg-hero-pattern {
          background-image: url('/images/about/about-hero.jpg');
          background-size: cover;
          background-position: center;
          animation: slowPan 30s ease-in-out infinite alternate;
        }
        
        .hero-text-glow {
          text-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
        }
        
        .shadow-glow {
          box-shadow: 0 0 15px rgba(56, 189, 248, 0.2);
        }
        
        .shadow-glow-blue {
          box-shadow: 0 0 15px rgba(30, 64, 175, 0.3);
        }
        
        .shadow-glow-blue-hover {
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
        }
        
        .shadow-glow-sm {
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
        }
        
        /* Hero section animations */
        @keyframes slowPan {
          0% {
            transform: scale(1.1) translate(0, 0);
          }
          50% {
            transform: scale(1.15) translate(-1%, -1%);
          }
          100% {
            transform: scale(1.1) translate(1%, 1%);
          }
        }
        
        /* Hero particles */
        .hero-particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: radial-gradient(circle, rgba(56, 189, 248, 0.1) 1px, transparent 1px);
          background-size: 25px 25px;
          animation: particlesFade 8s ease-in-out infinite alternate;
        }
        
        /* Diagonal lines (common across site) */
        .diagonal-lines {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: repeating-linear-gradient(
            45deg,
            rgba(56, 189, 248, 0.03),
            rgba(56, 189, 248, 0.03) 1px,
            transparent 1px,
            transparent 30px
          );
          animation: moveDiagonal 120s linear infinite;
        }
        
        @keyframes moveDiagonal {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 1000px 1000px;
          }
        }
        
        @keyframes particlesFade {
          0% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 0.2;
          }
        }
        
        /* About section styling */
        .about-bg-graphics {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 20% 80%, rgba(56, 189, 248, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(30, 64, 175, 0.1) 0%, transparent 50%),
            linear-gradient(to bottom, rgba(30, 64, 175, 0.05), rgba(56, 189, 248, 0.05));
          opacity: 0.9;
          z-index: -1;
        }
        
        /* Story section background */
        .story-bg-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(to right, rgba(56, 189, 248, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.05) 1px, transparent 1px),
            radial-gradient(circle at 50% 50%, rgba(30, 64, 175, 0.05), transparent 70%);
          background-size: 30px 30px, 30px 30px, 100% 100%;
          opacity: 0.9;
          z-index: -1;
        }
        
        /* Values section styling */
        .values-section {
          position: relative;
          overflow: hidden;
          background-color: transparent !important;
          z-index: 0;
        }
        
        .values-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(30, 58, 138, 0.9), rgba(30, 64, 175, 0.9));
          z-index: 1;
        }
        
        .values-grid-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 20px 20px;
          z-index: 2;
        }
        
        .values-particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 2;
          background-image: 
            radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            radial-gradient(circle, rgba(255, 255, 255, 0.05) 2px, transparent 2px);
          background-size: 50px 50px, 90px 90px;
          animation: particlesFloat 80s linear infinite;
        }
        
        .values-lines {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 2;
          background-image: 
            linear-gradient(90deg, transparent 95%, rgba(56, 189, 248, 0.2) 95%),
            linear-gradient(transparent 95%, rgba(56, 189, 248, 0.2) 95%);
          background-size: 30px 30px;
          opacity: 0.3;
        }
        
        @keyframes particlesFloat {
          0% {
            background-position: 0 0, 0 0;
          }
          100% {
            background-position: 100px 100px, 200px 200px;
          }
        }
        
        .value-card {
          position: relative;
          border: 1px solid rgba(56, 189, 248, 0.1);
          overflow: hidden;
          backdrop-filter: blur(5px);
        }
        
        .value-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(56, 189, 248, 0.5), transparent);
          transform: translateX(-100%);
          animation: lightPass 5s ease-in-out infinite;
        }
        
        .value-icon {
          position: relative;
          overflow: hidden;
        }
        
        .value-icon::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          right: -50%;
          bottom: -50%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.5) 0%, transparent 70%);
          opacity: 0;
          animation: pulseGlow 3s ease-in-out infinite;
        }
        
        @keyframes lightPass {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes pulseGlow {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            opacity: 0.3;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.5);
          }
        }
        
        /* CTA section styling */
        .cta-section {
          position: relative;
          overflow: hidden;
        }
        
        .cta-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(120deg, rgba(56, 189, 248, 0.1) 0%, transparent 50%),
            linear-gradient(-120deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
          z-index: 1;
          animation: shiftGradient 15s ease-in-out infinite alternate;
        }
        
        .cta-circles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1;
          background-image: 
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 20%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 20%),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 30%);
          opacity: 0.7;
        }
        
        @keyframes shiftGradient {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }
        
        /* Image hover effects */
        .hover-zoom {
          transition: transform 0.5s ease-in-out;
        }
        
        .hover-zoom:hover {
          transform: scale(1.05);
        }
        
        /* Founder image effects */
        .founder-image-container {
          position: relative;
          overflow: hidden;
        }
        
        .founder-image {
          transition: transform 0.5s ease-in-out;
        }
        
        .founder-image-container:hover .founder-image {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default AboutPage;