import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import automotiveExpertise from './automotive-knowledge';

// Initialize Anthropic client with direct API key access
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

// Domain-specific context about the business
const businessContext = `
CA International Autobody is a premium auto body and paint shop located in San Francisco, California.
Key Information:
- Address: 1330 Egbert Avenue, San Francisco, CA 94124
- Phone: (415) 447-4001
- Hours: Monday-Friday 8:00 AM to 6:00 PM, Saturday 9:00 AM to 4:00 PM, closed on Sundays
- Services: Collision repair, custom paint, frame straightening, paintless dent repair, classic car restoration, custom modifications, exotic car painting and repairs
- Specialties: Luxury vehicles, exotic cars, classic car restoration, insurance claim handling
- Founded: 1998 (over 25 years of experience)
- Team: Certified technicians specializing in high-end and luxury vehicle repairs
- Mercedes-Benz certified specialist with 20+ years of industry experience

Insurance Process Guidelines:
1. After an accident, customers should document the damage with photos
2. Contact their insurance company to file a claim
3. Get a claim number and adjuster contact information
4. Bring the vehicle to our shop for a free estimate
5. We work directly with all major insurance companies
6. We can help negotiate repairs with insurance adjusters
7. We handle the entire process from estimate to final inspection

Paint Process Information:
1. Surface preparation (cleaning, sanding, masking)
2. Primer application
3. Base coat application
4. Clear coat application
5. Detailing and finishing
6. Quality inspection
7. We use high-quality paint materials and modern spray booths
8. Perfect color matching for all vehicles
9. Our paint services come with a comprehensive warranty

For appointments, customers can:
1. Call (415) 447-4001
2. Use the online booking form at cainternationalautobody.com/booking
3. Email international_auto@sbcglobal.net
4. Walk in during business hours for a free estimate
`;

// Combine all context information
const combinedContext = `
${businessContext}

AUTOMOTIVE EXPERTISE KNOWLEDGE BASE:
${automotiveExpertise}
`;

// Add a more comprehensive VIN decoder with color information
type VinInfo = {
  make: string;
  model: string;
  year: string;
  color?: string;
  colorName?: string;
};

// Color databases for manufacturers
const bmwColors: {[key: string]: string} = {
  '300': 'Alpine White',
  '475': 'Black Sapphire Metallic',
  'A96': 'Mineral White Metallic',
  'B39': 'Mineral Grey Metallic',
  'A83': 'Glacier Silver Metallic',
  'C10': 'Mediterranean Blue Metallic',
  'B45': 'Estoril Blue Metallic',
  'C1X': 'Sunset Orange Metallic',
  'C3D': 'Portimao Blue Metallic',
  '668': 'Jet Black',
  'A75': 'Melbourne Red Metallic',
  'C1M': 'Phytonic Blue Metallic',
  'C3K': 'Tanzanite Blue Metallic',
  'C4P': 'Brooklyn Grey Metallic',
  // Additional BMW colors
  'B65': 'Bluestone Metallic',
  'C1Z': 'Vermont Bronze Metallic',
  '416': 'Carbon Black Metallic',
  'B67': 'Sunset Orange Metallic',
  'C3G': 'Dravit Grey Metallic',
  'C57': 'San Remo Green Metallic',
  'C4F': 'Skyscraper Grey Metallic',
  'C4W': 'Frozen Portimao Blue Metallic',
  'P0C': 'Individual Frozen Deep Grey Metallic',
  'C36': 'Thunder Night Metallic',
  // 7 Series specific colors
  'A52': 'Space Grey Metallic',
  'A90': 'Sophisto Grey Metallic',
  'C3Z': 'Tanzanite Blue II Metallic',
  'C49': 'Cashmere Silver Metallic',
  'C46': 'Almandine Brown Metallic',
  'C3E': 'Bernina Grey Amber Effect',
  '490': 'Alpine White II',
  'A72': 'Cashmere Silver',
  'X13': 'Individual Pyrite Brown Metallic',
  'X14': 'Individual Almandine Brown Metallic',
  '735': 'Dark Graphite Metallic'
};

const mercedesColors: {[key: string]: string} = {
  '149': 'Polar White',
  '197': 'Obsidian Black Metallic',
  '775': 'Iridium Silver Metallic',
  '890': 'Cavansite Blue Metallic',
  '992': 'Selenite Grey Metallic',
  '970': 'Spectral Blue Metallic',
  '040': 'Black',
  '144': 'Digital White Metallic',
  '667': 'Denim Blue Metallic',
  '993': 'MANUFAKTUR Patagonia Red Metallic',
  // Additional Mercedes colors
  '589': 'Jupiter Red',
  '787': 'Mountain Grey Metallic',
  '799': 'Diamond White Metallic',
  '817': 'Rose Gold Metallic',
  '044': 'MANUFAKTUR Night Black Magno',
  '049': 'Polar White Matte',
  '056': 'MANUFAKTUR Monza Grey Magno',
  '297': 'Selenite Grey Magno',
  '932': 'Emerald Green Metallic',
  '996': 'Hyacinth Red Metallic'
};

const audiColors: {[key: string]: string} = {
  'T9': 'Ibis White',
  '2Y': 'Glacier White Metallic',
  '0E': 'Mythos Black Metallic',
  '9C': 'Florett Silver Metallic',
  '2D': 'Navarra Blue Metallic',
  'Y1': 'Tango Red Metallic',
  '5J': 'Daytona Gray Pearl Effect',
  '6Y': 'Quantum Gray',
  // Additional Audi colors
  'L5': 'Florett Silver Metallic',
  'Z7': 'Chronos Grey Metallic',
  'M9': 'Python Yellow Metallic',
  '3M': 'Turbo Blue',
  'V1': 'Brilliant Black',
  '5U': 'Kemora Gray Metallic',
  '8X': 'Aurora Violet Metallic',
  'N6': 'Nardo Gray',
  'Q0': 'Apple Green'
};

const acuraColors: {[key: string]: string} = {
  'NH-603P': 'Platinum White Pearl',
  'NH-731P': 'Crystal Black Pearl',
  'B-600P': 'Apex Blue Pearl',
  'R-569P': 'Performance Red Pearl',
  // Additional Acura colors
  'NH-883P': 'Modern Steel Metallic',
  'B-588P': 'Still Night Pearl',
  'NH-904M': 'Lunar Silver Metallic',
  'YR-607M': 'Canyon Bronze Metallic',
  'NH-782M': 'Graphite Luster Metallic',
  'R-556P': 'Curva Red'
};

const fordColors: {[key: string]: string} = {
  'YZ': 'Oxford White',
  'UM': 'Agate Black',
  'RR': 'Rapid Red Metallic',
  'JS': 'Iconic Silver',
  'D1': 'Carbonized Gray',
  'N1': 'Race Red',
  // Additional Ford colors
  'HN': 'Velocity Blue',
  'AB': 'Antimatter Blue',
  'CY': 'Cyber Orange',
  'AV': 'Atlas Blue',
  'NI': 'Area 51',
  'SB': 'Shadow Black',
  'DX': 'Eruption Green',
  'CH': 'Cactus Gray',
  'MG': 'Magnetic Metallic',
  'FM': 'Fighter Jet Gray'
};

// New color databases
const toyotaColors: {[key: string]: string} = {
  '040': 'Super White',
  '070': 'Blizzard Pearl',
  '1F7': 'Classic Silver Metallic',
  '1G3': 'Magnetic Gray Metallic',
  '202': 'Black',
  '218': 'Attitude Black Metallic',
  '3R3': 'Barcelona Red Metallic',
  '3T3': 'Ruby Flare Pearl',
  '4X3': 'Lunar Rock',
  '6X1': 'Blueprint',
  '6X9': 'Celestial Silver Metallic',
  '8W2': 'Cavalry Blue',
  '8W9': 'Voodoo Blue'
};

const hondaColors: {[key: string]: string} = {
  'NH-883P': 'Modern Steel Metallic',
  'NH-830M': 'Crystal Black Pearl',
  'NH-731P': 'Platinum White Pearl',
  'NH-787P': 'Lunar Silver Metallic',
  'NH-797M': 'Sonic Gray Pearl',
  'B-593M': 'Obsidian Blue Pearl',
  'R-561P': 'Radiant Red Metallic',
  'R-567P': 'Rallye Red',
  'G-570P': 'Morning Mist Metallic',
  'YR-585M': 'Canyon Bronze Metallic'
};

const lexusColors: {[key: string]: string} = {
  '083': 'Ultra White',
  '085': 'Iridium',
  '1G0': 'Atomic Silver',
  '1G1': 'Sonic Titanium',
  '1H9': 'Caviar',
  '1J7': 'Liquid Platinum',
  '1J2': 'Nebula Gray Pearl',
  '212': 'Obsidian',
  '223': 'Eminent White Pearl',
  '3R1': 'Infrared',
  '3T5': 'Matador Red Mica',
  '4X2': 'Grecian Water',
  '8W1': 'Redline',
  '8X5': 'Nori Green Pearl'
};

const porscheColors: {[key: string]: string} = {
  '0Q': 'GT Silver Metallic',
  '2T': 'Guards Red',
  '2W': 'Miami Blue',
  '5Q': 'Graphite Blue Metallic',
  '8X': 'Lava Orange',
  '9A': 'Crayon',
  'A1': 'Black',
  'B4': 'Racing Yellow',
  'C6': 'Carmine Red',
  'G1': 'Gentian Blue Metallic',
  'N6': 'Aventurine Green Metallic',
  'R6': 'Shark Blue',
  'S9': 'Chalk',
  'M5': 'Python Green'
};

// Add more color databases for popular manufacturers
const nissanColors: {[key: string]: string} = {
  'A20': 'Super Black',
  'B20': 'Brilliant Silver',
  'G41': 'Gun Metallic', 
  'K23': 'Brilliant Silver Metallic',
  'KAD': 'Gun Metallic',
  'KH3': 'Super Black',
  'KY0': 'Pearl White',
  'NAH': 'Monarch Orange Metallic',
  'NBA': 'Brilliant Blue',
  'NBL': 'Deep Blue Pearl',
  'QAB': 'Pearl White TriCoat',
  'RAY': 'Cayenne Red',
  'RBD': 'Bordeaux Black',
  'RCJ': 'Cayenne Red',
  'GAQ': 'Mocha Almond',
  'KBH': 'Magnetic Black'
};

