import React from 'react';
import CustomRedirect from "admin/components/CustomRedirect";
import {Route, Switch} from "react-router-dom";
import Login from "./components/login"

const Auth = () => {
	const path = "/admin";

	return (
		<Switch>
			<Route path={`${path}/login`} component={Login}/>
			<CustomRedirect to={`${path}/login`} status={301}/>
		</Switch>
	);
};

export default Auth;