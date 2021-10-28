import {all} from "redux-saga/effects";
import settingsSagas from './Settings';

function* rootSaga() {
	yield all([
		settingsSagas(),
	]);
}

export default rootSaga;