"use client";

import Hero from "./sections/Hero";
import Services from "./sections/Services";
import BeforeAfter from "./sections/BeforeAfter";
import Testimonials from "./sections/Testimonials";
import Contact from "./sections/Contact";
import FeaturedCars from "./sections/FeaturedCars";
import { useLanguage } from "../utils/LanguageContext";
import PageTransition from "./ui/PageTransition";

export function HomeClient() {
  const { t } = useLanguage();
  
  return (
    <PageTransition>
      <main>
        <Hero />
        <Services />
        <FeaturedCars />
        <BeforeAfter />
        <Testimonials />
        <Contact />
      </main>
    </PageTransition>
  );
} 