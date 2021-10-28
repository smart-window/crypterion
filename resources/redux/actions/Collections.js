// export const SET_PRICES = 'SET_PRICES';

// Countries
export const FETCH_COUNTRIES = 'FETCH_COUNTRIES';
export function fetchCountries() {
	return {type: FETCH_COUNTRIES};
}

export const SET_COUNTRIES = 'SET_COUNTRIES';
export function setCountries(payload) {
	return {type: SET_COUNTRIES, payload};
}

// Marketplace Tags
export const FETCH_MARKETPLACE_TAGS = 'FETCH_MARKETPLACE_TAGS';
export function fetchMarketplaceTags() {
	return {type: FETCH_MARKETPLACE_TAGS};
}

export const SET_MARKETPLACE_TAGS = 'SET_MARKETPLACE_TAGS';
export function setMarketplaceTags(payload) {
	return {type: SET_MARKETPLACE_TAGS, payload};
}

// Coins
export const FETCH_COINS = 'FETCH_COINS';
export function fetchCoins() {
	return {type: FETCH_COINS};
}

export const SET_COINS = 'SET_COINS';
export function setCoins(payload) {
	return {type: SET_COINS, payload};
}

// Wallets
export const FETCH_WALLETS = 'FETCH_WALLETS';
export function fetchWallets() {
	return {type: FETCH_WALLETS};
}

export const SET_WALLETS = 'SET_WALLETS';
export function setWallets(payload) {
	return {type: SET_WALLETS, payload};
}

// Currencies
export const FETCH_CURRENCIES = 'FETCH_CURRENCIES';
export function fetchCurrencies() {
	return {type: FETCH_CURRENCIES};
}

export const SET_CURRENCIES = 'SET_CURRENCIES';
export function setCurrencies(payload) {
	return {type: SET_CURRENCIES, payload};
}

// Payment Methods
export const FETCH_PAYMENT_METHODS = 'FETCH_PAYMENT_METHODS';
export function fetchPaymentMethods() {
	return {type: FETCH_PAYMENT_METHODS};
}

export const SET_PAYMENT_METHODS = 'SET_PAYMENT_METHODS';
export function setPaymentMethods(payload) {
	return {type: SET_PAYMENT_METHODS, payload};
}