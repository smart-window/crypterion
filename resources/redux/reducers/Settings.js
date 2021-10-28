import * as Actions from "redux/actions/Settings";
import * as ThemeSettings from "constants/ThemeSettings";

export const initSettings = {
	// Window Size
	windowSize    : {width : 1200, height : 900},
	// Grid Spacing
	gridSpacing   : {xs : 8, sm : 16, md : 24},
	// Nav Settings
	navStyle      : ThemeSettings.NAV_STYLE_VERTICAL_MINI_SIDEBAR,
	navCollapsed  : true,
	// Theme Type
	themeType     : ThemeSettings.THEME_TYPE_LITE,
	// Layout Settings
	layoutType    : ThemeSettings.LAYOUT_TYPE_FULL,
	// Google ReCAPTCHA
	recaptcha     : {enable : false, sitekey : '', type : 'normal'},
	// Locale Settings
	localeData    : {locale : 'en', messages : {}},
	// Color Palettes
	colorPalettes : {}
};

const settings = (state = initSettings, action) => {
	switch (action.type) {
		case Actions.SET_WINDOW_SIZE:
			return {
				...state,
				windowSize : action.payload,
			};
		case Actions.TOGGLE_NAV_MENU:
			return {
				...state,
				navCollapsed : action.navCollapsed
			};
		case Actions.SET_THEME_TYPE:
			return {
				...state,
				themeType : action.themeType
			};
		case Actions.SET_NAV_STYLE:
			return {
				...state,
				navStyle : action.navStyle
			};
		case Actions.SET_LAYOUT_TYPE:
			return {
				...state,
				layoutType : action.layoutType
			};
		case Actions.SET_LOCALE_DATA:
			return {
				...state,
				localeData : action.payload,
			};
		case Actions.SET_SUPPORTED_LOCALES:
			return {
				...state,
				supportedLocales : action.payload,
			};
		case Actions.SET_RECAPTCHA_DATA:
			return {
				...state,
				recaptcha : action.payload
			};
		default:
			return state;
	}
};

export default settings;
