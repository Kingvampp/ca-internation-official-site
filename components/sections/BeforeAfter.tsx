"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "../../utils/LanguageContext";

// Array of before/after image pairs
const projects = [
  {
    id: 1,
    titleKey: "beforeAfter.projects.bmw.title",
    descriptionKey: "beforeAfter.projects.bmw.description",
    before: "/images/homepage/beforeafter/before-4-BmwE90-side(2).jpg",
    after: "/images/homepage/beforeafter/After-4-BmwE90-side.jpg",
    category: "collision",
    categoryKey: "services.collision"
  },
  {
    id: 2,
    titleKey: "beforeAfter.projects.mercedes.title",
    descriptionKey: "beforeAfter.projects.mercedes.description",
    before: "/images/homepage/beforeafter/before-2- green mercedes.jpg",
    after: "/images/homepage/beforeafter/after-2-greenmercedes-side.jpg",
    category: "paint",
    categoryKey: "services.paint"
  },
  {
    id: 3,
    titleKey: "beforeAfter.projects.alfa.title",
    descriptionKey: "beforeAfter.projects.alfa.description",
    before: "/images/homepage/beforeafter/before-3-bluealfa-front.jpg",
    after: "/images/homepage/beforeafter/after-3-bluealfa-front.jpg",
    category: "restoration",
    categoryKey: "services.restoration"
  },
];

export default function BeforeAfter() {
  const { t, language } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [sliderPosition, setSliderPosition] = useState(50);

  // Add debug logging
  useEffect(() => {
    console.log('🔄 [BeforeAfter] Current language:', language);
    projects.forEach(project => {
      const translation = t(project.categoryKey);
      console.log(`🔄 [BeforeAfter] Translation for ${project.categoryKey}:`, translation);
    });
  }, [language, t]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <section className="py-20 bg-gradient-to-b from-bmw-dark-blue to-black text-white relative" id="transformations">
      {/* Racing stripe accent at top */}
      <div className="absolute top-0 left-0 right-0 flex h-2">
        <div className="w-1/3 bg-bmw-blue"></div>
        <div className="w-1/3 bg-white/60"></div>
        <div className="w-1/3 bg-bmw-red"></div>
      </div>
      
      {/* Carbon fiber texture overlay */}
      <div className="absolute inset-0 bg-carbon-fiber opacity-5"></div>
      
      <div className="container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold mb-4"
          >
            {t('beforeAfter.title')} <span className="text-bmw-blue">{t('beforeAfter.subtitle')}</span>
          </motion.h2>
          <div className="w-24 h-1 bg-bmw-red mx-auto mb-6"></div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-300"
          >
            {t('common.see.the.bef')}
          </motion.p>
        </div>

        <div ref={ref} className="max-w-5xl mx-auto">
          {/* Project tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white/10 backdrop-blur-sm p-1 rounded-lg shadow-lg">
              {projects.map((project, index) => (
                <button
                  key={project.id}
                  onClick={() => setActiveIndex(index)}
                  className={`px-5 py-2 rounded-md transition-all ${
                    activeIndex === index
                      ? index === 0 
                        ? "bg-bmw-blue text-white" 
                        : index === 1 
                          ? "bg-bmw-red text-white" 
                          : "bg-white text-bmw-dark-blue"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {t(project.categoryKey)}
                </button>
              ))}
            </div>
          </div>

          {/* Before/After slider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative rounded-xl overflow-hidden aspect-video shadow-2xl border border-white/10"
          >
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={projects[activeIndex].before}
                alt={`${t('beforeAfter.beforeLabel')} ${projects[activeIndex].titleKey}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
            >
              <Image
                src={projects[activeIndex].after}
                alt={`${t('beforeAfter.afterLabel')} ${projects[activeIndex].titleKey}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Slider control */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div 
                className="absolute h-full w-0.5 bg-white pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              ></div>
              <div
                className="absolute w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center pointer-events-auto cursor-ew-resize transform transition-transform hover:scale-110"
                style={{ left: `calc(${sliderPosition}% - 24px)` }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-bmw-blue"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
            </div>

            <input
              type="range"
              min="1"
              max="99"
              value={sliderPosition}
              onChange={handleSliderChange}
              className="absolute w-full h-full opacity-0 cursor-ew-resize"
            />

            {/* Before/After labels */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white py-1 px-3 rounded-md font-medium">
              {t('beforeAfter.beforeLabel')}
            </div>
            <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white py-1 px-3 rounded-md font-medium">
              {t('beforeAfter.afterLabel')}
            </div>
          </motion.div>

          {/* Project info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-white/10"
          >
            <h3 className="text-2xl font-bold mb-3">{t(projects[activeIndex].titleKey)}</h3>
            <p className="text-gray-300 mb-5 text-lg">{t(projects[activeIndex].descriptionKey)}</p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center">
                <span className={`font-semibold mr-2 ${
                  activeIndex === 0 
                    ? "text-bmw-blue" 
                    : activeIndex === 1 
                      ? "text-bmw-red" 
                      : "text-white"
                }`}>{t('common.type')}</span>
                <span className="bg-black/30 px-3 py-1 rounded-full text-sm">{t(projects[activeIndex].categoryKey)}</span>
              </div>
              <Link href="/gallery" className="relative overflow-hidden group bg-bmw-blue hover:bg-bmw-darker-blue text-white py-2 px-6 rounded-full transition-all duration-300 inline-flex items-center">
                <span className="relative z-10">{t('beforeAfter.viewMore')}</span>
                <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-bmw-blue via-white to-bmw-red group-hover:h-full opacity-0 group-hover:opacity-20 transition-all duration-300"></span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Racing stripe accent at bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex h-2">
        <div className="w-1/3 bg-bmw-red"></div>
        <div className="w-1/3 bg-white/60"></div>
        <div className="w-1/3 bg-bmw-blue"></div>
      </div>
    </section>
  );
} 