/**
 * Training data for the CA International Autobody AI Chatbot
 * This data is used to provide the AI with context about the business,
 * services, and processes
 */

export const trainingData = {
  companyInfo: {
    name: "CA International Autobody",
    description: "Premier auto body shop in San Francisco with over 20 years of experience specializing in high-end and luxury vehicle repairs.",
    founded: 1998,
    location: "San Francisco, CA",
    serviceArea: "San Francisco and the Bay Area",
    specialties: ["Mercedes-Benz certified specialists", "Luxury vehicle repairs", "Classic car restoration"],
    certifications: ["Mercedes-Benz Certified", "I-CAR Gold Class", "ASE Certified Technicians"],
  },
  
  services: [
    {
      name: "Collision Repair",
      description: "Expert collision repair services for all makes and models. We restore your vehicle to pre-accident condition with precision and care.",
      details: "Our certified technicians use state-of-the-art equipment to ensure structural integrity and safety. We handle everything from minor dents to major collision damage."
    },
    {
      name: "Paint Services",
      description: "Premium paint services with color matching technology. Our expert painters deliver flawless finishes for both repairs and custom work.",
      details: "We use computerized color matching systems to ensure perfect matches to your vehicle's original paint. Our climate-controlled paint booths ensure a dust-free, perfect finish."
    },
    {
      name: "Frame Straightening",
      description: "Precision frame straightening to restore your vehicle's structural integrity after an accident.",
      details: "Using computer-measured frame alignment systems, we can restore your vehicle's frame to factory specifications, ensuring proper handling and safety."
    },
    {
      name: "Paintless Dent Repair",
      description: "Remove dents without affecting your vehicle's factory finish, saving time and money.",
      details: "Our technicians can remove many dents without damaging your vehicle's paint, preserving the original finish and eliminating the need for repainting."
    },
    {
      name: "Classic Car Restoration",
      description: "Bring your classic back to its original glory with our meticulous restoration services.",
      details: "From partial to complete restorations, we have the expertise to restore classic vehicles to their original specifications or customize them to your preferences."
    },
    {
      name: "Custom Modifications",
      description: "Personalize your vehicle with custom body kits, paint, and performance upgrades.",
      details: "We can help you create a unique look for your vehicle with custom body modifications, specialty paint finishes, and performance enhancements."
    }
  ],
  
  bookingProcess: {
    methods: ["Online through website", "Phone call", "In-person visit"],
    onlineSteps: [
      "Visit the booking page on our website",
      "Fill out the form with vehicle details, service needed, and preferred date/time",
      "Submit the form and wait for confirmation",
      "Receive confirmation via email or phone"
    ],
    requiredInfo: [
      "Vehicle make, model, and year",
      "Service(s) needed",
      "Preferred appointment date and time",
      "Contact information",
      "Insurance information (if applicable)"
    ],
    timeframes: "We typically respond to booking requests within 24 hours on business days.",
    cancelPolicy: "Appointments can be canceled or rescheduled up to 24 hours in advance with no fee."
  },
  
  insuranceProcess: {
    steps: [
      "File a claim with your insurance company after an incident",
      "Obtain an estimate from your insurance company",
      "Bring your vehicle and the insurance estimate to our shop",
      "We'll inspect the vehicle and communicate with the insurance company if necessary",
      "Once approved, repairs can begin",
      "We handle direct billing with most insurance companies"
    ],
    acceptedInsurance: "We work with all major insurance companies, including State Farm, Geico, Allstate, Progressive, USAA, Farmers, and many more.",
    deductibles: "You are responsible for paying your deductible directly to us before the vehicle is released.",
    supplements: "If additional damage is found during repairs, we work directly with your insurance to approve supplemental repairs."
  },
  
  faq: [
    {
      question: "How long will repairs take?",
      answer: "Repair time varies based on the extent of damage and parts availability. Minor repairs may take 2-3 days, while major collision repairs could take 1-2 weeks. We provide a time estimate before beginning work."
    },
    {
      question: "Do you provide rental cars?",
      answer: "We don't provide rental cars directly, but we can help arrange a rental through your insurance company or our partnership with Enterprise Rent-A-Car."
    },
    {
      question: "Is your work guaranteed?",
      answer: "Yes, all our repairs come with a lifetime warranty for as long as you own the vehicle."
    },
    {
      question: "Do I need an appointment for an estimate?",
      answer: "While walk-ins are welcome for estimates, scheduling an appointment ensures our estimator can give you their full attention."
    },
    {
      question: "Can I get updates on my repair?",
      answer: "Yes, we provide regular updates throughout the repair process. You can also call or email us anytime for a status update."
    }
  ],
  
  qualityAssurance: {
    processSteps: [
      "Initial inspection and documentation",
      "Repair planning and parts ordering",
      "Structural repairs and body work",
      "Paint preparation and application",
      "Assembly and detail work",
      "Quality control inspection",
      "Final cleaning and customer delivery"
    ],
    warranty: "Lifetime warranty on all workmanship and paint for as long as you own the vehicle.",
    qualityChecks: "Multiple quality checks throughout the repair process, including a comprehensive final inspection."
  }
}; 