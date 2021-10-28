import React, {Component} from "react";
import {Route, Switch, withRouter} from "react-router-dom";
import ProtectedRoute from "components/ProtectedRoute"
import {pipe} from "support/utils/common";
import CustomRedirect from "components/CustomRedirect";
import lazy from "support/common/lazy";
import PageNotFound from "components/PageNotFound";
import PageBreadcrumb from "components/PageBreadcrumb";
import context from "context";
import {Helmet} from "react-helmet";
import {injectIntl} from "react-intl";

const Home = lazy(() => import(/* webpackPrefetch: true */ './home'));
const Auth = lazy(() => import(/* webpackPrefetch: true */ './auth'));
const Profile = lazy(() => import(/* webpackPrefetch: true */ './profile'));
const Wallets = lazy(() => import(/* webpackPrefetch: true */ './wallets'));
const Marketplace = lazy(() => import(/* webpackPrefetch: true */ './marketplace'));
const Moderation = lazy(() => import(/* webpackPrefetch: true */ './moderation'));
const Chat = lazy(() => import(/* webpackPrefetch: true */ './chat'));

class Routes extends Component {
	render() {
		return (
			<div className="cp-main-content-wrapper">
				<Helmet>
					<title>
						{context.name}
					</title>
				</Helmet>

				<PageBreadcrumb/>

				<Switch>
					<CustomRedirect from="/" to="/home" exact status={301}/>
					<Route path="/home" component={Home}/>
					<Route path="/auth" component={Auth}/>
					<Route path="/profile/:name" component={Profile}/>
					<ProtectedRoute path="/chat" component={Chat}/>
					<ProtectedRoute path="/wallets" component={Wallets}/>
					<Route path="/marketplace" component={Marketplace}/>
					<Route path="/moderation" component={Moderation}/>
					<Route component={PageNotFound}/>
				</Switch>
			</div>
		);
	}
}

export default pipe(
	withRouter,
	injectIntl
)(Routes);
