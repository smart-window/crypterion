import React from 'react';
import CustomRedirect from "components/CustomRedirect";
import ProtectedRoute from "components/ProtectedRoute"
import {Route, Switch} from "react-router-dom";
import BuyCoin from "./components/buyCoin";
import CreateOffer from "./components/createOffer";
import SellCoin from "./components/sellCoin";
import Offer from "./components/offer";
import PageNotFound from "components/PageNotFound";


const Marketplace = ({match}) => {
	const path = match.path;
	return (
		<Switch>
			<CustomRedirect from={`${path}/`} to={`${path}/buy_coin`}
			                exact status={301}/>
			<Route path={`${path}/offer/:slug`} component={Offer}/>
			<Route path={`${path}/buy_coin`} component={BuyCoin}/>
			<ProtectedRoute path={`${path}/create_offer`} component={CreateOffer}/>
			<Route path={`${path}/sell_coin`} component={SellCoin}/>
			<Route component={PageNotFound}/>
		</Switch>
	);
};

export default Marketplace;

if (module.hot) {
	module.hot.accept()
}