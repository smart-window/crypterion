import * as Actions from "redux/actions/Auth";


export const initAuth = {
	user                 : {},
	signInFormVisibility : false,
	signUpFormVisibility : false,
	superAdminRole       : 'super_admin'
};

const auth = (state = initAuth, action) => {
	switch (action.type) {
		case Actions.SET_AUTH_USER:
			return {
				...state,
				user : action.payload
			};
		case Actions.SIGNUP_FORM_VISIBILITY:
			return {
				...state,
				signUpFormVisibility : action.value
			};
		case Actions.SIGNIN_FORM_VISIBILITY:
			return {
				...state,
				signInFormVisibility : action.value
			};

		default:
			return state;
	}
};

export default auth;