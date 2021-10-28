// Locale
export const SET_LOCALE_DATA = 'SET_LOCALE_DATA';
export const FETCH_LOCALE_DATA = 'FETCH_LOCALE_DATA';
export const SET_LOCALE = 'SET_LOCALE';
export const SET_SUPPORTED_LOCALES = 'SET_SUPPORTED_LOCALES';

export function setLocaleData(localeData) {
  return {type: SET_LOCALE_DATA, payload: localeData};
}

export function fetchLocaleData() {
  return {type: FETCH_LOCALE_DATA};
}

export function setLocale(locale) {
  return {type: SET_LOCALE, payload: locale};
}

export function setSupportedLocales(supportedLocales) {
  return {type: SET_SUPPORTED_LOCALES, payload: supportedLocales};
}