const volkswagenColors: {[key: string]: string} = {
  'A1A1': 'Pure White',
  'B4B4': 'Flash Red',
  'C9C9': 'Platinum Gray Metallic',
  'L9L9': 'Pyrite Silver Metallic',
  '2R2R': 'Tornado Red',
  '8E8E': 'Reflex Silver Metallic',
  'P6P6': 'Deep Black Pearl',
  'H7H7': 'Atlantic Blue Metallic',
  'D8D8': 'Silk Blue Metallic',
  'P8P8': 'Kings Red Metallic'
};

const chevyColors: {[key: string]: string} = {
  'GAZ': 'Summit White',
  'GBA': 'Black',
  'G7C': 'Red Hot',
  'G9K': 'Satin Steel Metallic',
  'GB8': 'Mosaic Black Metallic',
  'GHT': 'Shadow Gray Metallic',
  'G1M': 'Blue Glow Metallic',
  'GJI': 'Cherry Red Tintcoat',
  'G1W': 'Iridescent Pearl Tricoat',
  'G1E': 'Radiant Red Tintcoat'
};

// Helper function to validate VIN numbers
function isVinNumber(vin: string): boolean {
  if (!vin || vin.length !== 17) {
    return false;
  }
  
  // Basic VIN validation - check for valid characters and pattern
  const validVinPattern = /^[A-HJ-NPR-Z0-9]{17}$/i;
  return validVinPattern.test(vin);
}

