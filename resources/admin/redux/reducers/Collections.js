import * as Actions from "admin/redux/actions/Collections";

export const initCollections = {
	currencies      : {},
	prices          : [],
	marketplaceTags : [],
	coins           : [],
	wallets         : [],
	paymentMethods  : [],
	countries       : {},
};

const collections = (state = initCollections, action) => {
	switch (action.type) {
		case Actions.SET_CURRENCIES:
			return {
				...state,
				currencies : action.payload
			};

		case  Actions.SET_MARKETPLACE_TAGS:
			return {
				...state,
				marketplaceTags : action.payload
			};

		case  Actions.SET_COINS:
			return {
				...state,
				coins : action.payload
			};

		case  Actions.SET_WALLETS:
			return {
				...state,
				wallets : action.payload
			};

		case  Actions.SET_PAYMENT_METHODS:
			return {
				...state,
				paymentMethods : action.payload
			};

		case  Actions.SET_COUNTRIES:
			return {
				...state,
				countries : action.payload
			};

		default:
			return state;
	}
};

export default collections;