/**
 * Machine Translation Utility
 * 
 * This utility provides functions for automatic translation of content
 * using external translation APIs. Currently supports translation between
 * English and Spanish.
 */

// Note: In a production environment, you would use a paid service with API key
// For this implementation, we'll use a simple mock that could be replaced with
// actual API calls to Google Translate or DeepL

/**
 * Translate text from one language to another
 * @param text The text to translate
 * @param sourceLanguage The source language code (e.g., 'en')
 * @param targetLanguage The target language code (e.g., 'es')
 * @returns Promise resolving to the translated text
 */
export async function translateText(
  text: string,
  sourceLanguage: string = 'en',
  targetLanguage: string = 'es'
): Promise<string> {
  // In a real implementation, this would call a translation API
  // For now, we'll use a simple dictionary for common phrases
  if (sourceLanguage === 'en' && targetLanguage === 'es') {
    return translateEnglishToSpanish(text);
  } else if (sourceLanguage === 'es' && targetLanguage === 'en') {
    return translateSpanishToEnglish(text);
  } else {
    console.warn(`Translation from ${sourceLanguage} to ${targetLanguage} not supported`);
    return text; // Return original text if translation pair not supported
  }
}

/**
 * Batch translate multiple texts
 * @param texts Array of texts to translate
 * @param sourceLanguage The source language code
 * @param targetLanguage The target language code
 * @returns Promise resolving to array of translated texts
 */
export async function batchTranslate(
  texts: string[],
  sourceLanguage: string = 'en',
  targetLanguage: string = 'es'
): Promise<string[]> {
  // In a real implementation, this would batch API calls for efficiency
  const translations = await Promise.all(
    texts.map(text => translateText(text, sourceLanguage, targetLanguage))
  );
  return translations;
}

/**
 * Translate an object with string values
 * @param obj Object with string values to translate
 * @param sourceLanguage The source language code
 * @param targetLanguage The target language code
 * @returns Promise resolving to object with translated values
 */
export async function translateObject<T extends Record<string, string>>(
  obj: T,
  sourceLanguage: string = 'en',
  targetLanguage: string = 'es'
): Promise<T> {
  const keys = Object.keys(obj);
  const values = Object.values(obj);
  
  const translatedValues = await batchTranslate(values, sourceLanguage, targetLanguage);
  
  const translatedObj = {} as T;
  keys.forEach((key, index) => {
    translatedObj[key as keyof T] = translatedValues[index] as any;
  });
  
  return translatedObj;
}

// Simple English to Spanish translation dictionary
function translateEnglishToSpanish(text: string): string {
  const dictionary: Record<string, string> = {
    // Common navigation items
    'Home': 'Inicio',
    'About': 'Nosotros',
    'Services': 'Servicios',
    'Gallery': 'Galería',
    'Contact': 'Contacto',
    'Book Now': 'Reservar Ahora',
    
    // Gallery related
    'Our Gallery': 'Nuestra Galería',
    'View More': 'Ver Más',
    'All': 'Todos',
    'No gallery items found.': 'No se encontraron elementos en la galería.',
    'Loading gallery items...': 'Cargando elementos de la galería...',
    
    // Services related
    'Our Services': 'Nuestros Servicios',
    'Collision Repair': 'Reparación de Colisiones',
    'Custom Paint': 'Pintura Personalizada',
    'Vehicle Restoration': 'Restauración de Vehículos',
    'Vehicle Detailing': 'Detallado de Vehículos',
    
    // Other common phrases
    'Submit': 'Enviar',
    'Cancel': 'Cancelar',
    'Learn More': 'Saber Más',
    'Read More': 'Leer Más',
    'Previous': 'Anterior',
    'Next': 'Siguiente',
    'Loading...': 'Cargando...',
    'Error': 'Error',
    'Success': 'Éxito',
    'Save': 'Guardar',
    'Delete': 'Eliminar',
    'Edit': 'Editar',
    'Add': 'Agregar',
    'Remove': 'Quitar',
  };
  
  // Check for exact matches in dictionary
  if (dictionary[text]) {
    return dictionary[text];
  }
  
  // For longer texts, apply word-by-word translation with simple rules
  // This is a very basic implementation - a real solution would use a proper API
  let translatedText = text;
  
  // Replace dictionary words maintaining case
  Object.entries(dictionary).forEach(([en, es]) => {
    // Case-insensitive replacement with case preservation
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    translatedText = translatedText.replace(regex, match => {
      if (match === match.toLowerCase()) return es.toLowerCase();
      if (match === match.toUpperCase()) return es.toUpperCase();
      if (match[0] === match[0].toUpperCase()) {
        return es[0].toUpperCase() + es.slice(1);
      }
      return es;
    });
  });
  
  return translatedText;
}

// Simple Spanish to English translation dictionary (reverse of above)
function translateSpanishToEnglish(text: string): string {
  const dictionary: Record<string, string> = {
    'Inicio': 'Home',
    'Nosotros': 'About',
    'Servicios': 'Services',
    'Galería': 'Gallery',
    'Contacto': 'Contact',
    'Reservar Ahora': 'Book Now',
    
    'Nuestra Galería': 'Our Gallery',
    'Ver Más': 'View More',
    'Todos': 'All',
    'No se encontraron elementos en la galería.': 'No gallery items found.',
    'Cargando elementos de la galería...': 'Loading gallery items...',
    
    'Nuestros Servicios': 'Our Services',
    'Reparación de Colisiones': 'Collision Repair',
    'Pintura Personalizada': 'Custom Paint',
    'Restauración de Vehículos': 'Vehicle Restoration',
    'Detallado de Vehículos': 'Vehicle Detailing',
    
    'Enviar': 'Submit',
    'Cancelar': 'Cancel',
    'Saber Más': 'Learn More',
    'Leer Más': 'Read More',
    'Anterior': 'Previous',
    'Siguiente': 'Next',
    'Cargando...': 'Loading...',
    'Error': 'Error',
    'Éxito': 'Success',
    'Guardar': 'Save',
    'Eliminar': 'Delete',
    'Editar': 'Edit',
    'Agregar': 'Add',
    'Quitar': 'Remove',
  };
  
  // Check for exact matches in dictionary
  if (dictionary[text]) {
    return dictionary[text];
  }
  
  // Apply word-by-word translation
  let translatedText = text;
  
  // Replace dictionary words maintaining case
  Object.entries(dictionary).forEach(([es, en]) => {
    const regex = new RegExp(`\\b${es}\\b`, 'gi');
    translatedText = translatedText.replace(regex, match => {
      if (match === match.toLowerCase()) return en.toLowerCase();
      if (match === match.toUpperCase()) return en.toUpperCase();
      if (match[0] === match[0].toUpperCase()) {
        return en[0].toUpperCase() + en.slice(1);
      }
      return en;
    });
  });
  
  return translatedText;
} 