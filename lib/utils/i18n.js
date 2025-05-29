// Supported languages as defined in BUILD_REQUIREMENTS.md
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  cs: 'Čeština',
  bg: 'Български',
  ru: 'Русский',
  uk: 'Українська'
};

export const DEFAULT_LANGUAGE = 'en';

// Get translated name from object with multiple language versions
export function getTranslatedName(nameObject, locale = DEFAULT_LANGUAGE) {
  if (!nameObject || typeof nameObject !== 'object') return '';
  
  // Try requested locale first
  if (nameObject[locale]) return nameObject[locale];
  
  // Fallback to English
  if (nameObject[DEFAULT_LANGUAGE]) return nameObject[DEFAULT_LANGUAGE];
  
  // Fallback to first available language
  const firstAvailable = Object.values(nameObject).find(name => name);
  return firstAvailable || '';
}

// Currency configuration
export const SUPPORTED_CURRENCIES = {
  CZK: { symbol: 'Kč', rate: 1, position: 'after' },
  EUR: { symbol: '€', rate: 0.041, position: 'before' } // Dynamic rate from API
};

export const DEFAULT_CURRENCY = 'CZK';

// Format price with currency
export function formatPrice(amount, currency = DEFAULT_CURRENCY) {
  const currencyConfig = SUPPORTED_CURRENCIES[currency];
  if (!currencyConfig) return `${amount} ${currency}`;
  
  const formattedAmount = new Intl.NumberFormat('cs-CZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  
  if (currencyConfig.position === 'before') {
    return `${currencyConfig.symbol}${formattedAmount}`;
  } else {
    return `${formattedAmount} ${currencyConfig.symbol}`;
  }
}

// Format date based on locale
export function formatDate(date, locale = DEFAULT_LANGUAGE) {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const formatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  
  return new Intl.DateTimeFormat(locale === 'cs' ? 'cs-CZ' : 'en-GB', formatOptions).format(dateObj);
}

// Format time
export function formatTime(date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleTimeString('cs-CZ', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}

// Calculate and format duration between two dates
export function formatDuration(startDate, endDate) {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  
  const diffMs = end - start;
  const diffMins = Math.round(diffMs / (1000 * 60));
  
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
}

// Get browser language or default
export function getBrowserLanguage() {
  if (typeof window !== 'undefined') {
    const lang = navigator.language.split('-')[0];
    return SUPPORTED_LANGUAGES[lang] ? lang : DEFAULT_LANGUAGE;
  }
  return DEFAULT_LANGUAGE;
} 