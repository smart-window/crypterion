import React, {Component} from "react";
import {connect} from "react-redux";
import {Drawer, Layout} from "antd";
import Navigation from "./components/Navigation";
import {setNavStyle, toggleNavMenu, updateWindowSize} from "redux/actions/Settings";
import {
	NAV_STYLE_VERTICAL_DRAWER,
	NAV_STYLE_VERTICAL_FIXED,
	NAV_STYLE_VERTICAL_MINI_SIDEBAR,
	TAB_BREAKPOINT,
	THEME_TYPE_LITE
} from "constants/ThemeSettings";

export class Sidebar extends Component {
	onToggleCollapsedNav = () => {
		const {navCollapsed} = this.props;
		this.props.toggleNavMenu(!navCollapsed);
	};

	getSidebarStyle() {
		const {navStyle} = this.props;
		let style = ["cp-fixed-sidebar"];

		if (!this.isLiteTheme()) {
			style.push("cp-layout-sider-dark")
		}

		if (navStyle === NAV_STYLE_VERTICAL_MINI_SIDEBAR) {
			style.push("cp-mini-sidebar");
		}

		return style.join(" ");
	};

	isLiteTheme() {
		return this.props.themeType === THEME_TYPE_LITE
	};

	getDrawerStyle() {
		let style = [];
		if (!this.isLiteTheme()) {
			style.push("cp-drawer-sidebar-dark")
		}

		return style.join(" ");
	};

	shouldCollapse() {
		return this.props.navStyle === NAV_STYLE_VERTICAL_MINI_SIDEBAR;
	};

	shouldRenderDrawer() {
		const {windowSize, navStyle} = this.props;
		return navStyle === NAV_STYLE_VERTICAL_DRAWER ||
			windowSize.width < TAB_BREAKPOINT
	}

	showSidebar = () => {
		let component = false;

		const {windowSize, navStyle} = this.props;

		if (windowSize.width >= TAB_BREAKPOINT) {
			switch (navStyle) {
				case NAV_STYLE_VERTICAL_DRAWER:
				case NAV_STYLE_VERTICAL_MINI_SIDEBAR:
				case NAV_STYLE_VERTICAL_FIXED:
					component = true;
			}
		}

		return component;
	};

	render() {
		const {navCollapsed} = this.props;

		return this.shouldRenderDrawer() ? (
			<Drawer
				closable={false}
				key={'drawer'}
				className={`cp-drawer-sidebar ${this.getDrawerStyle()}`}
				placement="left"
				onClose={this.onToggleCollapsedNav}
				visible={!navCollapsed}>
				<Navigation/>
			</Drawer>
		) : this.showSidebar() && (
			<Layout.Sider
				trigger={null}
				key={'sidebar'}
				className={`cp-app-sidebar ${this.getSidebarStyle()}`}
				collapsed={this.shouldCollapse()}
				theme={this.isLiteTheme() ? "lite" : "dark"}
				collapsible>
				<Navigation/>
			</Layout.Sider>
		)
	}
}

const mapStateToProps = ({
	settings : {
		navStyle,
		navCollapsed,
		windowSize,
		themeType,
		locale
	}
}) => ({
	navStyle,
	navCollapsed,
	windowSize,
	themeType,
	locale
});

export default connect(
	mapStateToProps,
	{
		setNavStyle,
		updateWindowSize,
		toggleNavMenu,
	}
)(Sidebar);
