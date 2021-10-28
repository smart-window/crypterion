import React, {Component} from "react";
import {Layout} from "antd";
import Header from "../Header/index";
import Sidebar from "../Sidebar/index";
import Footer from "../Footer/index";
import {
	NAV_STYLE_HORIZONTAL_BOTTOM,
	NAV_STYLE_HORIZONTAL_DARK,
	NAV_STYLE_HORIZONTAL_INSIDE,
	NAV_STYLE_HORIZONTAL_LIGHT,
	NAV_STYLE_HORIZONTAL_TOP,
	NAV_STYLE_VERTICAL_DRAWER,
	NAV_STYLE_VERTICAL_FIXED,
	NAV_STYLE_VERTICAL_MINI_SIDEBAR,
	TAB_BREAKPOINT
} from "constants/ThemeSettings";
import Routes from "routes/index";
import {connect} from "react-redux";
import SignInModal from "../components/SignInModal";
import SignUpModal from "../components/SignUpModal";
import {pipe} from "support/utils/common";

class Master extends Component {
	getHeaderComponent = () => {
		const {windowSize, navStyle} = this.props;

		if (windowSize.width >= TAB_BREAKPOINT) {
			switch (navStyle) {
				case NAV_STYLE_HORIZONTAL_BOTTOM:
					return <Header.BottomNavigation/>;
				case NAV_STYLE_HORIZONTAL_DARK:
					return <Header.DefaultDark/>;
				case NAV_STYLE_HORIZONTAL_LIGHT:
					return <Header.DefaultLight/>;
				case NAV_STYLE_VERTICAL_MINI_SIDEBAR:
				case NAV_STYLE_VERTICAL_FIXED:
				case NAV_STYLE_VERTICAL_DRAWER:
					return <Header.NoNavigation/>;
				case NAV_STYLE_HORIZONTAL_INSIDE:
					return <Header.InsideNavigation/>;
				case NAV_STYLE_HORIZONTAL_TOP:
					return <Header.TopNavigation/>;
				default :
					return null;
			}
		} else {
			return <Header.NoNavigation/>;
		}
	};


	getContainerClass = () => {
		const {navStyle} = this.props;
		if (navStyle !== NAV_STYLE_VERTICAL_FIXED) {
			return "cp-layout-content cp-container-wrap";
		} else {
			return "cp-layout-content";
		}
	};


	render() {

		return (
			<Layout className="cp-app-layout">
				<Sidebar/>

				<Layout>
					{this.getHeaderComponent()}
					<Layout.Content className={this.getContainerClass()}>
						<Routes/>

						<Footer/>
					</Layout.Content>
				</Layout>

				<SignInModal/>
				<SignUpModal/>
			</Layout>
		)
	}
}

const mapStateToProps = ({
	settings : {
		windowSize,
		navStyle
	}
}) => ({
	windowSize,
	navStyle
});

export default pipe(
	connect(
		mapStateToProps
	)
)(Master);

