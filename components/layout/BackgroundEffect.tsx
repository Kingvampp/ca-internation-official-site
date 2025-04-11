"use client";

import React from "react";
import { motion } from "framer-motion";

export default function BackgroundEffect() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Main dark blue background */}
      <div className="absolute inset-0 bg-bmw-dark-blue"></div>
      
      {/* Diagonal BMW stripes - continuous across the entire page */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute -left-[10%] top-0 bottom-0 w-[120%] transform -skew-x-12">
          <div className="h-full w-full bg-diagonal-stripes opacity-10"></div>
        </div>
      </div>
      
      {/* Subtle carbon fiber texture overlay */}
      <div className="absolute inset-0 bg-carbon-fiber opacity-5"></div>
      
      {/* Floating automotive elements - reduced animations */}
      <div className="absolute w-full h-full">
        {/* Speed lines - left side */}
        <motion.div 
          className="absolute left-0 h-[300%] w-1 bg-bmw-blue/20"
          initial={{ y: "-100%", x: "10vw", rotate: 45 }}
          animate={{ y: "100%" }}
          transition={{ 
            repeat: Infinity, 
            duration: 12,
            ease: "linear",
            repeatType: "loop"
          }}
        />
        
        {/* Speed lines - right side */}
        <motion.div 
          className="absolute right-0 h-[300%] w-1 bg-bmw-red/20"
          initial={{ y: "-150%", x: "-15vw", rotate: 45 }}
          animate={{ y: "100%" }}
          transition={{ 
            repeat: Infinity, 
            duration: 14,
            ease: "linear",
            delay: 2,
            repeatType: "loop"
          }}
        />
        
        {/* Speed lines - middle */}
        <motion.div 
          className="absolute left-1/2 h-[300%] w-2 bg-bmw-blue/10"
          initial={{ y: "-120%", x: "0", rotate: 45 }}
          animate={{ y: "100%" }}
          transition={{ 
            repeat: Infinity, 
            duration: 7,
            ease: "linear",
            delay: 1,
            repeatType: "loop"
          }}
        />
        
        {/* Racing circles - light blue */}
        <motion.div 
          className="absolute w-48 h-48 rounded-full border-4 border-bmw-blue/10 hidden md:block"
          initial={{ x: "-20vw", y: "10vh", scale: 0.5, opacity: 0 }}
          animate={{ 
            x: "120vw", 
            y: "70vh",
            scale: 1.5,
            opacity: [0, 0.3, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 35,
            ease: "easeInOut",
            delay: 0,
            repeatType: "loop",
            times: [0, 0.5, 1]
          }}
        />
        
        {/* Racing circles - red */}
        <motion.div 
          className="absolute w-64 h-64 rounded-full border-4 border-bmw-red/10 hidden md:block"
          initial={{ x: "120vw", y: "80vh", scale: 0.5, opacity: 0 }}
          animate={{ 
            x: "-20vw", 
            y: "20vh",
            scale: 2,
            opacity: [0, 0.5, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 25,
            ease: "easeInOut",
            delay: 12,
            repeatType: "loop",
            times: [0, 0.5, 1]
          }}
        />
      </div>
      
      {/* Racing stripe at the very top of the page */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-racing-stripe z-5"></div>
      
      {/* Racing stripe at the very bottom of the page */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-racing-stripe z-5"></div>
    </div>
  );
} 