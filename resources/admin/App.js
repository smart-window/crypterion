import React, {Component} from "react";
import {cold, hot, setConfig} from 'react-hot-loader';
import Container from "admin/containers";

class App extends Component {
	render() {
		return (
			<Container/>
		);
	}
}


setConfig({
	onComponentRegister : (type, name, file) => {
		return file.indexOf('node_modules') > 0 && cold(type)
	},

	logLevel : 'debug'
});

export default hot(module)(App);