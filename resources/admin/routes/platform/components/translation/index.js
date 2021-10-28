import React, {Component} from 'react';
import {Route, Switch} from "react-router-dom";
import Home from "./components/Home";
import Edit from "./components/Edit";

class Translation extends Component {
	render() {
		const {match} = this.props;
		return (
			<Switch>
				<Route path={`${match.path}/`} exact component={Home}/>
				<Route path={`${match.path}/:group`} component={Edit}/>
			</Switch>
		);
	}
}

export default Translation;