"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

// Gallery categories based on services offered
const categories = [
  { id: "all", name: "All Projects" },
  { id: "bf", name: "Before & After" },
  { id: "collision", name: "Collision Repair" },
  { id: "paint", name: "Custom Paint" },
  { id: "restoration", name: "Restoration" },
  { id: "detail", name: "Detailing" },
  { id: "bodywork", name: "Bodywork" },
];

// Gallery items with before/after images
const galleryItems = [
  {
    id: 1,
    title: "Thunderbird Classic Restoration",
    categories: ["restoration", "paint", "bf"],
    beforeImages: [
      "/images/gallery-page/thunderbird-restoration/before-1-thunderbird-front.jpg",
      "/images/gallery-page/thunderbird-restoration/before-1-thunderbird-side.jpg",
      "/images/gallery-page/thunderbird-restoration/before-1-thunderbird-rear.jpg",
    ],
    afterImages: [
      "/images/gallery-page/thunderbird-restoration/after-1-thunderbird-front.jpg",
      "/images/gallery-page/thunderbird-restoration/after-1-thunderbird-side.jpg",
      "/images/gallery-page/thunderbird-restoration/after-1-thunderbird-rear.jpg",
    ],
    mainImage: "/images/gallery-page/thunderbird-restoration/after-1-thunderbird-front.jpg",
    description: "Complete restoration of a classic Thunderbird, bringing back its original glory with meticulous attention to detail.",
    tags: ["Classic", "Restoration", "American", "Vintage", "Before/After"]
  },
  {
    id: 2,
    title: "Mercedes-Benz Green Luxury Repair",
    categories: ["bodywork", "paint", "bf"],
    beforeImages: [
      "/images/gallery-page/green-mercedes-repair/before-2-greenmercedes-front.jpg",
      "/images/gallery-page/green-mercedes-repair/before-2-greenmercedes-side.jpg",
    ],
    afterImages: [
      "/images/gallery-page/green-mercedes-repair/after-2-greenmercedes-front.jpg",
      "/images/gallery-page/green-mercedes-repair/after-2-greenmercedes-side.jpg",
    ],
    mainImage: "/images/gallery-page/green-mercedes-repair/after-2-greenmercedes-front.jpg",
    description: "Precision repair and refinishing of this luxury Mercedes-Benz, restoring its elegant green finish to showroom quality.",
    tags: ["Luxury", "European", "Repair", "Paint Correction", "Before/After"]
  },
  {
    id: 3,
    title: "Blue Alfa Romeo Front-End Repair",
    categories: ["collision", "bodywork", "bf"],
    beforeImages: [
      "/images/gallery-page/blue-alfa-repair/before-3-bluealfa-front.jpg",
    ],
    afterImages: [
      "/images/gallery-page/blue-alfa-repair/after-3-bluealfa-front.jpg",
    ],
    mainImage: "/images/gallery-page/blue-alfa-repair/after-3-bluealfa-front.jpg",
    description: "Front-end collision repair on this Italian sports car, perfectly matching the distinctive blue finish.",
    tags: ["Italian", "Sports Car", "Collision", "Color Match", "Before/After"]
  },
  {
    id: 4,
    title: "BMW E90 Complete Restoration",
    categories: ["restoration", "collision", "paint", "bf"],
    beforeImages: [
      "/images/gallery-page/bmw-e90-repair/before-4-BmwE90-front.jpg",
      "/images/gallery-page/bmw-e90-repair/before-4-BmwE90-side.jpg",
      "/images/gallery-page/bmw-e90-repair/before-4-BmwE90-interior.jpg",
    ],
    afterImages: [
      "/images/gallery-page/bmw-e90-repair/After-4-BmwE90-front.jpg",
      "/images/gallery-page/bmw-e90-repair/After-4-BmwE90-interior.jpg",
    ],
    mainImage: "/images/gallery-page/bmw-e90-repair/After-4-BmwE90-front.jpg",
    description: "Comprehensive restoration of a BMW E90, including exterior repair, interior refurbishment, and mechanical overhaul.",
    tags: ["German", "Luxury", "Complete Restoration", "Interior", "Before/After"]
  },
  {
    id: 5,
    title: "Red Cadillac Precision Repair",
    categories: ["bodywork", "paint", "bf"],
    beforeImages: [
      "/images/gallery-page/red-cadillac-repair/Before-5-redcadillac-front.jpg",
      "/images/gallery-page/red-cadillac-repair/Before-5-redcadillac-side.jpg",
    ],
    afterImages: [
      "/images/gallery-page/red-cadillac-repair/After-5-redcadillac-front.jpg",
      "/images/gallery-page/red-cadillac-repair/After-5-redcadillac-side.jpg",
    ],
    mainImage: "/images/gallery-page/red-cadillac-repair/After-5-redcadillac-front.jpg",
    description: "Meticulous repair and refinishing of this iconic American luxury vehicle, restoring its vibrant red finish.",
    tags: ["American", "Luxury", "Paint", "Bodywork", "Before/After"]
  },
  {
    id: 6,
    title: "Black Jeep Off-Road Vehicle Repair",
    categories: ["collision", "bodywork", "bf"],
    beforeImages: [
      "/images/gallery-page/black-jeep-repair/before-6-blackjeep-front.jpg",
      "/images/gallery-page/black-jeep-repair/before-6-blackjeep-side.jpg",
    ],
    afterImages: [
      "/images/gallery-page/black-jeep-repair/After-6-blackjeep-front.jpg",
      "/images/gallery-page/black-jeep-repair/after-6-blackjeep-side.jpg",
    ],
    mainImage: "/images/gallery-page/black-jeep-repair/After-6-blackjeep-front.jpg",
    description: "Structural and cosmetic repair of this rugged off-road vehicle, restoring both functionality and appearance.",
    tags: ["SUV", "Off-Road", "American", "Structural Repair", "Before/After"]
  },
  {
    id: 7,
    title: "Honda Accord Collision Recovery",
    categories: ["collision", "bodywork", "bf"],
    beforeImages: [
      "/images/gallery-page/honda-accord-repair/Before-7-hondaaccord-front.jpg",
    ],
    afterImages: [
      "/images/gallery-page/honda-accord-repair/After-7-hondaaccord-front.jpg",
    ],
    mainImage: "/images/gallery-page/honda-accord-repair/After-7-hondaaccord-front.jpg",
    description: "Complete collision repair on this popular sedan, restoring structural integrity and perfect panel alignment.",
    tags: ["Japanese", "Sedan", "Collision", "Daily Driver", "Before/After"]
  },
  {
    id: 8,
    title: "Blue Mustang Performance Car Repair",
    categories: ["restoration", "bodywork", "bf"],
    beforeImages: [
      "/images/gallery-page/blue-mustang-repair/Before-8-bluemustang-side.jpg",
    ],
    afterImages: [
      "/images/gallery-page/blue-mustang-repair/After-8-bluemustang-side.jpg",
      "/images/gallery-page/blue-mustang-repair/after-8-bluemustang-front.jpg",
    ],
    mainImage: "/images/gallery-page/blue-mustang-repair/after-8-bluemustang-front.jpg",
    description: "Restoration of this iconic American muscle car, featuring precise bodywork and a flawless blue finish.",
    tags: ["American", "Muscle Car", "Performance", "Iconic", "Before/After"]
  },
  {
    id: 9,
    title: "Blue Honda Accord Accident Recovery",
    categories: ["collision", "bodywork", "bf"],
    beforeImages: [
      "/images/gallery-page/blue-accord-repair/Before-9-blueaccord-side.jpg",
    ],
    afterImages: [
      "/images/gallery-page/blue-accord-repair/after-9-blueaccord-side.jpg",
      "/images/gallery-page/blue-accord-repair/after-9-blueaccord-front.jpg",
    ],
    mainImage: "/images/gallery-page/blue-accord-repair/after-9-blueaccord-front.jpg",
    description: "Comprehensive accident repair returning this family sedan to pre-accident condition with perfect panel alignment.",
    tags: ["Japanese", "Sedan", "Accident", "Family Car", "Before/After"]
  },
  {
    id: 10,
    title: "Mercedes-Benz Complete Repaint",
    categories: ["paint", "bf"],
    beforeImages: [
      "/images/gallery-page/mercedes-repaint/before-10-mercedesrepaint-front.jpg",
      "/images/gallery-page/mercedes-repaint/before-10-mercedesrepaint-side.jpg",
    ],
    afterImages: [
      "/images/gallery-page/mercedes-repaint/Front-10-mercedesrepaint-front.jpg",
    ],
    mainImage: "/images/gallery-page/mercedes-repaint/Front-10-mercedesrepaint-front.jpg",
    description: "Full vehicle repaint on this luxury Mercedes, delivering a flawless finish that enhances the car's elegant lines.",
    tags: ["German", "Luxury", "Paint", "Color Change", "Before/After"]
  },
  {
    id: 11,
    title: "Porsche Detail and Refinishing",
    categories: ["detail", "paint"],
    beforeImages: [],
    afterImages: [
      "/images/gallery-page/porsche-detail/After-11-porschedetail-front.jpg",
      "/images/gallery-page/porsche-detail/After-11-porschedetail-side.jpg",
    ],
    mainImage: "/images/gallery-page/porsche-detail/After-11-porschedetail-side.jpg",
    description: "Professional detailing and paint correction on this high-performance Porsche, revealing its true brilliance.",
    tags: ["German", "Sports Car", "Detail", "Paint Correction", "After"]
  },
  {
    id: 12,
    title: "Classic Mustang Complete Rebuild",
    categories: ["restoration", "bodywork", "bf"],
    beforeImages: [
      "/images/gallery-page/mustang-rebuild/before-12mustangrebuild-front.jpg",
      "/images/gallery-page/mustang-rebuild/before-12-mustangrebuild-side.jpg",
    ],
    afterImages: [
      "/images/gallery-page/mustang-rebuild/after-12-mustangrebuild-front.jpg",
      "/images/gallery-page/mustang-rebuild/after-12-mustangrebuild-side.jpg",
    ],
    mainImage: "/images/gallery-page/mustang-rebuild/after-12-mustangrebuild-front.jpg",
    description: "Frame-off restoration of this American classic, including mechanical rebuilding and authentic detailing.",
    tags: ["American", "Classic", "Rebuild", "Restoration", "Before/After"]
  },
  {
    id: 13,
    title: "Mercedes SL550 Premium Repaint",
    categories: ["paint"],
    beforeImages: [],
    afterImages: [
      "/images/gallery-page/mercedes-sl550-repaint/After-13-mercedessl550repaint-side.jpg",
      "/images/gallery-page/mercedes-sl550-repaint/After-13-mercedessl550repaint-front.jpg",
      "/images/gallery-page/mercedes-sl550-repaint/After-13-mercedessl550repaint-rear.jpg",
    ],
    mainImage: "/images/gallery-page/mercedes-sl550-repaint/After-13-mercedessl550repaint-front.jpg",
    description: "Precision repaint of this luxury convertible, delivering a mirror-like finish worthy of this premium vehicle.",
    tags: ["German", "Convertible", "Luxury", "Paint", "After"]
  },
  {
    id: 14,
    title: "Jaguar Exotic Car Repaint",
    categories: ["paint", "bf"],
    beforeImages: [
      "/images/gallery-page/jaguar-repaint/Before-14-Jaguarrepaint-front.jpg",
      "/images/gallery-page/jaguar-repaint/Before-14-Jaguarrepaint-side.jpg",
      "/images/gallery-page/jaguar-repaint/Before-14-Jaguarrepaint-back.jpg",
    ],
    afterImages: [
      "/images/gallery-page/jaguar-repaint/after-14-Jaguarrepaint-front.jpg",
      "/images/gallery-page/jaguar-repaint/after-14-Jaguarrepaint-side.jpg",
      "/images/gallery-page/jaguar-repaint/after-14-Jaguarrepaint-back.jpg",
    ],
    mainImage: "/images/gallery-page/jaguar-repaint/after-14-Jaguarrepaint-front.jpg",
    description: "Complete repaint of this British luxury vehicle, restoring its elegant appearance with a flawless finish.",
    tags: ["British", "Exotic", "Luxury", "Paint", "Before/After"]
  },
];

