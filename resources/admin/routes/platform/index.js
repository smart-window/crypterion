import {pipe} from "admin/support/utils/common";
import React, {Component} from 'react';
import {Route, Switch, withRouter} from "react-router-dom";
import CustomRedirect from "admin/components/CustomRedirect";
import ProtectedRoute from "admin/components/ProtectedRoute";
import PageNotFound from "admin/components/PageNotFound";
import Customize from "./components/customize";
import Translation from "./components/translation";
import Integration from "./components/integration";

class Platform extends Component {
	render() {
		const {match} = this.props;
		return (
			<Switch>
				<CustomRedirect from={`${match.path}/`} to={`${match.path}/customize`} exact status={301}/>
				<ProtectedRoute path={`${match.path}/integration`} component={Integration} can="manage_integration"/>
				<ProtectedRoute path={`${match.path}/customize`} component={Customize} can="manage_customization"/>
				<ProtectedRoute path={`${match.path}/translation`} component={Translation} can="manage_translation"/>
				<Route component={PageNotFound}/>
			</Switch>
		);
	}
}

export default pipe(
	withRouter
)(Platform);

if (module.hot) {
	module.hot.accept()
}