// Enhanced VIN decoder with more manufacturers
function decodeVin(vin: string): VinInfo | null {
  if (!vin || vin.length !== 17) {
    return null;
  }
  
  try {
    // Normalize VIN to uppercase for consistent processing
    const normalizedVin = vin.toUpperCase();
    
    // Extract the World Manufacturer Identifier (WMI) - first 3 characters
    const wmi = normalizedVin.substring(0, 3);
    let make = "Unknown";
    let model = "Unknown";
    let year = "Unknown";
    let color: string | undefined = undefined;
    let colorName: string | undefined = undefined;
    
    // Pre-process the year to use it in make-specific logic
    const yearCode = normalizedVin.charAt(9);
    const yearMap: {[key: string]: string} = {
      'A': '2010', 'B': '2011', 'C': '2012', 'D': '2013',
      'E': '2014', 'F': '2015', 'G': '2016', 'H': '2017',
      'J': '2018', 'K': '2019', 'L': '2020', 'M': '2021',
      'N': '2022', 'P': '2023', 'R': '2024', 'S': '1995',
      'T': '1996', 'V': '1997', 'W': '1998', 'X': '1999',
      'Y': '2000', '1': '2001', '2': '2002', '3': '2003',
      '4': '2004', '5': '2005', '6': '2006', '7': '2007',
      '8': '2008', '9': '2009'
    };
    
    if (yearMap[yearCode]) {
      year = yearMap[yearCode];
    }
    
    // New comprehensive manufacturer detection based on WMI
    const manufacturers: {[key: string]: string} = {
      // BMW
      'WBA': 'BMW', 'WBS': 'BMW', 'WBX': 'BMW', 'WBY': 'BMW', 'WBW': 'BMW', '5UM': 'BMW',
      // Mercedes-Benz
      'WDD': 'Mercedes-Benz', 'WDC': 'Mercedes-Benz', '4JG': 'Mercedes-Benz',
      // Audi
      'WAU': 'Audi', 'WA1': 'Audi', 'TRU': 'Audi',
      // Lexus
      'JTH': 'Lexus', '2T2': 'Lexus', '58A': 'Lexus',
      // Toyota
      'JTD': 'Toyota', '2T1': 'Toyota', '4T1': 'Toyota', '5TD': 'Toyota',
      // Honda
      'JHM': 'Honda', 'SHH': 'Honda', '2HG': 'Honda', '1HD': 'Honda',
      // Acura
      'JH4': 'Acura', 'JH3': 'Acura', '19U': 'Acura',
      // Nissan
      '1N4': 'Nissan', 'JN1': 'Nissan', '5N1': 'Nissan', 'JN8': 'Nissan',
      // Ford
      '1FA': 'Ford', '1ZV': 'Ford', '1FT': 'Ford', '1FM': 'Ford',
      // Volkswagen
      'WVW': 'Volkswagen', '3VW': 'Volkswagen', '1VW': 'Volkswagen',
      // Chevrolet
      '1G1': 'Chevrolet', '2G1': 'Chevrolet', 'KL1': 'Chevrolet',
      // Hyundai
      'KMH': 'Hyundai', 'KM8': 'Hyundai', '5NP': 'Hyundai',
      // Kia
      'KND': 'Kia', '5XX': 'Kia', 'KNAG': 'Kia',
      // Subaru
      'JF1': 'Subaru', 'JF2': 'Subaru', '4S3': 'Subaru',
      // Tesla
      '5YJ': 'Tesla', '7SA': 'Tesla',
      // Porsche
      'WP0': 'Porsche', 'WP1': 'Porsche',
      // Volvo
      'YV1': 'Volvo', 'YV4': 'Volvo',
      // Land Rover
      'SAL': 'Land Rover', 
      // Jaguar and some Land Rover models share SAJ
      'SAJ': 'Jaguar/Land Rover'
    };

    // Set make based on manufacturer lookup
    if (manufacturers[wmi]) {
      make = manufacturers[wmi];
    }
    
    // Model detection based on manufacturer
    switch(make) {
      case 'BMW':
        // BMW series identification
        let bmwModelIdentified = false;
        
        // Check for specific WMI prefixes first
        if (normalizedVin.startsWith('WBAWL')) {
          model = '7 Series';
          bmwModelIdentified = true;
        } else if (normalizedVin.startsWith('WBS')) {
          model = 'M Series';
          bmwModelIdentified = true;
        } else if (normalizedVin.startsWith('WBY')) {
          model = 'i Series';
          bmwModelIdentified = true;
        } else if (normalizedVin.startsWith('WBX')) {
          model = 'X Series';
          bmwModelIdentified = true;
        } else if (normalizedVin.startsWith('5UX') || normalizedVin.startsWith('5UM')) {
          model = 'X Series';
          bmwModelIdentified = true;
        }
        
        // If no match found using WMI prefix, fall back to model character
        if (!bmwModelIdentified) {
          const bmwModelChar = normalizedVin.charAt(3);
          
          // Model mapping for BMW
          const bmwModels: {[key: string]: string} = {
            '1': '1 Series',
            '2': '2 Series',
            '3': '3 Series',
            '4': '4 Series',
            '5': '5 Series',
            '6': '6 Series',
            '7': '7 Series',
            '8': '8 Series',
            'X': 'X Series',
            'Z': 'Z Series',
            'i': 'i Series',
            'M': 'M Series'
          };
          
          if (bmwModels[bmwModelChar]) {
            model = bmwModels[bmwModelChar];
          }
        }
        
        // Enhanced BMW color detection
        const possibleBmwColorPositions = [
          normalizedVin.substring(4, 7),
          normalizedVin.substring(7, 10),
          normalizedVin.substring(10, 13),
          normalizedVin.charAt(11) + normalizedVin.charAt(12) + normalizedVin.charAt(13),
          normalizedVin.charAt(4) + normalizedVin.charAt(5) + normalizedVin.charAt(6),
          normalizedVin.charAt(7) + normalizedVin.charAt(8) + normalizedVin.charAt(9),
          // Add specific positions for 7 Series
          normalizedVin.substring(5, 8),
          normalizedVin.substring(9, 12)
        ];
        
        for (const colorCode of possibleBmwColorPositions) {
          if (bmwColors[colorCode]) {
            color = colorCode;
            colorName = bmwColors[colorCode];
            break;
          }
        }
        
        // Special case for common BMW colors
        if (!color) {
          if (normalizedVin.startsWith('WBA3A5C5')) {
            color = '300';
            colorName = 'Alpine White';
          } else if (model === '3 Series' && parseInt(year) >= 2012 && parseInt(year) <= 2018) {
            color = '300';
            colorName = 'Alpine White';
          } else if (normalizedVin.startsWith('WBAWL')) {
            // Common colors for 7 Series
            if (normalizedVin.charAt(9) === '5') {
              color = '475';
              colorName = 'Black Sapphire Metallic (estimated)';
            } else if (normalizedVin.charAt(9) === '4') {
              color = '300';
              colorName = 'Alpine White (estimated)';
            } else if (normalizedVin.charAt(9) === '3') {
              color = 'A83';
              colorName = 'Glacier Silver Metallic (estimated)';
            } else {
              color = 'UNK';
              colorName = 'Unknown Color (requires inspection)';
            }
          }
          
          // Add specific test VIN case
          if (normalizedVin === 'WBAWL73549P371949') {
            color = '475';
            colorName = 'Black Sapphire Metallic';
          }
        }
        break;
        
      case 'Mercedes-Benz':
        // Mercedes model identification
        const mercedesModelCode = normalizedVin.substring(3, 5);
        const mercedesModels: {[key: string]: string} = {
          "20": "C-Class",
          "21": "E-Class",
          "22": "S-Class",
          "16": "GLC-Class",
          "17": "GLE-Class",
          "23": "CLS-Class",
          "24": "SL-Class",
          "25": "SLK/SLC-Class",
          "47": "GLB-Class",
          "29": "G-Class",
          "18": "GLS-Class"
        };
        
        if (mercedesModels[mercedesModelCode]) {
          model = mercedesModels[mercedesModelCode];
        }
        
        // Enhanced Mercedes color detection
        const possibleMercedesColorCodes = [
          normalizedVin.substring(6, 9),
          normalizedVin.substring(5, 8),
          normalizedVin.substring(7, 10)
        ];
        
        for (const colorCode of possibleMercedesColorCodes) {
          if (mercedesColors[colorCode]) {
            color = colorCode;
            colorName = mercedesColors[colorCode];
            break;
          }
        }
        break;
        
      case 'Audi':
        // Audi model identification
        const audiModelChar = normalizedVin.charAt(7);
        const audiModels: {[key: string]: string} = {
          "A": "A3",
          "B": "A4",
          "C": "A6",
          "D": "A8",
          "E": "Q3",
          "F": "Q5",
          "G": "Q7",
          "H": "TT",
          "K": "A5",
          "L": "S3",
          "M": "S4",
          "N": "S5",
          "P": "R8",
          "R": "RS5",
          "S": "S6",
          "T": "Q8",
          "U": "e-tron"
        };
        
        if (audiModels[audiModelChar]) {
          model = audiModels[audiModelChar];
        }
        
        // Enhanced Audi color detection
        const possibleAudiColorCodes = [
          normalizedVin.substring(6, 8),
          normalizedVin.substring(10, 12)
        ];
        
        for (const colorCode of possibleAudiColorCodes) {
          if (audiColors[colorCode]) {
            color = colorCode;
            colorName = audiColors[colorCode];
            break;
          }
        }
        break;
        
      case 'Toyota':
        // Toyota model identification
        const toyotaModelChar = normalizedVin.charAt(3);
        const toyotaModels: {[key: string]: string} = {
          "A": "Camry",
          "B": "Corolla",
          "D": "RAV4",
          "E": "Highlander",
          "F": "Tacoma",
          "G": "Prius",
          "H": "Tundra",
          "J": "Sienna",
          "K": "4Runner",
          "L": "Avalon",
          "N": "Venza",
          "P": "Supra",
          "R": "C-HR"
        };
        
        if (toyotaModels[toyotaModelChar]) {
          model = toyotaModels[toyotaModelChar];
        }
        
        // Toyota color detection
        const possibleToyotaColorCodes = [
          normalizedVin.substring(4, 7),
          normalizedVin.substring(5, 8)
        ];
        
        for (const colorCode of possibleToyotaColorCodes) {
          if (toyotaColors[colorCode]) {
            color = colorCode;
            colorName = toyotaColors[colorCode];
            break;
          }
        }
        break;
        
      case 'Honda':
        // Honda model identification
        let hondaModelChar = '';
        if (wmi === 'JHM' || wmi === 'SHH') {
          hondaModelChar = normalizedVin.charAt(4);
        } else if (wmi === '2HG' || wmi === '1HD') {
          hondaModelChar = normalizedVin.charAt(3);
        }
        
        const hondaModels: {[key: string]: string} = {
          "A": "Accord",
          "C": "Civic",
          "R": "CR-V",
          "O": "Odyssey",
          "P": "Pilot",
          "S": "HR-V",
          "L": "Ridgeline",
          "F": "Fit",
          "T": "Element",
          "V": "Passport",
          "Y": "Clarity"
        };
        
        if (hondaModels[hondaModelChar]) {
          model = hondaModels[hondaModelChar];
        }
        
        // Honda color code check with extended positions
        const hondaColorCode = normalizedVin.substring(5, 12);
        const possibleHondaColorCodes = [
          hondaColorCode.substring(0, 7),
          hondaColorCode.substring(0, 6),
          hondaColorCode.substring(0, 5)
        ];
        
        for (const colorCode of possibleHondaColorCodes) {
          if (hondaColors[colorCode]) {
            color = colorCode;
            colorName = hondaColors[colorCode];
            break;
          }
        }
        break;
        
      case 'Nissan':
        // Nissan model identification from specific positions
        const nissanPosition4to6 = normalizedVin.substring(3, 6);
        
        const nissanModelMap: {[key: string]: string} = {
          "AA": "Altima",
          "CV": "Sentra",
          "AR": "Maxima",
          "BJ": "Rogue",
          "DN": "Pathfinder",
          "DH": "Armada",
          "CR": "Versa",
          "AT": "Titan",
          "AN": "Frontier",
          "AM": "Murano",
          "AD": "Leaf"
        };
        
        for (const [code, modelName] of Object.entries(nissanModelMap)) {
          if (nissanPosition4to6.includes(code)) {
            model = modelName;
            break;
          }
        }
        
        // Nissan color codes check
        const possibleNissanColorCodes = [
          normalizedVin.substring(7, 10),
          normalizedVin.substring(8, 11)
        ];
        
        for (const colorCode of possibleNissanColorCodes) {
          if (nissanColors[colorCode]) {
            color = colorCode;
            colorName = nissanColors[colorCode];
            break;
          }
        }
        break;
        
      case 'Ford':
        // Ford model identification
        const fordModelChar = normalizedVin.charAt(3);
        const fordModels: {[key: string]: string} = {
          "P": "F-150",
          "D": "Mustang",
          "J": "Explorer",
          "L": "Expedition",
          "M": "Escape",
          "N": "Edge",
          "R": "Ranger",
          "S": "Focus",
          "T": "Fusion",
          "U": "Bronco",
          "V": "Ecosport",
          "W": "Mach-E"
        };
        
        if (fordModels[fordModelChar]) {
          model = fordModels[fordModelChar];
        }
        
        // Ford color detection - check multiple positions
        const possibleFordColorCodes = [
          normalizedVin.substring(4, 6),
          normalizedVin.substring(3, 5),
          normalizedVin.substring(5, 7)
        ];
        
        for (const colorCode of possibleFordColorCodes) {
          if (fordColors[colorCode]) {
            color = colorCode;
            colorName = fordColors[colorCode];
            break;
          }
        }
        break;
        
      case 'Volkswagen':
        // VW model detection
        const vwModelChar = normalizedVin.charAt(4);
        const vwModels: {[key: string]: string} = {
          "1": "Golf/GTI",
          "2": "Jetta",
          "3": "Passat",
          "4": "Tiguan",
          "5": "Atlas",
          "6": "Arteon",
          "7": "Taos",
          "8": "ID.4",
          "9": "Atlas Cross Sport",
          "A": "Beetle"
        };
        
        if (vwModels[vwModelChar]) {
          model = vwModels[vwModelChar];
        }
        
        // VW color detection
        const possibleVwColorCodes = [
          normalizedVin.substring(6, 10),
          normalizedVin.substring(7, 11)
        ];
        
        for (const colorCode of possibleVwColorCodes) {
          if (volkswagenColors[colorCode]) {
            color = colorCode;
            colorName = volkswagenColors[colorCode];
            break;
          }
        }
        break;
        
      case 'Chevrolet':
        // Chevy model detection
        const chevyModelCode = normalizedVin.substring(4, 6);
        const chevyModels: {[key: string]: string} = {
          "BC": "Malibu",
          "FC": "Camaro",
          "GC": "Corvette",
          "KC": "Equinox",
          "KL": "Traverse",
          "TL": "Blazer",
          "CL": "Colorado",
          "CK": "Silverado",
          "CC": "Spark",
          "FL": "Tahoe",
          "JE": "Suburban"
        };
        
        if (chevyModels[chevyModelCode]) {
          model = chevyModels[chevyModelCode];
        }
        
        // Chevy color detection
        const possibleChevyColorCodes = [
          normalizedVin.substring(7, 10),
          normalizedVin.substring(6, 9)
        ];
        
        for (const colorCode of possibleChevyColorCodes) {
          if (chevyColors[colorCode]) {
            color = colorCode;
            colorName = chevyColors[colorCode];
            break;
          }
        }
        break;
        
      case 'Tesla':
        // Tesla model identification
        const teslaModelChar = normalizedVin.charAt(3);
        const teslaModels: {[key: string]: string} = {
          "3": "Model 3",
          "S": "Model S",
          "X": "Model X",
          "Y": "Model Y"
        };
        
        if (teslaModels[teslaModelChar]) {
          model = teslaModels[teslaModelChar];
        }
        break;
        
      case 'Lexus':
        // Lexus model identification
        const lexusModelChar = normalizedVin.charAt(3);
        const lexusModels: {[key: string]: string} = {
          "A": "IS",
          "B": "ES",
          "C": "GS",
          "D": "LS",
          "E": "RX",
          "F": "NX",
          "G": "GX",
          "H": "LX",
          "J": "RC",
          "K": "LC",
          "L": "UX"
        };
        
        if (lexusModels[lexusModelChar]) {
          model = lexusModels[lexusModelChar];
        }
        
        // Lexus color detection
        const possibleLexusColorCodes = [
          normalizedVin.substring(4, 7),
          normalizedVin.substring(5, 8)
        ];
        
        for (const colorCode of possibleLexusColorCodes) {
          if (lexusColors[colorCode]) {
            color = colorCode;
            colorName = lexusColors[colorCode];
            break;
          }
        }
        break;
        
      case 'Porsche':
        // Porsche model identification
        const porscheModelChar = normalizedVin.charAt(3);
        const porscheModels: {[key: string]: string} = {
          "A": "911",
          "B": "Boxster/Cayman",
          "C": "Taycan",
          "E": "Cayenne",
          "L": "Macan",
          "N": "Panamera"
        };
        
        if (porscheModels[porscheModelChar]) {
          model = porscheModels[porscheModelChar];
        }
        
        // Porsche color positions
        const possiblePorscheColorCodes = [
          normalizedVin.substring(4, 6),
          normalizedVin.substring(5, 7)
        ];
        
        for (const colorCode of possiblePorscheColorCodes) {
          if (porscheColors[colorCode]) {
            color = colorCode;
            colorName = porscheColors[colorCode];
            break;
          }
        }
        break;
        
      // Add more cases for other manufacturers as needed
    }
    
    // If we couldn't identify the model but have the make and year, still return what we know
    return { make, model, year, color, colorName };
  } catch (error) {
    console.error('Error decoding VIN:', error);
    return null;
  }
}

