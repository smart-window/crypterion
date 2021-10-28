// Navigation
export const TOGGLE_NAV_MENU = 'TOGGLE_NAV_MENU';
export const SET_WINDOW_SIZE = 'SET_WINDOW_SIZE';
export const SET_NAV_STYLE = 'SET_NAV_STYLE';

export function updateWindowSize(width, height) {
  return {type: SET_WINDOW_SIZE, payload: {width, height}};
}

export function toggleNavMenu(navCollapsed) {
  return {type: TOGGLE_NAV_MENU, navCollapsed};
}

// Theme
export const SET_THEME_TYPE = 'THEME_TYPE';

export function setThemeType(themeType) {
  return {type: SET_THEME_TYPE, themeType};
}

export function setNavStyle(navStyle) {
  return {type: SET_NAV_STYLE, navStyle};
}

// Layout
export const SET_LAYOUT_TYPE = 'SET_LAYOUT_TYPE';

export function setLayoutType(layoutType) {
  return {type: SET_LAYOUT_TYPE, layoutType};
}

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

// Recaptcha

export const SET_RECAPTCHA_DATA = 'SET_RECAPTCHA_DATA';

export function setRecaptchaData(recaptcha) {
  return {type: SET_RECAPTCHA_DATA, payload: recaptcha}
}
