import React, {Component} from 'react';
import LogoIcon from "./components/LogoIcon";
import LogoDark from "./components/LogoDark";
import Logo from "./components/Logo";
import Favicon from "./components/Favicon";

class Brand extends Component {
	render() {
		return (
			<React.Fragment>
				<LogoIcon/>
				<LogoDark/>
				<Logo/>
				<Favicon/>
			</React.Fragment>
		);
	}
}

export default Brand;