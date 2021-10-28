import React from 'react';
import AuthModel from "support/Auth";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";
import {Route, Switch} from "react-router-dom";
import CustomRedirect from "components/CustomRedirect";
import ResetPassword from "./components/resetPassword";

const Auth = ({auth, match}) => {
	if (auth.check()) {
		return <CustomRedirect to="/" status={302}/>;
	}

	const path = match.path;

	return (
		<Switch>
			<CustomRedirect from={`${path}/`} to={`${path}/reset_password`} exact status={301}/>
			<Route path={`${path}/reset_password`} component={ResetPassword}/>
		</Switch>
	);
};

const mapStateToProps = ({
	auth
}) => ({
	auth : new AuthModel(auth)
});

export default pipe(
	connect(
		mapStateToProps
	),
)(Auth);

if (module.hot) {
	module.hot.accept()
}