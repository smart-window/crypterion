import React, {Component} from 'react';
import Auth from "support/Auth";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";
import {defineMessages, FormattedMessage} from "react-intl";
import formHelper from "support/Helpers/Form";
import {Alert, Button, Form, Input} from "antd";
import ApiService from "support/Services/Api";
import {handleFormError, handleFormSuccess} from "support/utils/promise";
import {isEmpty} from "lodash";

const messages = defineMessages({
	twoFactorCode : {
		defaultMessage : "Enter two factor code...",
		id             : "profile.input_two_factor_code_placeholder"
	},
	password      : {
		defaultMessage : "Enter your password...",
		id             : "profile.input_password_placeholder"
	},
	successful : {
		defaultMessage : "Your action was successful.",
		id             : "profile.two_factor_request_action_successful"
	},
});

class Request extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			confirmLoading : false
		};
	}

	handleSubmit = (e) => {
		e.preventDefault();

		const {form, intl, onSuccess, user} = this.props;
		const {axios, route} = this.api;
		const endpoint = route('user.profile.two-factor-request', {
			name : user.name
		});

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				axios.post(endpoint.url(), values)
					.then(response => handleFormSuccess(response, form, (data) => {
						this.setState({confirmLoading : false});
						this.triggerSuccess(data);
					}, intl.formatMessage(messages.successful)))
					.catch(error => handleFormError(error, form, values, () => {
						this.setState({confirmLoading : false});
					}));

				this.setState({confirmLoading : true});
			}
		});
	};

	triggerSuccess(data) {
		const {onSuccess} = this.props;
		if (typeof onSuccess === "function") {
			return onSuccess(data);
		}
	}

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {confirmLoading} = this.state;
		const {intl, twoFactorEnabled, form} = this.props;
		const {getFieldDecorator} = form;

		return (
			<Form onSubmit={this.handleSubmit}>
				{!twoFactorEnabled ? (
					<React.Fragment>
						<div className="mb-2">
							<Alert type="warning"
							       message={
								       <FormattedMessage
									       defaultMessage={
										       "To setup your Two Factor with {google} or {authy}, " +
										       "you will need your unique two factor secret. " +
										       "Please verify your identity using your password."
									       }
									       values={{
										       authy  : <b>Authy</b>,
										       google : <b>Google Authenticator</b>
									       }}
									       id="profile.request_for_secret_with_password_info"/>
							       }
							       showIcon/>
						</div>
						<Form.Item labelAlign="left"
						           label={
							           <FormattedMessage
								           defaultMessage="Password"
								           id="profile.password"/>
						           }>
							{getFieldDecorator('password', {
								rules : [
									{required : true},
								],
							})(
								<Input.Password placeholder={intl.formatMessage(messages.password)}/>
							)}
						</Form.Item>
					</React.Fragment>
				) : (
					<React.Fragment>
						<div className="mb-2">
							<Alert type="warning"
							       message={
								       <FormattedMessage
									       defaultMessage={
										       "You need to verify your identity using your previous " +
										       "Two Factor setup before you can proceed."
									       }
									       id="profile.request_for_secret_with_token_info"/>
							       }
							       showIcon/>
						</div>

						<Form.Item labelAlign="left"
						           label={
							           <FormattedMessage
								           defaultMessage="Token"
								           id="profile.token"/>
						           }>
							{getFieldDecorator('token', {
								rules : [
									{required : true},
								],
							})(
								<Input placeholder={intl.formatMessage(messages.twoFactorCode)}/>
							)}
						</Form.Item>
					</React.Fragment>
				)}

				<div className="mt-5">
					<Button type="primary" block
					        icon="lock" htmlType="submit"
					        loading={confirmLoading}>
						<span>
							<FormattedMessage
								defaultMessage="Request For Secret"
								id="profile.request_for_secret"/>
						</span>
					</Button>
				</div>
			</Form>
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
		mapStateToProps
	),
	formHelper(),
)(Request);