import React, {Component} from "react";
import {connect} from "react-redux";
import LocaleSelector from "./components/LocaleSelector";
import UserMenu from "./components/UserMenu";
import {Layout} from 'antd';
import {toggleNavMenu} from "admin/redux/actions/Settings";
import * as ThemeSettings from "admin/constants/ThemeSettings";


class NoNavigation extends Component {
	render() {
		const {windowSize, navCollapsed} = this.props;
		return (
			<React.Fragment>
				<Layout.Header>
					{windowSize.width < ThemeSettings.TAB_BREAKPOINT && (
						<div className="cp-toggle-btn mr-3">
							<i className="cp-icon-btn la la-bars"
							   onClick={() => {
								   this.props.toggleNavMenu(!navCollapsed);
							   }}/>
						</div>
					)}

					<ul className="cp-header-items ml-auto">
						<li className="cp-user-info">
							<UserMenu/>
						</li>

						<li className="cp-language ml-1">
							<LocaleSelector/>
						</li>
					</ul>
				</Layout.Header>
			</React.Fragment>
		);
	}
}

const mapStateToProps = ({
	settings : {
		windowSize,
		navCollapsed,
	},
}) => ({
	windowSize,
	navCollapsed,
});


export default connect(
	mapStateToProps,
	{
		toggleNavMenu,
	}
)(NoNavigation);
