import React, {Component} from "react";
import {connect} from "react-redux";
import {Drawer, Layout} from "antd";
import {TAB_BREAKPOINT} from "admin/constants/ThemeSettings";
import Navigation from "./components/Navigation";

import {toggleNavMenu, updateWindowSize} from "admin/redux/actions/Settings";

export class Sidebar extends Component {
	onToggleCollapsedNav = () => {
		this.props.toggleNavMenu(true);
	};

	componentDidMount() {
		this.setWindowSize();
		window.addEventListener('resize', this.setWindowSize);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.setWindowSize);
	}

	setWindowSize = () => {
		const {innerWidth, innerHeight} = window;
		this.props.updateWindowSize(innerWidth, innerHeight);
	};

	shouldRenderDrawer() {
		const {windowSize} = this.props;
		return windowSize.width < TAB_BREAKPOINT
	}

	render() {
		const {navCollapsed} = this.props;

		return (
			<React.Fragment>
				{this.shouldRenderDrawer() ?
					<Drawer
						closable={false}
						className={`cp-drawer-sidebar cp-drawer-sidebar-dark`}
						placement="left"
						onClose={this.onToggleCollapsedNav}
						visible={!navCollapsed}>
						<Navigation/>
					</Drawer> :
					<Layout.Sider
						theme={"dark"}
						className={`cp-app-sidebar cp-fixed-sidebar cp-layout-sider-dark`}
						trigger={null}>
						<Navigation/>
					</Layout.Sider>
				}
			</React.Fragment>
		)
	}
}

const mapStateToProps = ({
	settings : {
		navCollapsed,
		windowSize,
	}
}) => ({
	navCollapsed,
	windowSize,
});

const mapDispatchToProps = {
	updateWindowSize,
	toggleNavMenu,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Sidebar);
