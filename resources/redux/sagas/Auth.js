import * as Actions from "../actions/Auth";
import Auth from "support/Auth";
import {all, call, fork, put, select, takeLatest} from "redux-saga/effects";
import {axios, route} from "support/Services/Api";


function fetchAuthUser(){
	return axios.post(route('user.auth').url());
}

function* watchFetchAuthUser(){
	yield takeLatest(Actions.FETCH_AUTH_USER, function* () {
		try{
			const response = yield call(fetchAuthUser);
			yield put(Actions.setAuthUser(response.data));
		}catch(e){
			console.log(e);
		}
	})
}

function* watchSetAuthUser() {
	yield takeLatest(Actions.SET_AUTH_USER, function* ({payload}) {
		try{
			if(typeof localStorage !== "undefined"){
				localStorage.setItem('auth.user', JSON.stringify(payload))
			}
		}catch(e){
			console.log(e);
		}
	})
}

function* getAuth() {
	const state = yield select();
	return new Auth(state.auth);
}

// SignIn
function* watchShowSignInForm(){
	yield takeLatest(Actions.SHOW_SIGNIN_FORM, function* () {
		try{
			const auth = yield call(getAuth);

			if(!auth.check()){
				yield put(Actions.signInFormVisibility(true))
			}
		}catch(e){
			console.log(e);
		}
	})
}

function* watchHideSignInForm(){
	yield takeLatest(Actions.HIDE_SIGNIN_FORM, function* () {
		try{
			yield put(Actions.signInFormVisibility(false))
		}catch(e){
			console.log(e);
		}
	})
}

// SignUp
function* watchShowSignUpForm(){
	yield takeLatest(Actions.SHOW_SIGNUP_FORM, function* () {
		try{
			const auth = yield call(getAuth);

			if(!auth.check()) {
				yield put(Actions.signUpFormVisibility(true))
			}
		}catch(e){
			console.log(e);
		}
	})
}

function* watchHideSignUpForm(){
	yield takeLatest(Actions.HIDE_SIGNUP_FORM, function* () {
		try{
			const params = new URLSearchParams(location.search);

			if(params.has('signup')){
				window.history.replaceState({}, document.title, window.location.pathname);
			}

			yield put(Actions.signUpFormVisibility(false));
		}catch(e){
			console.log(e);
		}
	})
}
export default function* rootSaga() {
	yield all([
		fork(watchFetchAuthUser),
		// fork(watchSetAuthUser),
		fork(watchShowSignInForm),
		fork(watchHideSignInForm),
		fork(watchShowSignUpForm),
		fork(watchHideSignUpForm)
	]);
}