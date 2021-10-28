import React from 'react';
import Trades from "./components/trades";
import PageNotFound from "components/PageNotFound";
import ProtectedRoute from "components/ProtectedRoute"
import Offers from "./components/offers";
import Auth from "../../support/Auth";
import Overview from "./components/overview";
import Contacts from "./components/contacts";
import Settings from "./components/settings";
import {Route, Switch} from "react-router-dom";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";


const Profile = ({match, auth}) => {
	const path = match.path;
	return (
		<Switch>
			<Route path={`${path}/`} exact component={Overview}/>
			<ProtectedRoute path={`${path}/contacts`}
			                fallbackCondition={auth.user.name === match.params.name}
			                can="manage_users" component={Contacts}/>
			<ProtectedRoute path={`${path}/settings`}
			                fallbackCondition={auth.user.name === match.params.name}
			                can="manage_users" component={Settings}/>
			<ProtectedRoute path={`${path}/trades`}
			                fallbackCondition={auth.user.name === match.params.name}
			                can="manage_users" component={Trades}/>
			<Route path={`${path}/offers`} component={Offers}/>
			<Route component={PageNotFound}/>
		</Switch>
	);
};

const mapStateToProps = ({
	auth
}) => ({
	auth : new Auth(auth)
});

export default pipe(
	connect(
		mapStateToProps
	)
)(Profile);

if (module.hot) {
	module.hot.accept()
}