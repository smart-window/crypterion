import React, {Component} from "react";
import {connect} from "react-redux";
import {Layout} from 'antd';
import {setLocale, toggleNavMenu} from "redux/actions/Settings";

import AppNotification from "../components/AppNotification";
import MailNotification from "../components/MailNotification";
import Auth from "support/Auth";

import QuickMarketplaceSearch from "components/QuickMarketplaceSearch";
import Logo from "../components/Logo";
import LocaleSelector from "../components/LocaleSelector";
import {NAV_STYLE_VERTICAL_DRAWER, TAB_BREAKPOINT} from "constants/ThemeSettings";


class NoNavigation extends Component {
	constructor(props) {
		super(props);

		this.state = {
			searchText : '',
		};
	}

	updateSearchChatUser = (evt) => {
		this.setState({
			searchText : evt.target.value,
		});
	};

	shouldRenderDrawer() {
		const {windowSize, navStyle} = this.props;
		return navStyle === NAV_STYLE_VERTICAL_DRAWER ||
			windowSize.width < TAB_BREAKPOINT
	}

	render() {
		const {navCollapsed, auth} = this.props;

		return (
			<React.Fragment>
				<Layout.Header>
					{this.shouldRenderDrawer() && (
						<div className="cp-toggle-btn mr-3">
							<i onClick={() => {
								   this.props.toggleNavMenu(!navCollapsed);
							   }}
							   className="cp-icon-btn la la-bars"/>
						</div>
					)}

					<Logo/>

					<div style={{minWidth : 320}}
					     className="d-none d-lg-flex">
						<QuickMarketplaceSearch/>
					</div>

					<ul className="cp-header-items ml-auto">
						{auth.check() && (
							<React.Fragment>
								<li className="cp-notify">
									<AppNotification/>
								</li>

								<li className="cp-msg">
									<MailNotification/>
								</li>
							</React.Fragment>
						)}

						<li className="cp-language">
							<LocaleSelector withName/>
						</li>
					</ul>
				</Layout.Header>
			</React.Fragment>
		);
	}
}

const mapStateToProps = ({
	settings : {
		locale,
		navCollapsed,
		windowSize,
		navStyle
	},
	auth
}) => ({
	locale,
	navCollapsed,
	windowSize,
	navStyle,
	auth : new Auth(auth)
});


export default connect(
	mapStateToProps,
	{
		toggleNavMenu,
		setLocale
	}
)(NoNavigation);
