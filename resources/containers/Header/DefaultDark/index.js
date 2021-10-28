import React, {Component} from "react";
import {connect} from "react-redux";
import {Layout} from 'antd';
import {setLocale, toggleNavMenu} from "redux/actions/Settings";
import UserMenu from "../components/UserMenu";
import AppNotification from "../components/AppNotification";
import MailNotification from "../components/MailNotification";
import Auth from "support/Auth";

import QuickMarketplaceSearch from "components/QuickMarketplaceSearch";
import Navigation from "../components/Navigation";
import Logo from "../components/Logo";
import QuickLinks from "../components/QuickLinks";
import LocaleSelector from "../components/LocaleSelector";
import AuthLinks from "../components/AuthLinks";

class DefaultDark extends Component {
	render() {
		const {auth} = this.props;

		return (
			<div className="cp-header-horizontal cp-header-horizontal-dark">
				<div className="cp-header-horizontal-top">
					<div className="cp-container">
						<div className="cp-header-horizontal-top-flex">
							<AuthLinks/>
						</div>
					</div>
				</div>


				<Layout.Header className="cp-header-horizontal-main">
					<div className="cp-container content">
						<div className="cp-header-horizontal-main-flex">
							<Logo type="lg"/>

							<div style={{minWidth : 320}}
							     className="ml-3 d-none d-lg-flex">
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
									<LocaleSelector/>
								</li>

								<li className="cp-user-info">
									<UserMenu/>
								</li>
							</ul>
						</div>
					</div>
				</Layout.Header>

				<div className="cp-header-horizontal-nav">
					<div className="cp-container">
						<div className="cp-header-horizontal-nav-flex">
							<Navigation/>
							<QuickLinks/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = ({
	settings : {
		locale,
		navCollapsed
	},
	auth
}) => ({
	locale,
	navCollapsed,
	auth : new Auth(auth)
});


export default connect(
	mapStateToProps,
	{
		toggleNavMenu,
		setLocale
	}
)(DefaultDark);