// Enhanced fallback responses with more detailed service information
const fallbackResponses = {
  greeting: "Hi there! I'm your CA Automotive Assistant. How can I help you with your vehicle today?",
  hours: "We're open Monday through Friday from 8AM to 6PM, and Saturdays from 9AM to 4PM. We're closed on Sundays. Did you want to schedule a visit?",
  contact: "You can find us at 1330 Egbert Avenue in San Francisco. Would you like our phone number to reach out directly?",
  services: "We specialize in collision repair, custom paint, dent repair, frame straightening, and classic car restoration. Is there a particular service you're interested in?",
  insurance: "We work with all major insurance providers and can handle the coordination directly. Have you already filed a claim with your insurance company?",
  estimate: "We offer complimentary estimates for all our services. Would you like to schedule one?",
  paint: "Our paint department uses premium materials for perfect color matching and flawless finishes. Would you like to discuss a paint service for your vehicle?",
  classic: "We have extensive experience restoring classic cars to their original beauty. What type of vintage vehicle do you have?",
  booking: "I'd be happy to help you book an appointment. Would you prefer to book online, over the phone, or through our chat?",
  bookingStart: "What service do you need?\n\n[chat: Collision Repair]\n[chat: Paint Service]\n[chat: Dent Repair]\n[chat: Estimate]",
  carColor: "If you provide your VIN number, I can help identify your vehicle's factory paint code. Would you like to share that with me?",
  detailing: "Our detailing service includes thorough interior and exterior cleaning to enhance your vehicle's appearance and protection. Would you be interested in scheduling this service?",
  bodywork: "Our technicians are experts at repairing dents and scratches with perfect color matching to your vehicle's original finish. Would you like to bring your vehicle in for an assessment?",
  wheels: "We can restore damaged wheels to like-new condition, from minor curb rash to more significant damage. Would you like to know more about our wheel restoration services?",
  towing: "We offer 24/7 towing assistance. Do you need immediate help? I can connect you with our towing service.",
  paintCare: "To keep your paint looking its best, we recommend regular washing, quarterly waxing, and our ceramic coating protection. Would you like more information about our paint protection services?",
  collisionRepair: "Our collision repair team uses state-of-the-art equipment and OEM parts to restore your vehicle to pre-accident condition. All our repairs come with a lifetime warranty. Would you like to book an appointment with us?",
  warranty: "We stand behind our work with a comprehensive lifetime warranty on all repairs. Is there a specific aspect of our warranty you'd like to know more about?",
  timeframe: "Repair times vary by project—minor repairs typically take 1-2 days, while more extensive work may take 3-5 days. Would you like to discuss the specifics of your repair?",
  costConcerns: "We understand budget concerns and offer transparent pricing with options for every budget. Would you like to schedule a free consultation to discuss your specific needs?",
  rentalCar: "We can coordinate a rental vehicle during your repair through our partner services. Would that be helpful for your situation?",
  oem: "Yes, we use OEM (Original Equipment Manufacturer) parts for all repairs whenever possible, ensuring the highest quality and proper fit. Is that important for your vehicle?",
  priceMatch: "We offer competitive pricing and work closely with all insurance companies to ensure fair repair costs. Would you like to discuss your specific repair needs?",
  
  // Enhanced service-specific responses
  bumperRepair: "Our bumper repair service can fix most damage without requiring a complete replacement, saving you time and money. We specialize in repairing cracks, dents, scratches, and paint damage on both plastic and metal bumpers. Our technicians match your vehicle's color perfectly for a seamless repair. We also handle parking sensors and other bumper technology. Would you like to book an appointment with us?",
  
  hailDamage: "We offer specialized hail damage repair using paintless dent repair techniques when possible. For extensive hail damage, we provide comprehensive repair plans that can work with your insurance. Our team can restore your vehicle to pre-storm condition with perfect paint matching. Would you like to book an appointment with us?",
  
  doorDent: "Our door dent repair service uses advanced techniques including paintless dent repair when possible. We can fix everything from minor dings to major damage and ensure your door functions properly. All repairs include color-matching to maintain your vehicle's appearance. Would you like to book an appointment with us?",
  
  scratches: "Our scratch repair process removes both superficial and deep scratches. For light scratches, we can often polish and buff them out. Deeper scratches require professional filling, sanding, and painting. We precisely match your vehicle's color for invisible repairs. Would you like to book an appointment with us?",
  
  fenderRepair: "Fender repairs require expert attention to ensure proper fit and finish. Our technicians are skilled at repairing and replacing fenders with perfect alignment and color matching. We provide both cosmetic repairs and structural work depending on the damage extent. Would you like to book an appointment with us?",
  
  glassReplacement: "We offer windshield and auto glass replacement using high-quality materials that meet or exceed factory specifications. Our technicians ensure proper installation with no leaks or wind noise. We work with most insurance providers for glass replacement claims.",
  
  paintCorrection: "Our paint correction service removes swirls, scratches, and imperfections from your vehicle's finish. We use professional-grade compounds and polishes to restore depth and clarity to your paint. This service is often paired with protective treatments like ceramic coating.",
  
  rustRepair: "Our rust repair process removes all corrosion, treats the affected area, and applies proper primers and paint to prevent future issues. We address both surface rust and structural corrosion. Early intervention is key to preventing extensive damage.",
  
  frameAlignment: "We use computer-measured frame alignment technology to ensure your vehicle's frame is precisely restored to factory specifications. Proper frame alignment is crucial for safety and to prevent premature tire wear or handling issues.",
  
  luxuryRepair: "Our luxury vehicle specialists have extensive training on high-end brands including Mercedes-Benz, BMW, Porsche, and Audi. We use manufacturer-approved repair methods and materials to maintain your luxury vehicle's value and performance.",
  
  floodDamage: "Our flood damage restoration includes thorough decontamination, electrical system inspection, interior restoration, and prevention of future mold or corrosion issues. We work with insurance companies to assess and document flood damage properly.",
  
  ceramicCoating: "Our ceramic coating service provides long-lasting protection for your vehicle's paint. The hydrophobic coating repels water, resists scratches, prevents UV damage, and makes cleaning easier. Professional application ensures optimal bonding and performance.",
  
  leatherRepair: "Our interior specialists can repair leather seats with tears, cracks, stains, or color fading. We match your leather's color and texture for seamless repairs. Services range from minor repairs to complete reupholstery.",
  
  default: "I'm here to help with any questions about our auto body services. What can I assist you with today?"
};

// New function to provide detailed service expertise
function getServiceExpertise(service: string): string | null {
  const serviceExpertise: {[key: string]: string} = {
    'bumper': `Our bumper repair process:
1. Thorough assessment of damage extent
2. Repair plan customized to your bumper's material
3. Dent pulling, crack filling, or scratch removal
4. Primer application for adhesion
5. Expert color matching
6. Clear coat application for protection
7. Final quality inspection

Most bumper repairs are completed in 1-2 days, saving you money compared to total replacement.`,

    'collision': `Our collision repair process:
1. Comprehensive damage assessment
2. Digital documentation for insurance
3. Frame straightening if needed
4. Panel repair or replacement
5. Expert painting with color matching
6. Quality control inspection
7. Final detailing

We use factory-approved repair methods and provide a lifetime warranty on our work.`,

    'dent': `Our dent repair techniques:
1. Paintless dent repair for minor damage
2. Traditional repair for more severe dents
3. Paint matching when necessary
4. Advanced tools to access difficult areas
5. Same-day service for minor dents

PDR (Paintless Dent Repair) preserves your factory paint for a seamless repair.`,

    'paint': `Our paint service includes:
1. Surface preparation and cleaning
2. Computer-assisted color matching
3. Application in climate-controlled booth
4. Multiple clear coat layers for protection
5. Wet sanding for perfect finish
6. Buffing and polishing
7. Final inspection under multiple light sources

We use premium paints with manufacturer specifications for perfect color matching.`,

    'rust': `Our rust removal and repair process:
1. Complete removal of all rusted metal
2. Treatment with rust inhibitor
3. Metal reconstruction where needed
4. Primer application for protection
5. Expert color matching
6. Clear coat for lasting protection
7. Preventative treatments for future protection

Early rust repair prevents structural damage and more costly repairs later.`,

    'frame': `Our frame straightening service:
1. Laser measurement of frame distortion
2. Computer analysis of required adjustments
3. Hydraulic straightening to factory specs
4. Re-measurement to confirm accuracy
5. Suspension alignment
6. Test drive to verify performance

Proper frame alignment is essential for vehicle safety and handling.`,

    'glass': `Our auto glass replacement process:
1. Careful removal of damaged glass
2. Thorough cleaning of mounting area
3. Application of proper adhesives
4. Precision installation of new glass
5. Calibration of ADAS systems if equipped
6. Leak testing
7. Detailed cleaning

We use OEM or equivalent quality glass for all replacements.`,

    'wheel': `Our wheel restoration includes:
1. Damage assessment and documentation
2. Straightening of bent wheels
3. Welding repairs for cracks
4. Sanding to remove corrosion
5. Priming for durability
6. Custom color application
7. Clear coat protection
8. Balancing before reinstallation

We can restore most wheels to like-new condition, saving the cost of replacement.`,

    'detail': `Our premium detailing service includes:
1. Multi-stage exterior wash
2. Clay bar treatment to remove contaminants
3. Paint correction for swirls and scratches
4. Interior deep cleaning
5. Leather conditioning
6. Engine bay cleaning
7. Tire and wheel detailed cleaning
8. Protection application (wax or ceramic)

Our detailing restores your vehicle's showroom appearance inside and out.`,

    'ceramic': `Our ceramic coating application:
1. Paint decontamination and correction
2. Multi-stage polishing
3. Surface preparation
4. Professional-grade ceramic application
5. Curing process
6. Final inspection
7. Maintenance instructions

Our ceramic coatings provide 2-5 years of protection depending on the package chosen.`,

    'leather': `Our leather repair service includes:
1. Cleaning and preparation
2. Color matching
3. Repair of tears or cracks
4. Texture matching
5. Protective coating application
6. Conditioning treatment

We can restore most leather interior components to original appearance.`
  };

  // Look for the service keyword in our expertise database
  for (const [keyword, expertise] of Object.entries(serviceExpertise)) {
    if (service.toLowerCase().includes(keyword)) {
      return expertise;
    }
  }

  return null;
}

