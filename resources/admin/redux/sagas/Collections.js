import {all, call, fork, put, takeLatest} from "redux-saga/effects";
import * as Actions from "../actions/Collections";
import {handleError} from "admin/support/utils/promise";
import {axios, route} from "admin/support/Services/Api";


function fetchCountries() {
	return axios.get(route('collections.countries').url());
}

function* watchFetchCountries() {
	yield takeLatest(Actions.FETCH_COUNTRIES, function* () {
		try {
			const response = yield call(fetchCountries);
			let data = response.data;

			if (typeof data === 'object') {
				yield put(Actions.setCountries(data));
			}
		} catch (error) {
			handleError(error);
		}
	})
}

function fetchCoins() {
	return axios.get(route('collections.coins').url());
}

function* watchFetchCoins() {
	yield takeLatest(Actions.FETCH_COINS, function* () {
		try {
			const response = yield call(fetchCoins);
			let data = response.data;

			if (typeof data === 'object') {
				yield put(Actions.setCoins(data));
			}
		} catch (error) {
			handleError(error);
		}
	})
}

function fetchWallets() {
	return axios.get(route('collections.wallets').url());
}

function* watchFetchWallets() {
	yield takeLatest(Actions.FETCH_WALLETS, function* () {
		try {
			const response = yield call(fetchWallets);
			let data = response.data;

			if (typeof data === 'object') {
				yield put(Actions.setWallets(data));
			}
		} catch (error) {
			handleError(error);
		}
	})
}

function fetchMarketplaceTags() {
	return axios.get(route('collections.marketplace-tags').url());
}

function* watchFetchMarketplaceTags() {
	yield takeLatest(Actions.FETCH_MARKETPLACE_TAGS, function* () {
		try {
			const response = yield call(fetchMarketplaceTags);
			let data = response.data;

			if (typeof data === 'object') {
				yield put(Actions.setMarketplaceTags(data));
			}
		} catch (error) {
			handleError(error);
		}
	})
}

function fetchCurrencies() {
	return axios.get(route('collections.currencies').url());
}

function* watchFetchCurrencies() {
	yield takeLatest(Actions.FETCH_CURRENCIES, function* () {
		try {
			const response = yield call(fetchCurrencies);
			let data = response.data;

			if (typeof data === 'object') {
				yield put(Actions.setCurrencies(data));
			}
		} catch (error) {
			handleError(error);
		}
	})
}


function fetchPaymentMethods() {
	return axios.get(route('collections.payment-methods').url());
}

function* watchFetchPaymentMethods() {
	yield takeLatest(Actions.FETCH_PAYMENT_METHODS, function* () {
		try {
			const response = yield call(fetchPaymentMethods);
			let data = response.data;

			if (typeof data === 'object') {
				yield put(Actions.setPaymentMethods(data));
			}
		} catch (error) {
			handleError(error);
		}
	})
}


export default function* rootSaga() {
	yield all([
		fork(watchFetchCountries),
		fork(watchFetchMarketplaceTags),
		fork(watchFetchCurrencies),
		fork(watchFetchCoins),
		fork(watchFetchWallets),
		fork(watchFetchPaymentMethods),
	]);
}