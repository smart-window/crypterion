import React, {Component} from 'react';
import {Route, Switch, withRouter} from "react-router-dom";
import {pipe} from "admin/support/utils/common";
import ProtectedRoute from "admin/components/ProtectedRoute";
import Configuration from "./components/configuration";
import Marketplace from "./components/marketplace";
import Notification from "./components/notification";
import PageNotFound from "admin/components/PageNotFound";
import CustomRedirect from "admin/components/CustomRedirect";

class Settings extends Component {
	render() {
		const {match} = this.props;
		return (
			<Switch>
				<CustomRedirect from={`${match.path}/`} to={`${match.path}/configuration`} exact status={301}/>
				<Route path={`${match.path}/configuration`} component={Configuration}/>
				<ProtectedRoute path={`${match.path}/notification`} component={Notification} can="manage_notification"/>
				<ProtectedRoute path={`${match.path}/marketplace`} component={Marketplace} can="manage_marketplace"/>
				<Route component={PageNotFound}/>
			</Switch>
		);
	}
}

export default pipe(
	withRouter
)(Settings);

if (module.hot) {
	module.hot.accept()
}