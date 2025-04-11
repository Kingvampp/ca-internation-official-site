"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { FaQuoteLeft, FaStar, FaChevronLeft, FaChevronRight, FaPaperPlane } from "react-icons/fa";
import { useLanguage } from "../../utils/LanguageContext";
import { Testimonial } from "@/utils/testimonialService";

// Service options for the form
const serviceOptions = [
  "Collision Repair",
  "Paint Correction",
  "Classic Restoration",
  "Dent Removal",
  "Custom Paint Job",
  "Vehicle Detailing",
  "Wheel Repair",
  "Interior Restoration",
  "Other"
];

// Color options for testimonial cards (will be assigned randomly to fetched testimonials)
const colorOptions = [
  "from-blue-500 to-purple-600",
  "from-emerald-400 to-cyan-500", 
  "from-rose-500 to-orange-500",
  "from-amber-500 to-yellow-400",
  "from-fuchsia-500 to-pink-500",
  "from-bmw-blue to-bmw-darker-blue"
];

export default function TestimonialsPage() {
  const { t, language } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [backgroundPosition, setBackgroundPosition] = useState({ x: 0, y: 0 });
  const [formRating, setFormRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    car: "",
    service: "",
    comment: ""
  });
  const [testimonials, setTestimonials] = useState<Array<Testimonial & {color: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");
  
  const pageRef = useRef(null);
  const testimonialsSectionRef = useRef(null);
  const formSectionRef = useRef(null);
  const isPageInView = useInView(pageRef, { once: true, amount: 0.1 });
  const isTestimonialsSectionInView = useInView(testimonialsSectionRef, { once: true, amount: 0.1 });
  const isFormSectionInView = useInView(formSectionRef, { once: true, amount: 0.1 });

  // Fetch testimonials from API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/testimonials');
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          // Transform the data to include UI elements
          const enrichedTestimonials = data.data.map((testimonial: Testimonial, index: number) => ({
            ...testimonial,
            // Pick a color based on index, or randomly if there's more testimonials than colors
            color: colorOptions[index % colorOptions.length],
            // Add a role field if it doesn't exist
            role: testimonial.role || "Verified Customer",
            // Format the date if needed
            formattedDate: testimonial.date ? formatDate(testimonial.date) : "",
          }));
          
          setTestimonials(enrichedTestimonials);
        } else {
          console.error("Failed to fetch testimonials:", data.error);
          // Set some fallback sample data for better UX
          setTestimonials(getSampleTestimonials());
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        // Set some fallback sample data for better UX
        setTestimonials(getSampleTestimonials());
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTestimonials();
  }, []);

  // Function to format dates from Firestore timestamps
  const formatDate = (date: any) => {
    if (!date) return "";
    
    try {
      // If it's a Firestore timestamp or has toDate method
      if (typeof date.toDate === 'function') {
        date = date.toDate();
      }
      
      // If it's a string, try to convert it
      if (typeof date === 'string') {
        date = new Date(date);
      }
      
      // Get month and year
      const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
      const year = date.getFullYear();
      
      return `${month} ${year}`;
    } catch (e) {
      console.error("Error formatting date:", e);
      return "";
    }
  };

  // Fallback testimonials in case the API fails
  const getSampleTestimonials = () => {
    return [
      {
        id: "1",
        name: "John D.",
        role: "Verified Yelp Review",
        rating: 5,
        message:
          "Oscar and his team are amazing! They fixed my car after a bad accident and it looks brand new. The attention to detail and quality of work is outstanding. I highly recommend CA International Automotive for any auto body work.",
        car: "Tesla Model S",
        service: "Collision Repair",
        formattedDate: "February 2023",
        color: "from-blue-500 to-purple-600",
        status: "approved" as const
      },
      // ... other sample testimonials
    ];
  };

  // Track mouse position for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setBackgroundPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Navigate through testimonials
  const goToNext = () => setActiveIndex((prev) => (prev + 1) % testimonials.length);
  const goToPrev = () => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  const goToIndex = (index: number) => setActiveIndex(index);

  // Render star ratings
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <FaStar 
        key={`star-${index}`} 
        color={index < rating ? "#FFD700" : "#E0E0E0"} 
        size={16}
      />
    ));
  };
  
  // Handle input change in the form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle star rating in the form
  const handleStarClick = (rating: number) => {
    setFormRating(rating);
  };
  
  const handleStarHover = (rating: number) => {
    setHoverRating(rating);
  };
  
  const handleStarLeave = () => {
    setHoverRating(0);
  };
  
  // Render form star rating
  const renderFormStars = () => {
    return Array.from({ length: 5 }).map((_, index) => {
      const ratingValue = index + 1;
      return (
        <button
          type="button"
          key={`form-star-${index}`}
          onClick={() => handleStarClick(ratingValue)}
          onMouseEnter={() => handleStarHover(ratingValue)}
          onMouseLeave={handleStarLeave}
          className="text-4xl focus:outline-none transition-transform hover:scale-110"
          aria-label={`Rate ${ratingValue} stars`}
        >
          <FaStar 
            color={ratingValue <= (hoverRating || formRating) ? "#FFD700" : "rgba(255,255,255,0.2)"}
            size={32}
          />
        </button>
      );
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    
    // Validation
    if (!formRating) {
      setSubmitError("Please select a rating");
      return;
    }
    
    try {
      const testimonialData = {
        name: formData.name,
        email: formData.email || undefined, // Don't send empty strings
        rating: formRating,
        message: formData.comment,
        service: formData.service,
        car: formData.car
      };
      
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testimonialData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show success message
        setFormSubmitted(true);
        
        // Reset form after submission
        setTimeout(() => {
          setFormData({
            name: "",
            email: "",
            car: "",
            service: "",
            comment: ""
          });
          setFormRating(0);
          setFormSubmitted(false);
        }, 5000); // Reset after 5 seconds
      } else {
        setSubmitError(result.error || "Failed to submit testimonial. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden" ref={pageRef}>
      {/* Animated Background Elements */}
      <div 
        className="absolute inset-0 opacity-30 z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 40%, rgba(76, 29, 149, 0.4) 0%, transparent 40%), 
                           radial-gradient(circle at 80% 60%, rgba(6, 182, 212, 0.4) 0%, transparent 40%),
                           radial-gradient(circle at 50% 20%, rgba(244, 63, 94, 0.2) 0%, transparent 30%)`,
          transform: `translate(${backgroundPosition.x}px, ${backgroundPosition.y}px)`
        }}
      />
      
      {/* Animated Particles */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 200 + 50}px`,
              height: `${Math.random() * 200 + 50}px`,
              background: `radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)`,
              animation: `float ${Math.random() * 20 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      
      {/* Elegant Header with Animated Background */}
      <header className="relative pt-32 pb-24 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isPageInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-block mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-bmw-blue to-bmw-darker-blue mx-auto flex items-center justify-center shadow-lg">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                    <FaQuoteLeft color="#1a3a5f" size={24} />
                  </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full animate-ping rounded-full bg-bmw-blue opacity-20" style={{ animationDuration: '3s' }}></div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-bmw-blue to-white mb-6">
              {language === 'es' ? 'Testimonios de Clientes' : 'Client Testimonials'}</h1>
            
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              {language === 'es' ? 'Descubra lo que nuestros valiosos clientes dicen sobre nuestros servicios' : 'Discover what our valued clients say about our services'}</p>
          </motion.div>
        </div>
      </header>

      {/* Main Testimonials Section */}
      <section 
        className="py-16 md:py-24 relative z-10"
        ref={testimonialsSectionRef}
      >
        <div className="container mx-auto px-6">
          {/* Testimonial Display */}
          <div className="relative max-w-4xl mx-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] rounded-2xl bg-gradient-to-br from-bmw-darker-blue to-bmw-blue p-10">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-white text-xl font-medium">Loading testimonials...</p>
              </div>
            ) : testimonials.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] rounded-2xl bg-gradient-to-br from-bmw-darker-blue to-bmw-blue p-10">
                <FaQuoteLeft color="rgba(255,255,255,0.3)" size={40} className="mb-6" />
                <p className="text-white text-xl font-medium text-center">
                  No testimonials yet. Be the first to share your experience!
                </p>
              </div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`testimonial-${activeIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className={`rounded-2xl shadow-xl p-10 md:p-14 bg-gradient-to-br ${testimonials[activeIndex].color} relative overflow-hidden`}
                  >
                    {/* Glass effect overlay */}
                    <div className="absolute inset-0 backdrop-blur-sm bg-white/5"></div>
                    
                    {/* Pattern overlay */}
                    <div className="absolute inset-0 opacity-10 mix-blend-overlay" 
                         style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }}>
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 bg-white/10 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/3 blur-md"></div>
                    <div className="absolute bottom-0 left-0 bg-white/10 w-24 h-24 rounded-full translate-y-1/2 -translate-x-1/3 blur-md"></div>
                    
                    {/* Animated light beam */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute w-1/4 h-full bg-white/10 blur-3xl -skew-x-12 animate-beam"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="relative text-white">
                      <div className="mb-8">
                        <FaQuoteLeft color={t('testimonials.rgba25525525503')} size={40} />
                      </div>
                      
                      <p className="text-xl md:text-2xl font-medium leading-relaxed mb-12">
                        "{testimonials[activeIndex].message}"
                      </p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div className="mb-6 sm:mb-0">
                          <h3 className="text-2xl font-bold">
                            {testimonials[activeIndex].name}
                          </h3>
                          <p className="text-white/80 mt-1">
                            {testimonials[activeIndex].car}
                          </p>
                          <div className="flex mt-2">
                            {renderStars(testimonials[activeIndex].rating)}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-sm border-t sm:border-t-0 sm:border-l border-white/20 pt-4 sm:pt-0 sm:pl-8">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm">
                            <span className="font-medium">{testimonials[activeIndex].formattedDate?.charAt(0) || "N"}</span>
                          </div>
                          <div className="ml-3">
                            <div className="font-medium">{testimonials[activeIndex].formattedDate || "Recent"}</div>
                            <div className="opacity-70 text-sm">{testimonials[activeIndex].role || "Verified Customer"}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
                
                {/* Navigation Controls - Outside the testimonial card */}
                <div className="flex justify-between items-center mt-10">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={goToPrev}
                      className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md shadow-lg flex items-center justify-center text-white hover:bg-bmw-blue hover:text-white transition-all duration-300 transform hover:scale-110"
                      aria-label={t('testimonials.previous.testimonial')}
                    >
                      <FaChevronLeft size={18} />
                    </button>
                    <button
                      onClick={goToNext}
                      className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md shadow-lg flex items-center justify-center text-white hover:bg-bmw-blue hover:text-white transition-all duration-300 transform hover:scale-110"
                      aria-label={t('testimonials.next.testimonial')}
                    >
                      <FaChevronRight size={18} />
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToIndex(index)}
                        className={`transition-all duration-300 ${
                          activeIndex === index
                            ? "w-8 h-3 bg-bmw-blue rounded-full"
                            : "w-3 h-3 bg-white/20 hover:bg-white/40 rounded-full"
                        }`}
                        aria-label={`Go to testimonial ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* Review Form Section */}
      <section 
        className="py-20 relative z-10"
        ref={formSectionRef}
      >
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isFormSectionInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-bmw-blue to-white">
                  {language === 'es' ? 'Su Experiencia' : 'Your Experience'}</span>
              </h2>
              <p className="text-gray-300 text-lg">
                {language === 'es' ? 'Valoramos sus comentarios' : 'We value your feedback'}</p>
            </div>
            
            {/* Success Message */}
            <AnimatePresence>
              {formSubmitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-10 text-center z-20"
                >
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{t('testimonials.thank.you')}</h3>
                  <p className="text-white/90 text-lg mb-8">{t('testimonials.your.review.has.been')}</p>
                  <p className="text-white/80">{t('testimonials.we.appreciate.your.f')}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Form Card */}
            <div className="relative rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
              {/* Decorative background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-bmw-darker-blue/90 to-gray-900/90"></div>
              <div className="absolute inset-0 opacity-5 mix-blend-overlay"
                   style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'30\' height=\'30\' viewBox=\'0 0 30 30\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M15 0C6.716 0 0 6.716 0 15c0 8.284 6.716 15 15 15 8.284 0 15-6.716 15-15 0-8.284-6.716-15-15-15zm0 2c7.18 0 13 5.82 13 13s-5.82 13-13 13S2 22.18 2 15 7.82 2 15 2z\' fill=\'%23FFFFFF\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}>
              </div>
              
              {/* Animated light effect */}
              <div className="absolute -inset-40 bg-bmw-blue opacity-5 animate-pulse rounded-full blur-3xl"></div>
              
              {/* Form Content */}
              <form onSubmit={handleSubmit} className="relative p-8 md:p-10 z-10">
                {/* Error Message */}
                {submitError && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-white">
                    <p className="font-medium">{submitError}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label htmlFor="name" className="block text-white font-medium mb-2">
                      {language === 'es' ? 'Su Nombre' : 'Your Name'}</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-bmw-blue focus:border-transparent transition-colors"
                      placeholder={language === 'es' ? 'Su Nombre' : 'Your Name'}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-white font-medium mb-2">
                      {language === 'es' ? 'Correo Electrónico (Opcional)' : 'Email (Optional)'}</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-bmw-blue focus:border-transparent transition-colors"
                      placeholder={language === 'es' ? 'Su Correo Electrónico' : 'Your Email'}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="car" className="block text-white font-medium mb-2">
                      {language === 'es' ? 'Su Vehículo' : 'Your Vehicle'}</label>
                    <input
                      type="text"
                      id="car"
                      name="car"
                      value={formData.car}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-bmw-blue focus:border-transparent transition-colors"
                      placeholder={language === 'es' ? 'Marca y Modelo' : 'Make and Model'}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="service" className="block text-white font-medium mb-2">
                      {language === 'es' ? 'Tipo de Servicio' : 'Service Type'}</label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-bmw-blue focus:border-transparent transition-colors appearance-none"
                    >
                      <option value="" disabled className="bg-gray-800">
                        {language === 'es' ? 'Seleccione un servicio' : 'Select a service'}</option>
                      {serviceOptions.map((service, index) => (
                        <option key={index} value={service} className="bg-gray-800">
                          {language === 'es' ? translateService(service) : service}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mb-8">
                  <label htmlFor="rating" className="block text-white font-medium mb-3">
                    {language === 'es' ? 'Su Calificación' : 'Your Rating'}</label>
                  <div className="flex gap-2">
                    {renderFormStars()}
                  </div>
                  {/* Show a subtle message if rating is not selected */}
                  {formRating === 0 && (
                    <p className="text-white/50 text-sm mt-2">
                      {language === 'es' ? 'Por favor seleccione una calificación' : 'Please select a rating'}
                    </p>
                  )}
                </div>
                
                <div className="mb-8">
                  <label htmlFor="comment" className="block text-white font-medium mb-2">
                    {language === 'es' ? 'Su Reseña' : 'Your Review'}</label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-bmw-blue focus:border-transparent transition-colors resize-none"
                    placeholder={language === 'es' ? 'Comparta su experiencia con nuestros servicios...' : 'Share your experience with our services...'}
                  ></textarea>
                </div>
                
                <div className="text-center">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-bmw-blue to-bmw-darker-blue text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-bmw-blue/50 focus:ring-offset-2 focus:ring-offset-gray-900"
                  >
                    <span className="flex items-center">
                      <FaPaperPlane size={16} />
                      <span className="ml-2">{language === 'es' ? 'Enviar Reseña' : 'Submit Review'}</span>
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Elegant CTA Section With 3D Effect */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isTestimonialsSectionInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-4xl mx-auto transform perspective-1000 rotateX-1 hover:rotateX-0 transition-transform duration-500"
          >
            <div className="relative bg-gradient-to-r from-bmw-darker-blue via-bmw-dark-blue to-bmw-darker-blue rounded-2xl overflow-hidden shadow-2xl">
              {/* 3D effect elements */}
              <div className="absolute inset-0 bg-[url('/images/textures/carbon-fiber.svg')] opacity-10"></div>
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              {/* Animated glow */}
              <div className="absolute -inset-40 bg-bmw-blue opacity-5 animate-pulse rounded-full blur-3xl"></div>
              
              {/* Content */}
              <div className="relative px-8 py-16 sm:px-16 text-center">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -translate-y-1/3 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full translate-y-1/3 -translate-x-1/3"></div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-bmw-blue to-white">
                    {language === 'es' ? 'Excelencia' : 'Excellence'}</span>
                </h2>
                <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
                  {language === 'es' ? 'Únase a nuestra creciente lista de clientes satisfechos' : 'Join our growing list of satisfied clients'}</p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link 
                    href="/contact"
                    className="group relative overflow-hidden inline-block px-10 py-5 bg-white text-bmw-darker-blue font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <span className="relative z-10">{language === 'es' ? 'Contáctenos' : 'Contact Us'}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-bmw-blue to-bmw-blue translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-bmw-blue to-bmw-blue blur-lg"></div>
                  </Link>
                  <Link 
                    href="/booking"
                    className="group relative overflow-hidden inline-block px-10 py-5 bg-transparent text-white font-bold rounded-lg border-2 border-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <span className="relative z-10">{language === 'es' ? 'Reservar Cita' : 'Book Appointment'}</span>
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Add keyframes for the animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        
        @keyframes beam {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }
        
        .animate-beam {
          animation: beam 8s ease-in-out infinite;
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .rotateX-1 {
          transform: rotateX(1deg);
        }
        
        .rotateX-0 {
          transform: rotateX(0);
        }
      `}} />
    </div>
  );
}

// Add this helper function at the top of the file
function translateService(service: string): string {
  const translations: { [key: string]: string } = {
    'Collision Repair': 'Reparación de Colisión',
    'Paint Correction': 'Corrección de Pintura',
    'Classic Restoration': 'Restauración de Clásicos',
    'Dent Removal': 'Eliminación de Abolladuras',
    'Custom Paint Job': 'Trabajo de Pintura Personalizado',
    'Vehicle Detailing': 'Detallado de Vehículos',
    'Wheel Repair': 'Reparación de Ruedas',
    'Interior Restoration': 'Restauración de Interiores',
    'Other': 'Otro'
  };
  return translations[service] || service;
} 