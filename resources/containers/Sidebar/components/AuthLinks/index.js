import React, {Component} from "react";
import {connect} from "react-redux";
import Auth from "support/Auth";
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import {Tooltip} from 'antd';
import {showSignInForm, showSignUpForm} from "redux/actions/Auth";
import {Link} from "react-router-dom";
import {pipe} from "support/utils/common";

const messages = defineMessages({
	wallet : {
		defaultMessage : "Wallet",
		id             : "common.wallet"
	},

	trades : {
		defaultMessage : "Trades",
		id             : "common.trades"
	},

	notification : {
		defaultMessage : "Notification",
		id             : "common.notification"
	},

	chats : {
		defaultMessage : "Chats",
		id             : "common.chats"
	},

	contacts : {
		defaultMessage : "Contacts",
		id             : "common.contacts"
	},
});

class AuthLinks extends Component {
	handleSignIn = () => {
		this.props.showSignInForm();
	};

	handleSignUp = () => {
		this.props.showSignUpForm();
	};

	render() {
		const {auth, intl} = this.props;

		return (
			<ul className="cp-app-nav">
				{auth.check() ?
					<React.Fragment>
						<li>
							<Tooltip title={intl.formatMessage(messages.wallet)}>
								<Link to={`/wallets`}>
									<i className="la la-wallet"/>
								</Link>
							</Tooltip>
						</li>
						<li>
							<Tooltip title={intl.formatMessage(messages.trades)}>
								<Link to={`/profile/${auth.user.name}/trades`}>
									<i className="la la-balance-scale"/>
								</Link>
							</Tooltip>
						</li>
						<li>
							<Tooltip title={intl.formatMessage(messages.contacts)}>
								<Link to={`/profile/${auth.user.name}/contacts`}>
									<i className="la la-address-book"/>
								</Link>
							</Tooltip>
						</li>
						<li>
							<Tooltip title={intl.formatMessage(messages.chats)}>
								<Link to={`/chat`}>
									<i className="la la-comments"/>
								</Link>
							</Tooltip>
						</li>
					</React.Fragment> :

					<React.Fragment>
						<li className="cp-pointer d-flex align-items-center border-right justify-content-center"
						    onClick={this.handleSignIn}>
							<i className="la la-sign-in-alt mr-1"/>

							<span className="ml-1">
								<FormattedMessage
									defaultMessage="Login"
									id="auth.login"/>
							</span>
						</li>

						<li className="cp-pointer d-flex align-items-center justify-content-center"
						    onClick={this.handleSignUp}>
							<i className="la la-user-plus mr-1"/>

							<span className="ml-1">
								<FormattedMessage
									defaultMessage="Register"
									id="auth.register"/>
							</span>
						</li>
					</React.Fragment>
				}
			</ul>
		);
	}
}

const mapStateToProps = ({
	auth
}) => ({
	auth : new Auth(auth)
});

export default pipe(
	connect(
		mapStateToProps,
		{
			showSignInForm,
			showSignUpForm
		}
	),
	injectIntl
)(AuthLinks);