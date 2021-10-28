import React, {Component} from "react";
import {Button, Form, Icon, Input, Modal} from "antd";
import {connect} from "react-redux";
import formHelper from "support/Helpers/Form";
import {handleFormError, handleFormSuccess} from "support/utils/promise";
import {defineMessages, FormattedMessage} from "react-intl";
import URLSearchParams from '@ungap/url-search-params';
import ReCaptcha from "../ReCaptcha";
import {hideSignUpForm, setAuthUser, showSignUpForm} from "redux/actions/Auth";
import ApiService from "support/Services/Api";
import {pipe} from "support/utils/common";
import {withRouter} from "react-router-dom";
import {isEmpty} from "lodash";

const messages = defineMessages({
	username : {
		defaultMessage : "Username",
		id             : "auth.username"
	},

	email : {
		defaultMessage : "Email",
		id             : "auth.email"
	},

	successful : {
		defaultMessage : "Registered Successfully!",
		id             : "auth.registered_successful"
	},

	password : {
		defaultMessage : "Password",
		id             : "auth.password"
	},

	verifyPassword : {
		defaultMessage : "Verify Password",
		id             : "auth.verify_password"
	},

	invalidUsername : {
		defaultMessage : "Invalid username format.",
		id             : "auth.invalid_username"
	},
});

class SignUpModal extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			loading : false
		}
	}

	handleSubmit = (e) => {
		e.preventDefault();

		const {axios, route} = this.api;
		const endpoint = route('auth.register');
		const {form, intl} = this.props;

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				axios.post(endpoint.url(), values)
					.then(response => handleFormSuccess(response, form, (data) => {
						this.props.hideSignUpForm();
						this.setState({loading : false});
						window.location.reload();
					}, intl.formatMessage(messages.successful)))
					.catch(error => handleFormError(error, form, values, () => {
						this.setState({loading : false});
					}));

				this.setState({loading : true});
			}
		});
	};

	componentDidMount() {
		this.handleShowSignUp();
	}

	handleShowSignUp = () => {
		const {location} = this.props;
		const params = new URLSearchParams(location.search);

		if (params.get('signup')) {
			this.props.showSignUpForm();
		}
	};

	componentWillUnmount() {
		this.api.cancel()
	}

	handleCancel = () => {
		this.props.hideSignUpForm();
	};

	render() {
		const {loading} = this.state;
		const {signUpFormVisibility, intl, recaptcha, form} = this.props;
		const {getFieldDecorator, getFieldError} = form;

		return (
			<Modal visible={signUpFormVisibility}
			       className="cp-login"
			       footer={null}
			       onCancel={this.handleCancel}>

				<div className="text-center cp-login-header">
					<h1 className="cp-login-title">
						<FormattedMessage
							defaultMessage="Sign Up"
							id="auth.sign_up"/>
					</h1>
				</div>

				<Form onSubmit={this.handleSubmit}>
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

					<Form.Item>
						{getFieldDecorator('name', {
							rules : [
								{required : true},
								{
									pattern : /^[A-z0-9_\-.]{3,16}$/,
									message : intl.formatMessage(messages.invalidUsername)
								},
							],
						})(
							<Input prefix={<Icon type="user"/>}
							       placeholder={intl.formatMessage(messages.username)}/>
						)}
					</Form.Item>

					<Form.Item>
						{getFieldDecorator('password', {
							rules : [
								{required : true}
							],
						})(
							<Input.Password placeholder={intl.formatMessage(messages.password)}
							                prefix={<Icon type="lock"/>}/>
						)}
					</Form.Item>

					<Form.Item>
						{getFieldDecorator('password_confirmation', {
							rules : [
								{required : true}
							],
						})(
							<Input.Password placeholder={intl.formatMessage(messages.verifyPassword)}
							                prefix={<Icon type="lock"/>}/>
						)}
					</Form.Item>

					{recaptcha.enable ?
						<Form.Item>
							{getFieldDecorator('recaptcha', {
								rules : [
									{required : true}
								],
							})(
								<ReCaptcha errors={getFieldError('recaptcha')}
								           settings={recaptcha}/>
							)}
						</Form.Item> : null
					}

					<Form.Item className="text-center mt-5">
						<Button loading={loading}
						        htmlType="submit" type="primary">
							<span>
								<FormattedMessage
									defaultMessage="Register"
									id="auth.register"/>
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
		signUpFormVisibility
	},
	settings : {
		recaptcha
	},
}) => ({
	signUpFormVisibility,
	recaptcha
});


export default pipe(
	connect(
		mapStateToProps,
		{
			hideSignUpForm,
			setAuthUser,
			showSignUpForm,
		}
	),
	formHelper(),
	withRouter,
)(SignUpModal);