import * as Actions from "installer/redux/actions/Settings";

export const initSettings = {
	// Locale Settings
	localeData    : {locale : 'en', messages : {}},
};

const settings = (state = initSettings, action) => {
	switch (action.type) {
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
		default:
			return state;
	}
};

export default settings;
