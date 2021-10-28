// User
export const SET_AUTH_USER = 'SET_AUTH_USER';
export const FETCH_AUTH_USER = 'FETCH_AUTH_USER';

export function setAuthUser(user) {
	return {type: SET_AUTH_USER, payload: user}
}

export function fetchAuthUser() {
	return {type: FETCH_AUTH_USER}
}

// SignIn
export const SHOW_SIGNIN_FORM = 'SHOW_SIGNIN_FORM';
export const HIDE_SIGNIN_FORM = 'HIDE_SIGNIN_FORM';
export const SIGNIN_FORM_VISIBILITY = 'SIGNIN_FORM_VISIBILITY';

export function showSignInForm() {
	return {type: SHOW_SIGNIN_FORM}
}

export function hideSignInForm() {
	return {type: HIDE_SIGNIN_FORM}
}

export function signInFormVisibility(value) {
	return {type: SIGNIN_FORM_VISIBILITY, value}
}

// SignUp
export const SHOW_SIGNUP_FORM = 'SHOW_SIGNUP_FORM';
export const HIDE_SIGNUP_FORM = 'HIDE_SIGNUP_FORM';
export const SIGNUP_FORM_VISIBILITY = 'SIGNUP_FORM_VISIBILITY';


export function showSignUpForm() {
	return {type: SHOW_SIGNUP_FORM}
}

export function hideSignUpForm() {
	return {type: HIDE_SIGNUP_FORM}
}

export function signUpFormVisibility(value) {
	return {type: SIGNUP_FORM_VISIBILITY, value}
}