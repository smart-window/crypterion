import React from 'react';
import {matchPath, Redirect, Route, withRouter} from "react-router-dom";

/**
 * @return {null}
 */
function CustomRedirect({from, to, exact, strict, status, location}) {
	const {pathname} = location;

	if (typeof from !== "undefined") {
		const match = matchPath(pathname, {
			exact  : exact,
			path   : from,
			strict : strict,
		});

		if (match == null) return null;
	}

	return (
		<Route
			render={({staticContext}) => {
				if (staticContext) {
					staticContext.status = status ? status : 302;
				}

				return <Redirect exact={exact} strict={strict}
				                 from={from} to={to}/>;
			}}/>
	);
}

export default withRouter(CustomRedirect)