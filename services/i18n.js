import en from '../locales/en.json';
import es from '../locales/es.json';

let LOCALES = {
  en,
  es
};

let locale = 'en';

export function setLocale(l) {
  if (LOCALES[l]) locale = l;
}

export function getLocale() {
  return locale;
}

// Simple translator with interpolation and basic pluralization.
export default function t(key, vars = {}) {
  let str = (LOCALES[locale] && LOCALES[locale][key]) || key;

  if (typeof str !== 'string') return key;

  // basic pluralization using 'singular|plural' syntax
  if (vars && typeof vars.count !== 'undefined' && str.includes('|')) {
    const parts = str.split('|');
    str = (vars.count === 1) ? parts[0] : parts[1];
  }

  // interpolation for {var} placeholders
  Object.keys(vars || {}).forEach(k => {
    const re = new RegExp(`\\{${k}\\}`, 'g');
    str = str.replace(re, String(vars[k]));
  });

  return str;
}
