import React, {Component} from "react";
import {Button, Checkbox, Divider, Form, Icon, Input, Modal} from "antd";
import {connect} from "react-redux";
import formHelper from "support/Helpers/Form";
import {hideSignInForm, setAuthUser} from "redux/actions/Auth";
import {defineMessages, FormattedMessage} from "react-intl";
import {handleFormError, handleFormSuccess} from "support/utils/promise";
import ReCaptcha from "../ReCaptcha";
import {pipe} from "support/utils/common"
import context from "context";
import ApiService from "support/Services/Api";
import {has, isEmpty} from "lodash";
import menuItemLinks from "containers/utils/menuItemLinks";
import {generatePath, withRouter} from "react-router-dom";

const messages = defineMessages({
	username: {
		defaultMessage: "Username",
		id: "auth.username"
	},

	successful: {
		defaultMessage: "Login Successful.",
		id: "auth.login_successful"
	},

	email: {
		defaultMessage: "Email",
		id: "auth.email"
	},

	password: {
		defaultMessage: "Password",
		id: "auth.password"
	},

	token: {
		defaultMessage: "Two Factor Token",
		id: "auth.two_factor_token"
	},
});


class SignInModal extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			withTwoFactor : false,
			loading       : false
		}
	}

	handleSubmit = (e) => {
		e.preventDefault();

		const {axios, route} = this.api;
		const endpoint = route('auth.login');
		const {form, intl} = this.props;

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				axios.post(endpoint.url(), values)
					.then(response => handleFormSuccess(response, form, () => {
						this.props.hideSignInForm();
						this.setState({loading : false});
						window.location.reload();
					}, intl.formatMessage(messages.successful)))
					.catch(error => handleFormError(error, form, values, () => {
						this.setState({loading : false});

						if (has(error, 'response.data.errors.token')) {
							this.setState({withTwoFactor : true});
						}
					}));

				this.setState({loading : true});
			}
		});
	};

	resetPassword = () => {
		const {history} = this.props;
		this.props.hideSignInForm();

		const path = generatePath(menuItemLinks['auth.reset_password'].path);

		if(!isEmpty(history) && path) {
			return history.push(path);
		}
	};

	handleCancel = () => {
		this.props.hideSignInForm();
	};

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {withTwoFactor, loading} = this.state;
		const {signInFormVisibility, intl, recaptcha} = this.props;
		const {getFieldDecorator, getFieldError} = this.props.form;
		const {authUsername} = context;

		return (
			<Modal visible={signInFormVisibility}
			       className="cp-login"
			       footer={null}
			       onCancel={this.handleCancel}>

				<div className="text-center cp-login-header">
					<h1 className="cp-login-title">
						<FormattedMessage
							defaultMessage="Sign In"
							id="auth.sign_in"/>
					</h1>
				</div>

				<Form onSubmit={this.handleSubmit}>
					{authUsername === 'name' ?
						<Form.Item>
							{getFieldDecorator('name', {
								rules : [
									{required : true},
								],
							})(
								<Input prefix={<Icon type="user"/>}
								       placeholder={intl.formatMessage(messages.username)}/>
							)}
						</Form.Item> :
						<Form.Item>
							{getFieldDecorator('email', {
								rules : [
									{type : 'email'},
									{required : true}
								],
							})(
								<Input prefix={<Icon type="mail"/>}
								       placeholder={intl.formatMessage(messages.email)}/>
							)}
						</Form.Item>
					}

					<Form.Item>
						{getFieldDecorator('password', {
							rules : [
								{required : true}
							],
						})(
							<Input.Password prefix={<Icon type="lock"/>}
							                placeholder={intl.formatMessage(messages.password)}/>
						)}
					</Form.Item>

					{withTwoFactor && (
						<React.Fragment>
							<Divider>
								<FormattedMessage
									defaultMessage="Two Factor Verification"
									id="auth.two_factor_verification"/>
							</Divider>

							<Form.Item>
								{getFieldDecorator('token', {
									rules : [
										{required : true}
									],
								})(
									<Input placeholder={intl.formatMessage(messages.token)}/>
								)}
							</Form.Item>
						</React.Fragment>
					)}

					<Form.Item className="text-left">
						<div style={{lineHeight : 1.3}}
						     className="d-flex justify-content-between">
							{getFieldDecorator('remember', {
								valuePropName : 'checked',
								initialValue  : true,
							})(
								<Checkbox>
									<FormattedMessage
										defaultMessage="Remember me"
										id="auth.remember_me"/>
								</Checkbox>
							)}

							<a onClick={this.resetPassword}>
								<FormattedMessage
									defaultMessage="Forgot Password"
									id="auth.forgot_password"/>
							</a>
						</div>
					</Form.Item>

					{recaptcha.enable ?
						<Form.Item>
							{getFieldDecorator('recaptcha', {
								rules : [
									{required : true}
								],
							})(
								<ReCaptcha
									errors={getFieldError('recaptcha')}
									settings={recaptcha}/>
							)}
						</Form.Item> : null
					}

					<Form.Item className="text-center mt-5">
						<Button type="primary" loading={loading}
						        htmlType="submit">
							<span>
								<FormattedMessage
									defaultMessage="Login"
									id="auth.login"/>
							</span>
						</Button>
					</Form.Item>
				</Form>
			</Modal>
		);
	}
}

const mapStateToProps = ({
	auth     : {
		signInFormVisibility
	},
	settings : {
		recaptcha
	}
}) => ({
	signInFormVisibility,
	recaptcha
});

export default pipe(
	connect(
		mapStateToProps,
		{
			hideSignInForm,
			setAuthUser,
		}
	),
	formHelper(),
	withRouter,
)(SignInModal);