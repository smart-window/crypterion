import React, {Component} from 'react';
import Auth from "support/Auth";
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";

import {showSignInForm, showSignUpForm,} from "redux/actions/Auth";

class AuthLinks extends Component {
	handleSignIn = () => {
		this.props.showSignInForm();
	};

	handleSignUp = () => {
		this.props.showSignUpForm();
	};

	render() {
		const {auth} = this.props;

		return (
			<React.Fragment>
				{auth.check() ?
					<div className="cp-login-links">
						<FormattedMessage
							id="common.user_greeting"
							defaultMessage="Hi, {name}"
							values={{
								name : (
									<b>{auth.user.name}</b>
								)
							}}/>
					</div> :
					<ul className="cp-login-links">
						<li onClick={this.handleSignIn}>
							<i className="la la-sign-in-alt mr-1"/>

							<span className="ml-1">
								<FormattedMessage
									defaultMessage="Login"
									id="auth.login"/>
							</span>
						</li>
						<li onClick={this.handleSignUp}>
							<i className="la la-user-plus mr-1"/>

							<span className="ml-1">
								<FormattedMessage
									defaultMessage="Register"
									id="auth.register"/>
							</span>
						</li>
					</ul>
				}
			</React.Fragment>
		);
	}
}

const mapStateToProps = ({
	auth
}) => ({
	auth : new Auth(auth)
});


export default connect(
	mapStateToProps,
	{
		showSignInForm,
		showSignUpForm
	}
)(AuthLinks);