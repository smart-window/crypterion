import {all} from "redux-saga/effects";
import authSagas from './Auth';
import collectionsSaga from './Collections';
import settingsSagas from './Settings';

function* rootSaga() {
	yield all([
		authSagas(),
		collectionsSaga(),
		settingsSagas(),
	]);
}

export default rootSaga;