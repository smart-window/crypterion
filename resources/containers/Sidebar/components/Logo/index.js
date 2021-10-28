import React, {Component} from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";

import {setNavStyle} from "redux/actions/Settings";
import * as ThemeSettings from "constants/ThemeSettings";
import context from "context";

class Logo extends Component {
	toggleSidebar = () => {
		const {navStyle} = this.props;

		if (navStyle === ThemeSettings.NAV_STYLE_VERTICAL_FIXED) {
			this.props.setNavStyle(ThemeSettings.NAV_STYLE_VERTICAL_MINI_SIDEBAR);
		} else {
			this.props.setNavStyle(ThemeSettings.NAV_STYLE_VERTICAL_FIXED);
		}
	};

	getToggleIconType = () => {
		let iconType = 'menu-fold';
		const {navStyle} = this.props;

		if (navStyle === ThemeSettings.NAV_STYLE_VERTICAL_MINI_SIDEBAR) {
			iconType = 'menu-unfold';
		}

		return iconType;
	};

	isDarkTheme() {
		const {theme, themeType} = this.props;

		return themeType === ThemeSettings.THEME_TYPE_DARK ||
			themeType === ThemeSettings.THEME_TYPE_SEMI_DARK ||
			theme === 'dark';
	};

	isVerticalDrawerNavStyle() {
		const {width, navStyle} = this.props;
		return (
			navStyle === ThemeSettings.NAV_STYLE_VERTICAL_DRAWER
		) || (
			width < ThemeSettings.TAB_BREAKPOINT &&
			navStyle === ThemeSettings.NAV_STYLE_VERTICAL_FIXED
		);
	};

	render() {
		return (
			<div className={`cp-layout-sider-header ${this.isVerticalDrawerNavStyle() && "no-toggle"}`}>
				{!this.isVerticalDrawerNavStyle() && (
					<div className="cp-toggle-btn">
						<i className={`cp-icon-btn la la-bars ${this.isDarkTheme() && 'cp-text-white'}`}
						   onClick={() => this.toggleSidebar()}/>
					</div>
				)}

				<Link to="/" className="cp-sidebar-logo">
					{this.isDarkTheme() ?
						<img alt={context.name} src={context.logoUrl || require("assets/images/logo.png")}/> :
						<img alt={context.name} src={context.logoDarkUrl || require("assets/images/logo-dark.png")}/>
					}
				</Link>
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
	mapStateToProps,
	{
		setNavStyle
	}
)(Logo);
