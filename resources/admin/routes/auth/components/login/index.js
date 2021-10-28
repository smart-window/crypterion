import React, {Component} from 'react';
import Logo from "admin/containers/components/Logo";
import {pipe} from "admin/support/utils/common"
import ApiService from "admin/support/Services/Api";
import {Button, Divider, Form, Icon, Input} from "antd";
import {connect} from "react-redux";
import formHelper from "admin/support/Helpers/Form";
import {setAuthUser} from "admin/redux/actions/Auth";
import {handleFormError, handleFormSuccess} from "admin/support/utils/promise";
import ReCaptcha from "admin/containers/components/ReCaptcha";
import {withRouter} from "react-router-dom";
import context from "admin/context";
import {defineMessages, FormattedMessage} from "react-intl";
import {has, isEmpty} from "lodash";

const messages = defineMessages({
	username : {
		defaultMessage : "Username",
		id             : "admin.auth.username"
	},

	successful : {
		defaultMessage : "Login Successful.",
		id             : "admin.auth.login_successful"
	},

	email : {
		defaultMessage : "Email",
		id             : "admin.auth.email"
	},

	password : {
		defaultMessage : "Password",
		id             : "admin.auth.password"
	},

	token : {
		defaultMessage : "Two Factor Token",
		id             : "admin.auth.two_factor_token"
	},
});

class Login extends Component {
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
		const endpoint = route('admin.auth.login');
		const {form, intl} = this.props;

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				axios.post(endpoint.url(), values)
					.then(response => handleFormSuccess(response, form, () => {
						this.setState({loading : false});
						window.location.replace('/admin');
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

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {withTwoFactor, loading} = this.state;
		const {intl, recaptcha, form} = this.props;
		const {getFieldDecorator, getFieldError} = form;
		const {authUsername} = context;

		return (
			<div className="cp-login-container p-0"
			     style={{height : '100vh'}}>
				<div className="cp-login-content">
					<div className="mb-5 text-center">
						<Logo styleName="w-75"/>

						<div className="mt-2">
							<FormattedMessage
								defaultMessage="Control Panel"
								id="common.control_panel"/>
						</div>
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
										id="admin.auth.two_factor_verification"/>
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
										id="admin.auth.login"/>
								</span>
							</Button>
						</Form.Item>
					</Form>
				</div>
			</div>
		);
	}
}

const mapStateToProps = ({
	settings : {
		recaptcha
	}
}) => ({
	recaptcha
});

export default pipe(
	connect(
		mapStateToProps,
		{
			setAuthUser,
		}
	),
	formHelper(),
	withRouter,
)(Login);