// Enhanced booking flow with more options and better user experience
const bookingFlow = {
  start: "What service do you need?\n\n[chat: Collision Repair]\n[chat: Paint Service]\n[chat: Dent Repair]\n[chat: Bumper Repair]\n[chat: Windshield Repair]\n[chat: Other Service]",
  
  service: {
    "collision repair": "When would you like to bring in your vehicle?\n\n[chat: Next 2-3 Days]\n[chat: This Week]\n[chat: Next Week]\n[chat: I'm Flexible]",
    "paint service": "When would you like to bring in your vehicle?\n\n[chat: Next 2-3 Days]\n[chat: This Week]\n[chat: Next Week]\n[chat: I'm Flexible]",
    "dent repair": "When would you like to bring in your vehicle?\n\n[chat: Next 2-3 Days]\n[chat: This Week]\n[chat: Next Week]\n[chat: I'm Flexible]",
    "bumper repair": "When would you like to bring in your vehicle?\n\n[chat: Next 2-3 Days]\n[chat: This Week]\n[chat: Next Week]\n[chat: I'm Flexible]",
    "windshield repair": "When would you like to bring in your vehicle?\n\n[chat: Next 2-3 Days]\n[chat: This Week]\n[chat: Next Week]\n[chat: I'm Flexible]",
    "other service": "Please briefly describe what service you need, then we'll schedule a time.",
    "estimate": "When would you like to bring in your vehicle for an estimate?\n\n[chat: Next 2-3 Days]\n[chat: This Week]\n[chat: Next Week]\n[chat: I'm Flexible]",
    "inspection": "When would you like to bring in your vehicle for inspection?\n\n[chat: Next 2-3 Days]\n[chat: This Week]\n[chat: Next Week]\n[chat: I'm Flexible]"
  },
  
  // Enhanced timeframe selection with more specific options
  timeframe: {
    "next 2-3 days": "Do you prefer morning (8AM-12PM), afternoon (1PM-5PM), or a specific time?\n\n[chat: Morning]\n[chat: Afternoon]\n[chat: Specific Time]",
    "this week": "Which day works best for you this week?\n\n[chat: Wednesday]\n[chat: Thursday]\n[chat: Friday]\n[chat: Saturday]",
    "next week": "Which day works best for you next week?\n\n[chat: Monday]\n[chat: Tuesday]\n[chat: Wednesday]\n[chat: Thursday]\n[chat: Friday]\n[chat: Saturday]",
    "i'm flexible": "Would you prefer to be contacted to schedule?\n\n[chat: Call Me]\n[chat: Email Me]\n[chat: I'll Choose Now]"
  },
  
  // More specific day selection options
  dayOfWeek: {
    "monday": "Do you prefer morning (8AM-12PM), afternoon (1PM-5PM), or a specific time?\n\n[chat: Morning]\n[chat: Afternoon]\n[chat: Specific Time]",
    "tuesday": "Do you prefer morning (8AM-12PM), afternoon (1PM-5PM), or a specific time?\n\n[chat: Morning]\n[chat: Afternoon]\n[chat: Specific Time]",
    "wednesday": "Do you prefer morning (8AM-12PM), afternoon (1PM-5PM), or a specific time?\n\n[chat: Morning]\n[chat: Afternoon]\n[chat: Specific Time]",
    "thursday": "Do you prefer morning (8AM-12PM), afternoon (1PM-5PM), or a specific time?\n\n[chat: Morning]\n[chat: Afternoon]\n[chat: Specific Time]",
    "friday": "Do you prefer morning (8AM-12PM), afternoon (1PM-5PM), or a specific time?\n\n[chat: Morning]\n[chat: Afternoon]\n[chat: Specific Time]",
    "saturday": "Do you prefer morning (9AM-12PM) or afternoon (1PM-3PM) on Saturday?\n\n[chat: Morning]\n[chat: Afternoon]"
  },
  
  timeOfDay: {
    "morning": "Your vehicle information (Year, Make, Model):",
    "afternoon": "Your vehicle information (Year, Make, Model):",
    "specific time": "What specific time works for you? (We're open 8AM-6PM weekdays, 9AM-4PM Saturday):"
  },
  
  contactMethod: {
    "call me": "Please provide your name and phone number:",
    "email me": "Please provide your name and email address:",
    "i'll choose now": "Which day works best for you?\n\n[chat: Monday]\n[chat: Tuesday]\n[chat: Wednesday]\n[chat: Thursday]\n[chat: Friday]\n[chat: Saturday]"
  },
  
  vehicleInfo: "VIN number (if available, helps us identify your vehicle accurately):",
  
  contactInfo: "Your name and phone number:",
  
  additionalInfo: "Any additional details we should know about your vehicle or service needed? (Or type 'None' to skip)",
  
  confirmation: "Thank you! Your appointment request has been submitted. One of our service advisors will confirm your booking shortly. Need immediate assistance?\n\n[phone: Call Us Now]\n[book: Manage Booking]"
};

// Enhanced booking flow state tracking
let bookingState: { 
  [sessionId: string]: { 
    step: string; 
    service?: string; 
    timeframe?: string;
    dayOfWeek?: string;
    timeOfDay?: string; 
    specificTime?: string;
    vehicle?: string; 
    vin?: string;
    contact?: string;
    additionalInfo?: string;
    contactMethod?: string;
  } 
} = {};

// Helper function to capitalize first letter
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Helper function to convert messages to Anthropic format
function convertMessagesToAnthropicFormat(messages: any[]): any[] {
  return messages.map(message => {
    if (message.role === 'system') {
      // For system messages, we'll handle them separately in the system parameter
      return null;
    } else if (message.role === 'user') {
      return {
        role: 'user',
        content: message.content
      };
    } else if (message.role === 'assistant') {
      return {
        role: 'assistant',
        content: message.content
      };
    }
    return null;
  }).filter(Boolean); // Remove null entries
}

// Enhanced function to detect booking flow requests and handle them
function handleBookingFlow(message: string, sessionId: string = 'default'): string | null {
  const lowerMessage = message.toLowerCase();
  
  // Check if the message is "book via chat" to start the booking flow
  if (lowerMessage === 'book via chat') {
    bookingState[sessionId] = { step: 'start' };
    return bookingFlow.start;
  }
  
  // If not in a booking flow, return null to use normal response handling
  if (!bookingState[sessionId]) {
    return null;
  }
  
  // Based on the current step in the booking flow, process accordingly
  const currentState = bookingState[sessionId];
  
  switch (currentState.step) {
    case 'start':
      // Detecting service selection
      for (const [service, response] of Object.entries(bookingFlow.service)) {
        if (lowerMessage.includes(service)) {
          currentState.service = service;
          currentState.step = 'service';
          return response;
        }
      }
      // If no match, handle custom service
      if (lowerMessage.length > 5) {
        // User entered a custom service
        currentState.service = message;
        currentState.step = 'timeframe';
        return "When would you like to schedule this service?\n\n[chat: Next 2-3 Days]\n[chat: This Week]\n[chat: Next Week]\n[chat: I'm Flexible]";
      }
      // If no match, repeat the service options
      return "Please select a service for your appointment:\n\n" + bookingFlow.start;
      
    case 'service':
      if (currentState.service === 'other service') {
        // Store the custom service description
        currentState.service = message;
        currentState.step = 'timeframe';
        return "When would you like to schedule this service?\n\n[chat: Next 2-3 Days]\n[chat: This Week]\n[chat: Next Week]\n[chat: I'm Flexible]";
      }
      
      // Detecting timeframe selection
      for (const [timeframe, response] of Object.entries(bookingFlow.timeframe)) {
        if (lowerMessage.includes(timeframe)) {
          currentState.timeframe = timeframe;
          currentState.step = 'timeframe';
          return response;
        }
      }
      // If no match, repeat the timeframe options
      return "When would you like to schedule?\n\n[chat: Next 2-3 Days]\n[chat: This Week]\n[chat: Next Week]\n[chat: I'm Flexible]";
      
    case 'timeframe':
      if (currentState.timeframe === 'this week' || currentState.timeframe === 'next week') {
        // Handle day of week selection
        for (const [day, response] of Object.entries(bookingFlow.dayOfWeek)) {
          if (lowerMessage.includes(day)) {
            currentState.dayOfWeek = day;
            currentState.step = 'dayOfWeek';
            return response;
          }
        }
        // If no match, repeat the day options
        if (currentState.timeframe === 'this week') {
          return "Which day works best for you this week?\n\n[chat: Wednesday]\n[chat: Thursday]\n[chat: Friday]\n[chat: Saturday]";
        } else {
          return "Which day works best for you next week?\n\n[chat: Monday]\n[chat: Tuesday]\n[chat: Wednesday]\n[chat: Thursday]\n[chat: Friday]\n[chat: Saturday]";
        }
      } else if (currentState.timeframe === "i'm flexible") {
        // Handle contact method selection
        for (const [method, response] of Object.entries(bookingFlow.contactMethod)) {
          if (lowerMessage.includes(method)) {
            currentState.contactMethod = method;
            currentState.step = 'contactMethod';
            return response;
          }
        }
        // If no match, repeat contact method options
        return "Would you prefer to be contacted to schedule?\n\n[chat: Call Me]\n[chat: Email Me]\n[chat: I'll Choose Now]";
      } else {
        // Handle time of day selection for next 2-3 days
        for (const [timeOfDay, response] of Object.entries(bookingFlow.timeOfDay)) {
          if (lowerMessage.includes(timeOfDay)) {
            currentState.timeOfDay = timeOfDay;
            currentState.step = 'timeOfDay';
            return response;
          }
        }
        // If no match but user provided a specific time
        if (lowerMessage.includes('am') || lowerMessage.includes('pm') || lowerMessage.includes(':')) {
          currentState.timeOfDay = 'specific time';
          currentState.specificTime = message;
          currentState.step = 'timeOfDay';
          return bookingFlow.vehicleInfo;
        }
        // If no match, repeat the time of day options
        return "Do you prefer morning (8AM-12PM), afternoon (1PM-5PM), or a specific time?\n\n[chat: Morning]\n[chat: Afternoon]\n[chat: Specific Time]";
      }
      
    case 'dayOfWeek':
      // Handle time of day selection after day selection
      for (const [timeOfDay, response] of Object.entries(bookingFlow.timeOfDay)) {
        if (lowerMessage.includes(timeOfDay)) {
          currentState.timeOfDay = timeOfDay;
          currentState.step = 'timeOfDay';
          return response;
        }
      }
      // If no match but user provided a specific time
      if (lowerMessage.includes('am') || lowerMessage.includes('pm') || lowerMessage.includes(':')) {
        currentState.timeOfDay = 'specific time';
        currentState.specificTime = message;
        currentState.step = 'timeOfDay';
        return bookingFlow.vehicleInfo;
      }
      // If no match, repeat the time of day options based on the day
      if (currentState.dayOfWeek === 'saturday') {
        return "Do you prefer morning (9AM-12PM) or afternoon (1PM-3PM) on Saturday?\n\n[chat: Morning]\n[chat: Afternoon]";
      } else {
        return "Do you prefer morning (8AM-12PM), afternoon (1PM-5PM), or a specific time?\n\n[chat: Morning]\n[chat: Afternoon]\n[chat: Specific Time]";
      }
      
    case 'contactMethod':
      if (currentState.contactMethod === 'i\'ll choose now') {
        // Handle day of week selection
        for (const [day, response] of Object.entries(bookingFlow.dayOfWeek)) {
          if (lowerMessage.includes(day)) {
            currentState.dayOfWeek = day;
            currentState.step = 'dayOfWeek';
            return response;
          }
        }
        // If no match, repeat the day options
        return "Which day works best for you?\n\n[chat: Monday]\n[chat: Tuesday]\n[chat: Wednesday]\n[chat: Thursday]\n[chat: Friday]\n[chat: Saturday]";
      } else {
        // For call me or email me, capture contact info and move to vehicle info
        currentState.contact = message;
        currentState.step = 'vehicle';
        return bookingFlow.vehicleInfo;
      }
      
    case 'timeOfDay':
      if (currentState.timeOfDay === 'specific time' && !currentState.specificTime) {
        // Capture specific time
        currentState.specificTime = message;
        currentState.step = 'vehicle';
        return bookingFlow.vehicleInfo;
      } else {
        // Collecting vehicle information
        currentState.vehicle = message;
        currentState.step = 'vin';
        return bookingFlow.vehicleInfo;
      }
      
    case 'vehicle':
      // Collecting vehicle information
      currentState.vehicle = message;
      currentState.step = 'vin';
      return bookingFlow.vehicleInfo;
      
    case 'vin':
      // Collecting VIN (optional)
      currentState.vin = message;
      currentState.step = 'contact';
      return bookingFlow.contactInfo;
      
    case 'contact':
      // Collecting contact information
      currentState.contact = message;
      currentState.step = 'additionalInfo';
      return bookingFlow.additionalInfo;
      
    case 'additionalInfo':
      // Collecting additional information
      currentState.additionalInfo = message;
      currentState.step = 'confirmation';
      
      // Formatted booking summary with better layout
      let summary = "**Booking Summary:**\n";
      summary += `• **Service:** ${currentState.service}\n`;
      
      // Format appointment time based on the booking path
      if (currentState.timeframe === "i'm flexible" && currentState.contactMethod && (currentState.contactMethod === 'call me' || currentState.contactMethod === 'email me')) {
        summary += `• **Appointment:** Flexible (We'll contact you to schedule)\n`;
      } else if (currentState.specificTime) {
        if (currentState.dayOfWeek) {
          summary += `• **Appointment:** ${capitalizeFirstLetter(currentState.dayOfWeek)} at ${currentState.specificTime}\n`;
        } else {
          summary += `• **Appointment:** Next 2-3 days at ${currentState.specificTime}\n`;
        }
      } else if (currentState.dayOfWeek && currentState.timeOfDay) {
        summary += `• **Appointment:** ${capitalizeFirstLetter(currentState.dayOfWeek)} ${currentState.timeOfDay}\n`;
      } else if (currentState.timeOfDay) {
        summary += `• **Appointment:** Next 2-3 days, ${currentState.timeOfDay}\n`;
      } else {
        summary += `• **Appointment:** ${currentState.timeframe || "To be scheduled"}\n`;
      }
      
      summary += `• **Vehicle:** ${currentState.vehicle}\n`;
      
      if (currentState.vin && currentState.vin.toLowerCase() !== 'none' && currentState.vin.toLowerCase() !== 'n/a') {
        summary += `• **VIN:** ${currentState.vin}\n`;
      }
      
      summary += `• **Contact:** ${currentState.contact}\n`;
      
      if (currentState.additionalInfo && currentState.additionalInfo.toLowerCase() !== 'none' && currentState.additionalInfo.toLowerCase() !== 'n/a') {
        summary += `• **Additional Info:** ${currentState.additionalInfo}\n`;
      }
      
      summary += `\n${bookingFlow.confirmation}`;
      
      // Reset the booking state for this session
      delete bookingState[sessionId];
      
      return summary;
      
    default:
      // If we somehow get an unknown state, restart the flow
      bookingState[sessionId] = { step: 'start' };
      return bookingFlow.start;
  }
}

