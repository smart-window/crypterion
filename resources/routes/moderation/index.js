import React from 'react';
import CustomRedirect from "components/CustomRedirect";
import {Route, Switch} from "react-router-dom";
import DisputedTrades from "./components/disputedTrades";

const Moderation = ({match}) => {
	const path = match.path;
	return (
		<Switch>
			<CustomRedirect from={`${path}/`} to={`${path}/disputed_trades`}
			                exact status={301}/>
			<Route path={`${path}/disputed_trades`} component={DisputedTrades}/>
		</Switch>
	);
};

export default Moderation;