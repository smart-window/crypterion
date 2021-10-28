import {all} from "redux-saga/effects";
import authSagas from './Auth';
import collectionsSaga from './Collections';
import walletSagas from './Wallet';
import settingsSagas from './Settings';

function* rootSaga() {
	yield all([
		authSagas(),
		collectionsSaga(),
		walletSagas(),
		settingsSagas(),
	]);
}

export default rootSaga;