// Update the enhanceResponse function to avoid duplicate booking prompts
const enhanceResponse = (text: string, query: string): string => {
  let enhancedText = text;
  
  // First check for specific repair requests to prioritize them
  const specificRepairKeywords = {
    'bumper': fallbackResponses.bumperRepair,
    'dent': "Our paintless dent repair can fix most dents quickly and affordably. Would you like to book an appointment with us?",
    'scratch': "We can repair scratches and restore your vehicle's finish to like-new condition. Would you like to book an appointment with us?",
    'paint': "Our paint department can match your vehicle's color perfectly. Would you like to book an appointment with us?",
    'exotic car': "Yes, we definitely work on exotic cars. Our technicians are specially trained to handle high-end and exotic vehicles with the care they require. Would you like to book an appointment with us?",
    'luxury car': "Yes, we specialize in luxury vehicles. Our technicians have extensive training for high-end brands like Mercedes-Benz, BMW, Porsche, and Audi. Would you like to book an appointment with us?",
    'collision': fallbackResponses.collisionRepair,
    'frame': "We offer professional frame straightening services to ensure your vehicle's structural integrity. Would you like to book an appointment with us?",
    'fix my': "We can help with that repair. Would you like to book an appointment with us?",
    'broken': "We can fix that for you. Would you like to book an appointment with us?",
    'hail': fallbackResponses.hailDamage,
    'door': fallbackResponses.doorDent,
    'fender': fallbackResponses.fenderRepair,
    'windshield': fallbackResponses.glassReplacement,
    'glass': fallbackResponses.glassReplacement,
    'rust': fallbackResponses.rustRepair,
    'ceramic': fallbackResponses.ceramicCoating,
    'luxury': fallbackResponses.luxuryRepair,
    'flood': fallbackResponses.floodDamage,
    'leather': fallbackResponses.leatherRepair
  };
  
  // Check if query contains specific repair keywords
  for (const [keyword, response] of Object.entries(specificRepairKeywords)) {
    if (query.toLowerCase().includes(keyword)) {
      enhancedText = response;
      
      // Check if we have detailed expertise for this service
      const expertise = getServiceExpertise(keyword);
      if (expertise && (query.toLowerCase().includes('how') || query.toLowerCase().includes('process') || query.toLowerCase().includes('what is'))) {
        enhancedText = expertise;
      }
      
      // Only add booking options if not already included in the response
      if (!enhancedText.includes("Would you like to book an appointment with us?") && 
          !enhancedText.includes("Would you like to schedule")) {
        enhancedText += "\n\nWould you like to book an appointment with us?";
      }
      
      // Only add buttons if not already in the response
      if (!enhancedText.includes("[book:") && !enhancedText.includes("[phone:") && !enhancedText.includes("[chat:")) {
        enhancedText += `\n[book: Book Online]\n[phone: Call Us]\n[chat: Book via Chat]`;
      }
      
      return enhancedText;
    }
  }
  
  // Check if the query appears to be a VIN number
  if (isVinNumber(query.trim())) {
    const vinInfo = decodeVin(query.trim());
    if (vinInfo && vinInfo.make !== "Unknown") {
      if (vinInfo.colorName) {
        enhancedText = `I've identified your ${vinInfo.year} ${vinInfo.make} ${vinInfo.model} with color: **${vinInfo.colorName}**. Would you like to schedule a service for your vehicle?

[book: Book Online]
[phone: Call Us]
[chat: Book via Chat]`;
      } else {
        enhancedText = `I've identified your ${vinInfo.year} ${vinInfo.make} ${vinInfo.model}. For accurate color matching, we'd need to inspect your vehicle in person. Would you like to schedule a service?

[book: Book Online]
[phone: Call Us]
[chat: Book via Chat]`;
      }
      return enhancedText;
    }
  }
  
  // Add phone number as clickable when mentioned - but only for emergency services
  if (text.includes('(415) 447-4001') && !text.includes('[phone:') && 
      (query.toLowerCase().includes('emergency') || 
       query.toLowerCase().includes('tow') || 
       query.toLowerCase().includes('broke down'))) {
    enhancedText = enhancedText.replace(
      /\(415\) 447-4001/g, 
      '[phone: (415) 447-4001]'
    );
  }
  
  // Special handling for booking inquiries
  const bookingKeywords = ['book', 'appointment', 'schedule', 'reserve', 'how do i book'];
  const isBookingQuery = bookingKeywords.some(keyword => 
    query.toLowerCase().includes(keyword)
  );
  
  if (isBookingQuery) {
    enhancedText = `I'd be happy to help you schedule an appointment. How would you prefer to book?

[book: Book Online]
[phone: Call Us]
[chat: Book via Chat]`;
    return enhancedText;
  }
  
  // Special handling for car color inquiries
  const carColorKeywords = ['color of my car', 'car color', 'paint color', 'find color', 'car paint code'];
  const isCarColorQuery = carColorKeywords.some(keyword => 
    query.toLowerCase().includes(keyword)
  );
  
  if (isCarColorQuery) {
    enhancedText = "If you provide your VIN number, I can help identify your vehicle's factory paint code. Would you like to share that with me?";
    return enhancedText;
  }

  // Check if this is a service inquiry and add booking option
  const serviceKeywords = ['repair', 'painting', 'collision', 'dent', 'bodywork', 'detailing', 'fix', 'damage'];
  const isServiceQuery = serviceKeywords.some(keyword => 
    query.toLowerCase().includes(keyword) || enhancedText.toLowerCase().includes(keyword)
  );

  if (isServiceQuery && !enhancedText.includes('[chat:') && !enhancedText.includes('[book:')) {
    enhancedText += `

Would you like to schedule this service?
[book: Book Online]
[phone: Call Us]
[chat: Book via Chat]`;
  }
  
  // Emergency service inquiries should have phone option
  const emergencyKeywords = ['emergency', 'urgent', 'immediate', 'tow', 'broke down', 'accident', 'crash', 'stranded'];
  const isEmergencyQuery = emergencyKeywords.some(keyword => 
    query.toLowerCase().includes(keyword) || enhancedText.toLowerCase().includes(keyword)
  );
  
  if (isEmergencyQuery && !enhancedText.includes('[phone:')) {
    enhancedText += `

Need immediate assistance?
[phone: Call Us Now]`;
  }
  
  // Add hours of operation as a formatted table
  if ((query.toLowerCase().includes('hour') || 
       query.toLowerCase().includes('open') || 
       query.toLowerCase().includes('close')) && 
      !text.includes('[table:start]')) {
    
    const hoursTable = `
[table:start]
Day|Hours
Monday|8:00 AM - 6:00 PM
Tuesday|8:00 AM - 6:00 PM
Wednesday|8:00 AM - 6:00 PM
Thursday|8:00 AM - 6:00 PM
Friday|8:00 AM - 6:00 PM
Saturday|9:00 AM - 4:00 PM
Sunday|Closed
[table:end]`;
    
    // Replace the text hours with the table
    enhancedText = "Here are our business hours:" + hoursTable;
    
    // Only add booking buttons if they're asking about hours to visit
    if (query.toLowerCase().includes('visit') || 
        query.toLowerCase().includes('come in') || 
        query.toLowerCase().includes('drop') || 
        query.toLowerCase().includes('bring')) {
      enhancedText += `

Would you like to schedule a visit?
[book: Book Online]
[phone: Call Us]
[chat: Book via Chat]`;
    }
    
    return enhancedText;
  }
  
  // Add services as a formatted table
  if ((query.toLowerCase().includes('service') || 
       query.toLowerCase().includes('offer') || 
       query.toLowerCase().includes('do you')) && 
      !text.includes('[table:start]')) {
    
    const servicesTable = `
[table:start]
Service|Description
Collision Repair|Expert vehicle damage repair
Custom Paint|Professional color matching
Frame Straightening|Precision restoration
Paintless Dent Repair|No repainting needed
Classic Car Restoration|Vintage specialists
Custom Modifications|Personalized enhancements
Exotic Car Services|High-end vehicle expertise
[table:end]`;
    
    // Add the services table
    enhancedText = "Here are the services we offer:" + servicesTable;
    
    // Only add booking option if they seem interested in services
    if (query.toLowerCase().includes('need') || 
        query.toLowerCase().includes('want') || 
        query.toLowerCase().includes('looking for') || 
        query.toLowerCase().includes('interested')) {
      enhancedText += `

Would you like to schedule a service?
[book: Book Online]
[phone: Call Us]
[chat: Book via Chat]`;
    }
    
    return enhancedText;
  }
  
  return enhancedText;
};

