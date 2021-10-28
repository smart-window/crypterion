import React, {Component} from "react";
import {pipe} from "admin/support/utils/common";
import CustomRedirect from "admin/components/CustomRedirect";
import PageNotFound from "admin/components/PageNotFound";
import lazy from "admin/support/common/lazy";
import {Route, Switch, withRouter} from "react-router-dom";
import PageBreadcrumb from "admin/components/PageBreadcrumb";
import ProtectedRoute from "admin/components/ProtectedRoute";

const Home = lazy(() => import(/* webpackPrefetch: true */ './home'));
const Wallets = lazy(() => import(/* webpackPrefetch: true */ './wallets'));
const Roles = lazy(() => import(/* webpackPrefetch: true */ './roles'));
const Users = lazy(() => import(/* webpackPrefetch: true */ './users'));
const Settings = lazy(() => import(/* webpackPrefetch: true */ './settings'));
const Platform = lazy(() => import(/* webpackPrefetch: true */ './platform'));

class Routes extends Component {
	render() {
		const path = "/admin";
		return (
			<div className="cp-main-content-wrapper">
				<PageBreadcrumb/>
				<Switch>
					<CustomRedirect from={`${path}/`} to={`${path}/home`} exact status={301}/>
					<Route path={`${path}/home`} component={Home}/>
					<ProtectedRoute path={`${path}/wallets`} component={Wallets} can="manage_wallets"/>
					<ProtectedRoute path={`${path}/roles`} component={Roles} can="manage_user_roles"/>
					<ProtectedRoute path={`${path}/users`} component={Users} can="manage_users"/>
					<ProtectedRoute path={`${path}/settings`} component={Settings} can="manage_settings"/>
					<ProtectedRoute path={`${path}/platform`} component={Platform}/>
					<Route component={PageNotFound}/>
				</Switch>
			</div>
		);
	}
}

export default pipe(
	withRouter
)(Routes);