export default function GalleryPage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<null | number>(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [mainImageType, setMainImageType] = useState<"before" | "after">("after");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Handle image loading errors
  const handleImageError = (path: string) => {
    console.error(`Failed to load image: ${path}`);
    setImageErrors(prev => ({
      ...prev,
      [path]: true
    }));
  };

  // Filter gallery items based on active category
  const filteredItems = activeCategory === "all" 
    ? galleryItems 
    : activeCategory === "bf"
      ? galleryItems.filter(item => item.beforeImages.length > 0)
      : galleryItems.filter(item => item.categories.includes(activeCategory));

  // Function to handle thumbnails click - swap with main image
  const handleThumbnailClick = (index: number, type: "before" | "after") => {
    setMainImageIndex(index);
    setMainImageType(type);
  };

  // Reset main image when selected item changes
  useEffect(() => {
    // Default to first after image when opening modal
    setMainImageIndex(0);
    setMainImageType("after");
  }, [selectedItem]);

  // Get current item data more efficiently
  const currentItem = selectedItem ? galleryItems.find(item => item.id === selectedItem) : null;
  
  // Prepare combined image arrays for the current item
  const allBeforeImages = currentItem?.beforeImages || [];
  const allAfterImages = currentItem?.afterImages || [];
  
  // Get the current main image based on type and index
  const mainImage = mainImageType === "before" 
    ? allBeforeImages[mainImageIndex] || "" 
    : allAfterImages[mainImageIndex] || "";

  return (
    <div className="pt-24 pb-20" ref={ref}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold mb-6 text-shadow"
            >
              Project <span className="text-primary">Gallery</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-600 mb-8"
            >
              Explore our portfolio of transformation projects. From collision repairs to custom paint jobs and classic 
              restorations, our work showcases our commitment to excellence and attention to detail.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20">
        <div className="container">
          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center mb-12 gap-2"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105 ${
                  activeCategory === category.id
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </motion.div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * (index % 6) + 0.4 }}
                className="card group cursor-pointer overflow-hidden rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                onClick={() => setSelectedItem(item.id)}
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={item.mainImage}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={() => handleImageError(item.mainImage)}
                    priority={index < 6}
                  />
                  {imageErrors[item.mainImage] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <span className="text-gray-500">Image unavailable</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-bold text-xl text-white text-shadow mb-1">{item.title}</h3>
                    <p className="text-white/90 text-shadow-sm text-sm line-clamp-2">{item.description}</p>
                  </div>
                  <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                    {item.beforeImages.length > 0 && (
                      <span className="bg-primary px-3 py-1 text-white text-xs font-semibold rounded-full shadow-md">
                        Before/After
                      </span>
                    )}
                    {item.beforeImages.length === 0 && (
                      <span className="bg-gray-800/80 px-3 py-1 text-white text-xs font-semibold rounded-full shadow-md">
                        After
                      </span>
                    )}
                    {item.categories.filter(cat => cat !== "bf")[0] && (
                      <span className="bg-black/60 px-3 py-1 text-white text-xs font-semibold rounded-full shadow-md">
                        {categories.find(cat => cat.id === item.categories.filter(c => c !== "bf")[0])?.name}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                No items found in this category. Please try another filter.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Modal for gallery view */}
      {selectedItem && currentItem && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-2xl">
                {currentItem.title}
              </h3>
              <button 
                className="text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => setSelectedItem(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Single Main Image Viewer */}
            <div className="relative h-[60vh] bg-gray-900">
              <div className="relative h-full flex items-center justify-center">
                <Image
                  src={mainImage}
                  alt={`${mainImageType === "before" ? "Before" : "After"}: ${currentItem.title}`}
                  fill
                  className="object-contain"
                  onError={() => handleImageError(mainImage)}
                  priority
                />
                {imageErrors[mainImage] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <span className="text-white">Image unavailable</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 z-30 bg-black bg-opacity-80 text-white px-4 py-2 rounded-md text-sm font-medium tracking-wider">
                  {mainImageType === "before" ? "BEFORE" : "AFTER"}
                </div>
              </div>
            </div>

            {/* Combined Before/After Thumbnails */}
            <div className="p-4 bg-gray-100">
              {/* Label for Before Images */}
              {allBeforeImages.length > 0 && (
                <div className="mb-2">
                  <span className="text-sm font-semibold text-gray-700 px-2 py-1 bg-gray-200 rounded-md">
                    Before Images
                  </span>
                </div>
              )}
              
              {/* Before Image Thumbnails */}
              {allBeforeImages.length > 0 && (
                <div className="flex overflow-x-auto space-x-2 mb-4">
                  {allBeforeImages.map((image, index) => (
                    <div 
                      key={`before-${index}`}
                      className={`relative w-24 h-24 flex-shrink-0 cursor-pointer rounded-md overflow-hidden transition-all duration-200 ${
                        mainImageType === "before" && mainImageIndex === index 
                          ? "ring-4 ring-primary transform scale-105" 
                          : "hover:ring-2 hover:ring-primary/50 hover:scale-105"
                      }`}
                      onClick={() => handleThumbnailClick(index, "before")}
                    >
                      <Image
                        src={image}
                        alt={`Before ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={() => handleImageError(image)}
                      />
                      {imageErrors[image] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                          <span className="text-xs text-gray-500">Image unavailable</span>
                        </div>
                      )}
                      <div className="absolute top-0 left-0 px-1 py-0.5 text-[10px] font-medium bg-black/70 text-white">
                        Before
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Label for After Images */}
              <div className="mb-2">
                <span className="text-sm font-semibold text-gray-700 px-2 py-1 bg-gray-200 rounded-md">
                  After Images
                </span>
              </div>
              
              {/* After Image Thumbnails */}
              <div className="flex overflow-x-auto space-x-2">
                {allAfterImages.map((image, index) => (
                  <div 
                    key={`after-${index}`}
                    className={`relative w-24 h-24 flex-shrink-0 cursor-pointer rounded-md overflow-hidden transition-all duration-200 ${
                      mainImageType === "after" && mainImageIndex === index 
                        ? "ring-4 ring-primary transform scale-105" 
                        : "hover:ring-2 hover:ring-primary/50 hover:scale-105"
                    }`}
                    onClick={() => handleThumbnailClick(index, "after")}
                  >
                    <Image
                      src={image}
                      alt={`After ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={() => handleImageError(image)}
                    />
                    {imageErrors[image] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <span className="text-xs text-gray-500">Image unavailable</span>
                      </div>
                    )}
                    <div className="absolute top-0 left-0 px-1 py-0.5 text-[10px] font-medium bg-primary/90 text-white">
                      After
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4 leading-relaxed">
                {currentItem.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {currentItem.tags.map((tag, i) => (
                  <span key={i} className="inline-block px-3 py-1 bg-gray-100 text-primary text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <div className="text-gray-600">
                  <span className="font-semibold">Service Categories:</span>{" "}
                  {currentItem.categories
                    .filter(cat => cat !== "bf")
                    .map(cat => categories.find(c => c.id === cat)?.name)
                    .join(", ")}
                </div>
                <button 
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transform transition-all duration-200 hover:scale-105 shadow hover:shadow-lg"
                  onClick={() => setSelectedItem(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 