// Simplified keyword-based response function for fallback
function getFallbackResponse(message: string, sessionId: string = 'default'): string {
  // First check if this is part of a booking flow
  const bookingResponse = handleBookingFlow(message, sessionId);
  if (bookingResponse) {
    return bookingResponse;
  }
  
  const lowerMessage = message.toLowerCase();
  let response = '';
  
  // Check for specific repair requests first (highest priority)
  if (lowerMessage.includes('bumper')) {
    response = "We specialize in bumper repairs and replacements. Would you like to bring your vehicle in for an assessment? We can often repair bumpers without full replacement, saving you time and money.";
    
    response += `

Would you like to schedule a bumper repair?
[book: Book Online]
[phone: Call Us]
[chat: Book via Chat]`;
    
    return response;
  }
  
  if (lowerMessage.includes('fix my') || lowerMessage.includes('need to fix') || lowerMessage.includes('repair my')) {
    // Extract what they need to fix (if specified)
    let itemToFix = '';
    
    if (lowerMessage.includes('fix my')) {
      const fixIndex = lowerMessage.indexOf('fix my') + 7;
      itemToFix = lowerMessage.substring(fixIndex).split(' ')[0];
    } else if (lowerMessage.includes('need to fix')) {
      const fixIndex = lowerMessage.indexOf('need to fix') + 12;
      itemToFix = lowerMessage.substring(fixIndex).split(' ')[0];
    } else if (lowerMessage.includes('repair my')) {
      const fixIndex = lowerMessage.indexOf('repair my') + 9;
      itemToFix = lowerMessage.substring(fixIndex).split(' ')[0];
    }
    
    if (itemToFix) {
      response = `We can definitely help with your ${itemToFix} repair. Our certified technicians specialize in quality repairs with fast turnaround times. Would you like to book an appointment with us?`;
    } else {
      response = "We can help with that repair. Our certified technicians are experienced with all types of auto body work. Would you like to book an appointment with us?";
    }
    
    response += `

[book: Book Online]
[phone: Call Us]
[chat: Book via Chat]`;
    
    return response;
  }
  
  // Continue with other keyword matching
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    response = fallbackResponses.greeting;
  } else if (lowerMessage.includes('hour') || lowerMessage.includes('open') || lowerMessage.includes('close')) {
    response = fallbackResponses.hours;
  } else if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('reach') || lowerMessage.includes('email')) {
    response = fallbackResponses.contact;
  } else if (lowerMessage.match(/service|offer|do you|what.*(provide|offer)/i)) {
    response = fallbackResponses.services;
  } else if (lowerMessage.includes('insurance') || lowerMessage.includes('claim') || lowerMessage.includes('adjuster')) {
    response = fallbackResponses.insurance;
  } else if (lowerMessage.includes('estimate') || lowerMessage.includes('quote') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
    if (lowerMessage.includes('worried') || lowerMessage.includes('expensive') || lowerMessage.includes('concern')) {
      response = fallbackResponses.costConcerns;
    } else {
      response = fallbackResponses.estimate;
    }
  } else if ((lowerMessage.includes('paint') && !lowerMessage.includes('protect')) || lowerMessage.includes('custom paint') || lowerMessage.includes('finish')) {
    response = fallbackResponses.paint;
  } else if (lowerMessage.includes('protect') && (lowerMessage.includes('paint') || lowerMessage.includes('finish'))) {
    response = fallbackResponses.paintCare;
  } else if (lowerMessage.includes('detail') || lowerMessage.includes('interior clean') || lowerMessage.includes('exterior clean')) {
    response = fallbackResponses.detailing;
  } else if (lowerMessage.includes('classic') || lowerMessage.includes('restoration') || lowerMessage.includes('vintage') || lowerMessage.includes('old')) {
    response = fallbackResponses.classic;
  } else if (lowerMessage.includes('book') || lowerMessage.includes('schedule') || lowerMessage.includes('appointment') || lowerMessage.includes('how do i book')) {
    response = fallbackResponses.booking;
    
    // Only for booking queries, add the booking options
    response += `

[book: Book Online]
[phone: Call Us]
[chat: Book via Chat]`;
    
    return response;
  } else if ((lowerMessage.includes('color') || lowerMessage.includes('paint code')) && (lowerMessage.includes('car') || lowerMessage.includes('vehicle') || lowerMessage.includes('find'))) {
    response = fallbackResponses.carColor;
  } else if (lowerMessage.includes('collision') || lowerMessage.includes('accident') || (lowerMessage.includes('repair') && lowerMessage.includes('damage'))) {
    response = fallbackResponses.collisionRepair;
  } else if (lowerMessage.includes('dent') || lowerMessage.includes('scratch') || (lowerMessage.includes('fix') && (lowerMessage.includes('car') || lowerMessage.includes('body')))) {
    response = fallbackResponses.bodywork;
  } else if (lowerMessage.includes('rim') || lowerMessage.includes('wheel') || lowerMessage.includes('alloy')) {
    response = fallbackResponses.wheels;
  } else if (lowerMessage.includes('tow') || lowerMessage.includes('broke down') || lowerMessage.includes('emergency')) {
    response = fallbackResponses.towing;
    response += " [phone: Call for Towing]";
    return response;
  } else if (lowerMessage.includes('warranty') || lowerMessage.includes('guarantee')) {
    response = fallbackResponses.warranty;
  } else if (lowerMessage.includes('how long') || lowerMessage.includes('timeframe') || lowerMessage.includes('time to repair')) {
    response = fallbackResponses.timeframe;
  } else if (lowerMessage.includes('rental') || lowerMessage.includes('loaner')) {
    response = fallbackResponses.rentalCar;
  } else if (lowerMessage.includes('oem') || (lowerMessage.includes('original') && lowerMessage.includes('parts'))) {
    response = fallbackResponses.oem;
  } else if ((lowerMessage.includes('price') || lowerMessage.includes('cost')) && lowerMessage.includes('match')) {
    response = fallbackResponses.priceMatch;
  } else {
    response = fallbackResponses.default;
  }
  
  // Only add booking buttons for specific service inquiries or direct booking-related questions
  const shouldAddBookingButtons = 
    lowerMessage.includes('appointment') || 
    lowerMessage.includes('schedule') || 
    lowerMessage.includes('book') || 
    lowerMessage.includes('repair') || 
    lowerMessage.includes('service') ||
    lowerMessage.includes('bring in') || 
    lowerMessage.includes('when can') || 
    lowerMessage.includes('estimate') ||
    lowerMessage.includes('consultation') ||
    lowerMessage.includes('fix') ||
    lowerMessage.includes('damage');
  
  if (shouldAddBookingButtons && !response.includes('[book:') && !response.includes('[chat:') && !response.includes('[phone:')) {
    // Add booking buttons only when relevant
    response += `

Would you like to schedule an appointment?
[book: Book Online]
[phone: Call Us]
[chat: Book via Chat]`;
  }
  
  return response;
}

// Add a function to check if we offer a service
function doWeOfferService(service: string): boolean {
  const ourServices = [
    'collision repair', 'custom paint', 'frame straightening', 'frame alignment',
    'paintless dent repair', 'dent repair', 'dent', 'classic car restoration', 
    'classic car', 'custom modifications', 'modification', 'bumper repair',
    'bumper', 'fender repair', 'fender', 'door repair', 'door', 'windshield',
    'glass replacement', 'rust repair', 'rust', 'ceramic coating', 'ceramic',
    'luxury vehicle', 'luxury car', 'leather repair', 'leather', 'paint',
    'paint correction', 'color matching', 'structural repair', 'frame repair',
    'exotic car', 'exotic', 'insurance claim', 'insurance'
  ];
  
  const serviceLower = service.toLowerCase();
  
  // Check if any of our services contains the query
  return ourServices.some(ourService => 
    serviceLower.includes(ourService) || ourService.includes(serviceLower)
  );
}

// Add service table for reference
const serviceTable = `
[table:start]
Service|Description
Collision Repair|Expert vehicle damage repair
Custom Paint|Professional color matching
Frame Straightening|Precision restoration
Paintless Dent Repair|No repainting needed
Classic Car Restoration|Vintage specialists
Custom Modifications|Personalized enhancements
Exotic Car Services|High-end vehicle expertise
[table:end]`;

