import {all, call, fork, put, takeLatest} from "redux-saga/effects";
import * as Actions from "../actions/Wallet";
import {handleError} from "support/utils/promise";
import {axios, route} from "support/Services/Api";


function fetchAccounts() {
	return axios.post(route('user.wallet-account.list').url());
}

function* watchFetchAccounts() {
	yield takeLatest(Actions.FETCH_ACCOUNTS, function* () {
		try {
			yield put(Actions.startAccountsLoading());
			const response = yield call(fetchAccounts);
			let data = response.data;

			if (typeof data === 'object') {
				yield put(Actions.setAccounts(data));
			}

			yield put(Actions.stopAccountsLoading());
		} catch (error) {
			handleError(error);
			yield put(Actions.stopAccountsLoading());
		}
	})
}

export default function* rootSaga() {
	yield all([
		fork(watchFetchAccounts),
	]);
}