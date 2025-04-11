/**
 * Machine Translation Utility
 * 
 * This module provides machine translation functionality for the application.
 * It currently uses a simple dictionary replacement approach for common phrases,
 * but can be extended to use actual translation APIs in production.
 */

// Simple translation dictionary for common phrases (English to Spanish)
const EN_TO_ES = {
  // Common words
  'and': 'y',
  'or': 'o',
  'the': 'el',
  'a': 'un',
  'an': 'un',
  'of': 'de',
  'in': 'en',
  'with': 'con',
  'for': 'para',
  'to': 'a',
  'from': 'desde',
  'on': 'en',
  'at': 'en',
  'by': 'por',
  
  // Navigation
  'home': 'inicio',
  'about': 'acerca de',
  'contact': 'contacto',
  'services': 'servicios',
  'gallery': 'galería',
  
  // Common website text
  'view': 'ver',
  'read more': 'leer más',
  'learn more': 'más información',
  'explore': 'explorar',
  'book now': 'reservar ahora',
  'contact us': 'contáctenos',
  'email': 'correo electrónico',
  'phone': 'teléfono',
  'address': 'dirección',
  'search': 'buscar',
  'submit': 'enviar',
  'menu': 'menú',
  'close': 'cerrar',
  
  // Car-related terms
  'repair': 'reparación',
  'service': 'servicio',
  'maintenance': 'mantenimiento',
  'car': 'automóvil',
  'vehicle': 'vehículo',
  'auto': 'auto',
  'body': 'carrocería',
  'paint': 'pintura',
  'dent': 'abolladuras',
  'restoration': 'restauración',
  'collision': 'colisión',
  'damage': 'daño',
  'luxury': 'lujo',
};

// Spanish to English is the reverse mapping
const ES_TO_EN = Object.fromEntries(
  Object.entries(EN_TO_ES).map(([key, value]) => [value, key])
);

/**
 * Translates a text from one language to another
 * @param {string} text - The text to translate
 * @param {string} fromLang - The source language code (e.g., 'en')
 * @param {string} toLang - The target language code (e.g., 'es')
 * @returns {Promise<string>} - The translated text
 */
export async function translateText(text, fromLang = 'en', toLang = 'es') {
  // In a production environment, this would call an actual translation API
  // For now, we use a simple dictionary approach
  
  if (fromLang === 'en' && toLang === 'es') {
    return translateWithDictionary(text, EN_TO_ES);
  }
  
  if (fromLang === 'es' && toLang === 'en') {
    return translateWithDictionary(text, ES_TO_EN);
  }
  
  // If no translation is available, return the original text
  console.warn(`Translation from ${fromLang} to ${toLang} is not supported yet.`);
  return text;
}

/**
 * Translates a batch of texts at once
 * @param {string[]} texts - Array of texts to translate
 * @param {string} fromLang - The source language code
 * @param {string} toLang - The target language code
 * @returns {Promise<string[]>} - Array of translated texts
 */
export async function batchTranslate(texts, fromLang = 'en', toLang = 'es') {
  const results = [];
  
  for (const text of texts) {
    const translated = await translateText(text, fromLang, toLang);
    results.push(translated);
  }
  
  return results;
}

/**
 * Translates all string values in an object
 * @param {Object} obj - The object with string values to translate
 * @param {string} fromLang - The source language code
 * @param {string} toLang - The target language code
 * @returns {Promise<Object>} - Object with translated values
 */
export async function translateObject(obj, fromLang = 'en', toLang = 'es') {
  const result = { ...obj };
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = await translateText(value, fromLang, toLang);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = await translateObject(value, fromLang, toLang);
    }
  }
  
  return result;
}

/**
 * Helper function to translate text using a dictionary
 * @private
 */
function translateWithDictionary(text, dictionary) {
  // Simple word replacement that maintains case
  let translated = text;
  
  // Create a regex that matches whole words in the dictionary
  const wordBoundaries = Object.keys(dictionary).map(word => `\\b${word}\\b`).join('|');
  const regex = new RegExp(wordBoundaries, 'gi');
  
  // Replace each matched word with its translation, maintaining case
  translated = translated.replace(regex, match => {
    const lowerMatch = match.toLowerCase();
    const replacement = dictionary[lowerMatch];
    
    // Maintain the case of the original word
    if (match === match.toUpperCase()) {
      return replacement.toUpperCase();
    }
    if (match[0] === match[0].toUpperCase()) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    return replacement;
  });
  
  return translated;
} 