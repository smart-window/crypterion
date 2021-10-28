import React, {Component} from 'react';
import {Alert, Button, Form, Icon, Input, Radio} from "antd";
import {defineMessages, FormattedMessage} from "react-intl";
import ApiService from "support/Services/Api";
import SendEmailToken from "routes/auth/components/resetPassword/components/SendEmailToken";
import SendPhoneToken from "routes/auth/components/resetPassword/components/SendPhoneToken";
import VerifyEmailToken from "routes/auth/components/resetPassword/components/VerifyEmailToken";
import VerifyPhoneToken from "routes/auth/components/resetPassword/components/VerifyPhoneToken";
import {pipe} from "support/utils/common";
import formHelper from "support/Helpers/Form";
import {isEmpty} from "lodash";
import {handleFormError, handleFormSuccess} from "support/utils/promise";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import ReCaptcha from "containers/components/ReCaptcha";


const messages = defineMessages({
	successful : {
		defaultMessage : "Password changed Successfully.",
		id             : "reset_password.successful"
	},

	password : {
		defaultMessage : "Password",
		id             : "reset_password.password"
	},

	verifyPassword : {
		defaultMessage : "Verify Password",
		id             : "reset_password.verify_password"
	},
});

class ResetPassword extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			target         : "",
			verification   : "email",
			nonce          : "",
			confirmLoading : false,
			tokenSent      : false,
		}
	}

	componentWillUnmount() {
		this.api.cancel();
	}

	handleVerificationChange = (e) => {
		this.setState({
			verification : e.target.value,
		});
	};

	handleTokenSent = (target) => {
		this.setState({
			target    : target,
			tokenSent : true,
		})
	};

	handleTokenVerified = (nonce) => {
		this.setState({
			nonce : nonce
		})
	};

	resendToken = () => {
		this.setState({
			target    : "",
			tokenSent : false,
			nonce     : ""
		})
	};

	handleSubmit = (e) => {
		e.preventDefault();

		const {nonce, verification, target} = this.state;
		const {axios, route} = this.api;
		const {form, intl, history} = this.props;

		const endpoint = route('auth.reset-password.reset');

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				const requestData = {...values, token : nonce};
				requestData[verification] = target;

				axios.post(endpoint.url(), requestData)
					.then(response => handleFormSuccess(response, form, () => {
						this.setState({confirmLoading : false});
						if (!isEmpty(history)) history.replace("/");
					}, intl.formatMessage(messages.successful)))

					.catch(error => handleFormError(error, form, requestData, () => {
						this.setState({confirmLoading : false});
					}));

				this.setState({confirmLoading : true});
			}
		});
	};

	render() {
		const {intl, form, recaptcha} = this.props;
		const {verification, tokenSent, target, nonce, confirmLoading} = this.state;
		const {getFieldDecorator, getFieldError} = form;

		const radioStyle = {display : 'block', padding : '10px 0'};

		return (
			<div className="cp-login-container">
				<div className="cp-login-content">
					<div className="text-center cp-login-header">
						<h1 className="cp-login-title">
							<FormattedMessage
								defaultMessage="Reset Password"
								id="common.reset_password"/>
						</h1>
					</div>

					{!nonce && (
						<div className="text-justify">
							{!tokenSent ? (
								<Alert type="info"
								       message={
									       <FormattedMessage
										       defaultMessage={
											       "Select your preferred {verification} method to reset your password." +
											       " We will send you a code if this method is associated with any account and has been verified."
										       }
										       id="reset_password.select_method_info"
										       values={{
											       verification : (
												       <span className="font-weight-semi-bold">
													       <FormattedMessage
														       defaultMessage="Verification"
														       id="common.verification"/>
												       </span>
											       )
										       }}/>
								       }/>
							) : (
								<Alert type="success"
								       message={
									       <FormattedMessage
										       defaultMessage={
											       "A code has been sent to your selected method, " +
											       "you should receive it if it is associated with an account and has been verified. " +
											       "Enter the code received below to continue. {resend}"
										       }
										       id="reset_password.verify_token_info"
										       values={{
											       resend : (
												       <a className="font-weight-semi-bold"
												          onClick={this.resendToken}>
													       <FormattedMessage
														       defaultMessage="Resend Code?"
														       id="common.resend_code"/>
												       </a>
											       )
										       }}/>
								       }/>
							)}
						</div>
					)}

					<div className="mt-3">
						{!tokenSent && (
							<Radio.Group
								onChange={this.handleVerificationChange}
								value={verification}>
								<Radio style={radioStyle} value="email">
									<span className="font-weight-medium">
										<FormattedMessage
											defaultMessage="Email Address"
											id="common.email_address"/>
									</span>
								</Radio>

								<Radio style={radioStyle} value="phone">
									<span className="font-weight-medium">
										<FormattedMessage
											defaultMessage="Phone Number"
											id="common.phone_number"/>
									</span>
								</Radio>
							</Radio.Group>
						)}

						{!nonce ? (
							<div>
								{verification === "email" && (
									tokenSent && target ? (
										<VerifyEmailToken
											onVerified={this.handleTokenVerified}
											target={target}/>
									) : (
										<SendEmailToken
											onSent={this.handleTokenSent}/>
									)
								)}

								{verification === "phone" && (
									tokenSent && target ? (
										<VerifyPhoneToken
											onVerified={this.handleTokenVerified}
											target={target}/>
									) : (
										<SendPhoneToken
											onSent={this.handleTokenSent}/>
									)
								)}
							</div>
						) : (
							<Form onSubmit={this.handleSubmit}>
								<Form.Item>
									{getFieldDecorator('password', {
										rules : [
											{required : true}
										],
									})(
										<Input.Password
											placeholder={intl.formatMessage(messages.password)}
											prefix={<Icon type="lock"/>}/>
									)}
								</Form.Item>

								<Form.Item>
									{getFieldDecorator('password_confirmation', {
										rules : [
											{required : true}
										],
									})(
										<Input.Password
											placeholder={intl.formatMessage(messages.verifyPassword)}
											prefix={<Icon type="lock"/>}/>
									)}
								</Form.Item>

								{recaptcha.enable && (
									<Form.Item>
										{getFieldDecorator('recaptcha', {
											rules : [
												{required : true}
											],
										})(
											<ReCaptcha errors={getFieldError('recaptcha')}
											           settings={recaptcha}/>
										)}
									</Form.Item>
								)}

								<Form.Item className="text-center">
									<Button loading={confirmLoading}
									        htmlType="submit" type="primary">
										<span>
											<FormattedMessage
												defaultMessage="Change Password"
												id="common.change_password"/>
										</span>
									</Button>
								</Form.Item>
							</Form>
						)}
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = ({
	settings : {
		recaptcha
	},
}) => ({
	recaptcha
});

export default pipe(
	connect(
		mapStateToProps
	),
	formHelper(),
	withRouter
)(ResetPassword);