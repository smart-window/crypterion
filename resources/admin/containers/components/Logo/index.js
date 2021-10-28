import React, {Component} from 'react';
import {connect} from "react-redux";
import * as ThemeSettings from "admin/constants/ThemeSettings";
import context from "admin/context";

class AuthLogo extends Component {
	isDarkTheme() {
		const {theme, themeType} = this.props;

		return themeType === ThemeSettings.THEME_TYPE_DARK ||
			themeType === ThemeSettings.THEME_TYPE_SEMI_DARK ||
			theme === 'dark';
	};

	render() {
		const {styleName} = this.props;
		return (
			<div className="mx-2 d-inline-block mx-auto">
				<a href="/" className="cp-sidebar-logo">
					{!this.isDarkTheme() ? (
						<img alt={context.name}
						     src={context.logoDarkUrl || require("assets/images/logo-dark.png")}
						     className={styleName}/>
					) : (
						<img alt={context.name}
						     src={context.logoUrl || require("assets/images/logo.png")}
						     className={styleName}/>
					)}
				</a>
			</div>

		);
	}
}

const mapStateToProps = ({
	settings : {
		navStyle,
		themeType,
		width
	}
}) => ({
	navStyle,
	themeType,
	width
});

export default connect(
	mapStateToProps
)(AuthLogo);