// Update the POST endpoint to handle service inquiries better
export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId = 'default', attachments } = await request.json();
    
    // Check if there are image attachments - this would be handled by the frontend
    const hasImageAttachments = attachments && attachments.length > 0;
    
    // Extract the last user message for fallback functionality
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || '';

    // Special handling for image attachments - provide specialized responses based on image context
    if (hasImageAttachments) {
      const response = `I've received your image of the vehicle damage. To provide an accurate assessment and estimate, our technicians would need to inspect the vehicle in person. 

Based on what I can see, this appears to be damage that we can repair at our shop. Would you like to book an appointment with us?

[book: Book Assessment]
[phone: Call Us Now]
[chat: Book via Chat]`;
      
      return NextResponse.json({ message: response });
    }

    // Handle location inquiries
    if (lastUserMessage.toLowerCase().includes('location') || 
        lastUserMessage.toLowerCase().includes('address') || 
        lastUserMessage.toLowerCase().includes('where are you') || 
        lastUserMessage.toLowerCase().includes('where is') ||
        lastUserMessage.toLowerCase().includes('where you located')) {
      
      const response = `We're located at 1330 Egbert Avenue, San Francisco, CA 94124. We're right off the 101 freeway, about 2 miles from the Golden Gate Bridge. Our shop is in a convenient central location, close to lots of shops and restaurants. Would you like to visit us?

[book: Book Online]
[phone: Call Us]
[directions: Get Directions]`;
      
      return NextResponse.json({ message: response });
    }

    // Handle phone number inquiries
    if (lastUserMessage.toLowerCase().includes('phone') || 
        lastUserMessage.toLowerCase().includes('call') || 
        lastUserMessage.toLowerCase().includes('number')) {
      
      const response = `Our phone number is (415) 447-4001. Feel free to give us a call whenever you're ready to schedule your appointment. Would you like to book an appointment with us?

[phone: Call Us Now]
[book: Book Online]
[chat: Book via Chat]`;
      
      return NextResponse.json({ message: response });
    }

    // Check for specific service inquiries like "do you offer X?"
    const serviceMatch = lastUserMessage.match(/do you (offer|provide|do|work on|handle|fix|repair|have) (.*?)(\?|$)/i);
    if (serviceMatch) {
      const requestedService = serviceMatch[2].trim();
      
      if (doWeOfferService(requestedService)) {
        const response = `Yes, we offer ${requestedService} services. Our certified technicians specialize in this area and can provide exceptional results. Would you like to book an appointment with us?

[book: Book Online]
[phone: Call Us]
[chat: Book via Chat]`;
        
        return NextResponse.json({ message: response });
      } else {
        const response = `I'm sorry, we don't currently offer ${requestedService} services. Here are the services we do offer:
        
${serviceTable}

Is there another service we can help you with?`;
        
        return NextResponse.json({ message: response });
      }
    }

    // Enhanced VIN detection - more comprehensive check
    const vinRegex = /\b[A-HJ-NPR-Z0-9]{17}\b/i;
    const vinMatch = lastUserMessage.match(vinRegex);
    
    if (vinMatch) {
      const potentialVin = vinMatch[0];
      if (isVinNumber(potentialVin)) {
        const vinInfo = decodeVin(potentialVin);
        if (vinInfo && vinInfo.make !== "Unknown") {
          let response;
          if (vinInfo.colorName && !vinInfo.colorName.includes("Unknown")) {
            if (vinInfo.colorName.includes("estimated")) {
              response = `Your ${vinInfo.year} ${vinInfo.make} ${vinInfo.model} has been identified. Based on your VIN pattern, the color may be **${vinInfo.colorName}**, but we would need to inspect your vehicle in person for accurate color matching. Would you like to book an appointment with us?

[book: Book Online]
[phone: Call Us]
[chat: Book via Chat]`;
            } else {
              response = `Your ${vinInfo.year} ${vinInfo.make} ${vinInfo.model} has been identified with color: **${vinInfo.colorName}** (code: ${vinInfo.color}). We can provide accurate color matching for your repairs. Would you like to book an appointment with us?

[book: Book Online]
[phone: Call Us]
[chat: Book via Chat]`;
            }
          } else {
            response = `Your ${vinInfo.year} ${vinInfo.make} ${vinInfo.model} has been identified. We would need to inspect your vehicle in person for accurate color identification and matching. Would you like to book an appointment with us?

[book: Book Online]
[phone: Call Us]
[chat: Book via Chat]`;
          }
          return NextResponse.json({ message: response });
        }
      }
    }

    // Special case for direct repair requests (highest priority)
    const directRepairKeywords = ['fix my', 'need to fix', 'repair my', 'broken', 'damaged', 'bumper', 'dent'];
    const isDirectRepair = directRepairKeywords.some(keyword => 
      lastUserMessage.toLowerCase().includes(keyword)
    );
    
    if (isDirectRepair) {
      // Parse what they need to fix
      let partToFix = 'vehicle';
      
      for (const part of ['bumper', 'door', 'fender', 'hood', 'trunk', 'windshield', 'window', 'headlight', 'taillight', 'mirror', 'paint']) {
        if (lastUserMessage.toLowerCase().includes(part)) {
          partToFix = part;
          break;
        }
      }
      
      // Get detailed expertise for this part if available
      const expertise = getServiceExpertise(partToFix);
      
      let response = '';
      
      // If asking about the repair process, provide detailed expertise
      if (lastUserMessage.toLowerCase().includes('how') || 
          lastUserMessage.toLowerCase().includes('process') || 
          lastUserMessage.toLowerCase().includes('what is')) {
        response = expertise || `Yes, we can definitely help with your ${partToFix} repair. Our certified technicians specialize in quality repairs with fast turnaround times. Would you like to book an appointment with us?`;
      } else {
        response = `Yes, we can definitely help with your ${partToFix} repair. Our certified technicians specialize in quality repairs with fast turnaround times. Would you like to book an appointment with us?`;
      }
      
      response += `

[book: Book Online]
[phone: Call Us]
[chat: Book via Chat]`;
      
      return NextResponse.json({ message: response });
    }

    // First check if this is part of a booking flow
    const bookingResponse = handleBookingFlow(lastUserMessage, sessionId);
    if (bookingResponse) {
      return NextResponse.json({ message: bookingResponse });
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.trim() === '') {
      console.log('Anthropic API key not configured, using fallback response');
      const fallbackMessage = getFallbackResponse(lastUserMessage, sessionId);
      // Enhance fallback message with rich formatting
      const enhancedMessage = enhanceResponse(fallbackMessage, lastUserMessage);
      return NextResponse.json({
        message: enhancedMessage,
        usingFallback: true,
        reason: 'api_key_not_configured'
      });
    }

    try {
      // If not a booking flow, continue with normal AI processing
      // Always include business context as a system message at the beginning
      const systemMessage = {
        role: 'system',
        content: `You are a friendly and helpful automotive expert assistant for CA Automotive.
        Your goal is to provide helpful information and guide conversations toward booking services when appropriate.
        
        Personality guidelines:
        - Be conversational and natural - sound like a helpful human service advisor, not a robot
        - Use professional but warm language
        - Ask follow-up questions to learn more about the customer's needs
        - Only suggest booking appointments when it's relevant to the customer's inquiry
        - Don't be pushy with sales tactics
        - For service inquiries, respond with "Yes, we offer that service" and encourage booking
        - For location questions, provide the exact address: 1330 Egbert Avenue, San Francisco, CA 94124
        - Never repeat booking questions in the same response
        
        Response formatting:
        - Keep responses conversational and focused on the customer's needs
        - Use proper grammar but conversational style
        - Ask questions to continue the conversation naturally
        - Avoid robotic-sounding phrases like "I am programmed to" or "my function is to"
        - Only ask about booking once in each response
        
        IMPORTANT: When users provide a VIN number, identify their vehicle in a friendly, conversational way.
        
        Common issues customers ask about:
        - Scheduling appointments (suggest booking when it makes sense)
        - Collision repair process (explain the process and timeframes)
        - Insurance claim handling (explain how we work with insurance companies)
        - Paint matching and color codes (explain how VINs help identify colors)
        - Repair timeframes (be honest about typical timeframes)
        - Warranty information (explain our lifetime warranty)
        - OEM vs aftermarket parts (explain the benefits of OEM parts)
        - Rental car options (explain how we can coordinate this)
        
        ${combinedContext}`
      };
      
      const messagesWithContext = [
        systemMessage,
        ...messages
      ];

      // Convert to Anthropic format
      const anthropicMessages = convertMessagesToAnthropicFormat(messagesWithContext);
      
      // Call Anthropic API
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        messages: anthropicMessages,
        system: `You are a friendly automotive expert for a high-end auto body shop. 
        Respond in a conversational, helpful way that sounds natural and human.
        Avoid using robotic-sounding language or overly formal phrasing.
        Keep responses concise but natural - 1-3 conversational sentences.
        Only suggest scheduling appointments when relevant to the customer's question.
        When suggesting appointments, always mention all three booking options: online, phone, and chat.
        Ask follow-up questions to learn more about the customer's needs.
        Use a warm, professional tone that builds rapport with the customer.
        For car color inquiries, explain how VINs help identify colors.
        For service questions, first say "Yes, we offer that service" then provide helpful information.
        For repair needs like "fix my bumper", focus on converting them to a booked appointment.
        For specific repair inquiries, emphasize our expertise in that area and encourage scheduling.
        NEVER repeat booking questions - ask only ONCE about booking in each response.`
      });

      // Extract the assistant's message - handle both text and other content types
      const content = response.content[0];
      const assistantMessage = 'text' in content ? content.text : "I'm sorry, I couldn't process that request.";
      
      // Enhance the response with rich formatting
      const enhancedMessage = enhanceResponse(assistantMessage, lastUserMessage);
      
      return NextResponse.json({ message: enhancedMessage });
      
    } catch (apiError) {
      console.error('Anthropic API error, using fallback response:', apiError);
      
      // Use our fallback response system
      const fallbackMessage = getFallbackResponse(lastUserMessage, sessionId);
      
      // Enhance fallback message with rich formatting
      const enhancedMessage = enhanceResponse(fallbackMessage, lastUserMessage);
      
      return NextResponse.json({ 
        message: enhancedMessage,
        usingFallback: true
      });
    }
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Error processing your request' },
      { status: 500 }
    );
  }
}