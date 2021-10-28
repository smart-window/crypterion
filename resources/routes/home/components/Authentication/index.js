import React, {Component} from 'react';
import Widget from "components/Widget";
import {Button} from "antd";
import {FormattedMessage} from "react-intl";
import context from "context";
import {showSignInForm, showSignUpForm} from "redux/actions/Auth";
import {withRouter} from "react-router-dom";
import formHelper from "support/Helpers/Form";
import {connect} from "react-redux";
import {pipe} from "support/utils/common";

class Authentication extends Component {
	handleSignUp = () => {
		this.props.showSignUpForm();
	};

	render() {
		return (
			<Widget styleName="cp-widget-bg m-0">
				<h1 className="fs-xxl font-weight-semi-bold mb-3 d-flex align-items-center">
					<span>
						<i className="la la-shield-alt fs-3x mr-2"/>
					</span>
					<span>
						<FormattedMessage
							defaultMessage="Secure Escrow Trading"
							id="widget.authentication.title"/>
					</span>
				</h1>
				<p className="mb-4"
				   style={{lineHeight : 1.4}}>
					<FormattedMessage
						defaultMessage={
							"Join the peer-to-peer finance revolution. " +
							"The {name} Marketplace is here to radically transform the way you spend money. " +
							"Use hundreds of different payment methods to buy and sell bitcoin."
						}
						values={{
							name : <b>{context.name}</b>
						}}
						id="widget.authentication.body"/>
				</p>
				<Button type="dashed" icon="user-add"
				        onClick={this.handleSignUp}>
					<span>
						<FormattedMessage
							defaultMessage="Register Now"
							id="widget.authentication.button_content"/>
					</span>
				</Button>
			</Widget>
		);
	}
}

export default pipe(
	formHelper(),
	connect(
		null,
		{
			showSignInForm,
			showSignUpForm
		}
	),
	withRouter,
)(Authentication);