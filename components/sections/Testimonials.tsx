"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "../../utils/LanguageContext";

// Testimonial data - Using verified reviews only
const testimonials = [
  {
    id: 1,
    nameKey: "John D.",
    roleKey: "Verified Yelp Review",
    image: "/images/homepage/testimonials/testimonial-1.svg",
    rating: 5,
    commentKey:
      "Oscar and his team are amazing! They fixed my car after a bad accident and it looks brand new. The attention to detail and quality of work is outstanding. I highly recommend CA International Automotive for any auto body work.",
    carKey: "Tesla Model S",
    serviceKey: "Collision Repair",
  },
  {
    id: 2,
    nameKey: "Maria L.",
    roleKey: "Verified Yelp Review",
    image: "/images/homepage/testimonials/testimonial-2.svg",
    rating: 5,
    commentKey:
      "I had a great experience with CA International Automotive. They repaired my Mercedes after a fender bender and did an excellent job matching the paint. Oscar was very professional and kept me updated throughout the process. The price was fair and the work was completed on time. Will definitely return for any future needs!",
    carKey: "Mercedes-Benz",
    serviceKey: "Paint Correction",
  },
  {
    id: 3,
    nameKey: "Carlos M.",
    roleKey: "Verified Facebook Review",
    image: "/images/homepage/testimonials/testimonial-3.svg",
    rating: 5,
    commentKey:
      "Oscar at CA International Automotive is a true professional. He restored my classic car to better than new condition. His knowledge and craftsmanship are exceptional. I couldn't be happier with the results!",
    carKey: "Classic Car",
    serviceKey: "Classic Restoration",
  },
];

export default function Testimonials() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [activeIndex, setActiveIndex] = useState(0);

  // Stars for rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <svg
        key={index}
        className={`h-5 w-5 ${
          index < rating ? "text-gold" : "text-gray-300"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <section className="py-20 bg-gray-50" id="testimonials" ref={ref}>
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="section-title"
          >
            {t('testimonials.title')} <span className="text-primary">{t('testimonials.subtitle')}</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="section-subtitle"
          >
            {t('testimonials.description')}
          </motion.p>
        </div>

        {/* Testimonial Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === activeIndex
                    ? "bg-primary w-10"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`${t('testimonials.viewTestimonial')} ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white rounded-lg shadow-car p-8">
            <div className="flex items-center mb-6">
              <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-primary">
                <Image
                  src={testimonials[activeIndex].image}
                  alt={testimonials[activeIndex].nameKey}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-xl">{testimonials[activeIndex].nameKey}</h3>
                <p className="text-gray-500">{testimonials[activeIndex].roleKey}</p>
                <div className="flex mt-1">{renderStars(testimonials[activeIndex].rating)}</div>
              </div>
            </div>
            <p className="text-gray-600 italic text-lg mb-6">
              "{testimonials[activeIndex].commentKey}"
            </p>
            <div className="pt-4 border-t border-gray-100 flex justify-between text-sm">
              <div className="text-primary font-medium">
                {testimonials[activeIndex].carKey}
              </div>
              <div className="text-gray-500">{testimonials[activeIndex].serviceKey}</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link href="/testimonials" className="btn btn-outline">
            {t('testimonials.readMore')}
          </Link>
        </motion.div>
      </div>
    </section>
  );
} 